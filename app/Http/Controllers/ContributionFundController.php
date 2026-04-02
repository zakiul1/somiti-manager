<?php

namespace App\Http\Controllers;

use App\Models\ContributionMonth;
use App\Models\ContributionPayment;
use App\Models\Setting;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\ChromiumPdfService;
use App\Support\AppLocale;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ContributionFundController extends Controller
{
    public function __construct(private readonly ChromiumPdfService $pdf)
    {
    }

    public function index(Request $request): Response
    {
        $year = (int) ($request->integer('year') ?: now()->year);
        $admins = $this->memberQuery()->get();
        $months = ContributionMonth::query()
            ->with(['payments', 'payments.member:id,name'])
            ->whereYear('month_date', $year)
            ->orderByDesc('month_date')
            ->get();

        $monthSummaries = $months->map(fn (ContributionMonth $month) => $this->transformMonth($month, $admins));

        $totalExpected = (float) $months->sum(fn (ContributionMonth $month) => (float) $month->expected_amount * $admins->count());
        $totalCollected = (float) ContributionPayment::query()
            ->whereHas('month', fn ($query) => $query->whereYear('month_date', $year))
            ->sum('amount');

        $latestMonth = $months->sortByDesc('month_date')->first();
        $latestSummary = $latestMonth ? $this->transformMonth($latestMonth, $admins) : null;

        $memberStats = $admins->map(function (User $user) use ($year) {
            $paidTotal = (float) ContributionPayment::query()
                ->where('user_id', $user->id)
                ->whereHas('month', fn ($query) => $query->whereYear('month_date', $year))
                ->sum('amount');

            return [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->getRoleNames()->first() ?? 'admin',
                'paid_total' => round($paidTotal, 2),
            ];
        })->sortByDesc('paid_total')->values();

        return Inertia::render('contribution-fund/index', [
            'filters' => ['year' => $year],
            'stats' => [
                'member_count' => $admins->count(),
                'month_count' => $months->count(),
                'total_expected' => round($totalExpected, 2),
                'total_collected' => round($totalCollected, 2),
                'total_due' => round(max(0, $totalExpected - $totalCollected), 2),
                'latest_month' => $latestSummary,
            ],
            'months' => $monthSummaries->take(12)->values(),
            'memberStats' => $memberStats,
        ]);
    }

    public function months(Request $request): Response
    {
        $year = (int) ($request->integer('year') ?: now()->year);
        $admins = $this->memberQuery()->get();

        $months = ContributionMonth::query()
            ->with('payments')
            ->whereYear('month_date', $year)
            ->orderByDesc('month_date')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (ContributionMonth $month) => $this->transformMonth($month, $admins));

        return Inertia::render('contribution-fund/months', [
            'filters' => ['year' => $year],
            'months' => $months,
            'memberCount' => $admins->count(),
        ]);
    }

    public function storeMonth(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'expected_amount' => ['required', 'numeric', 'min:0'],
            'title' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $monthDate = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();

        $month = ContributionMonth::updateOrCreate(
            ['month_date' => $monthDate->toDateString()],
            [
                'expected_amount' => $validated['expected_amount'],
                'title' => $validated['title'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'open',
                'created_by' => $request->user()?->id,
            ]
        );

        AuditLogService::log(
            'contribution_fund',
            'month_saved',
            'Contribution month saved.',
            $month,
            $request->user()?->id,
            $month->month_date?->format('Y-m'),
            [
                'expected_amount' => (float) $month->expected_amount,
                'title' => $month->title,
            ],
        );

        return redirect()->route('contribution-fund.months.show', $month)
            ->with('success', 'Collection month saved successfully. এখন এই মাসের member-wise collection entry দিন।');
    }

    public function showMonth(Request $request, ContributionMonth $month): Response
    {
        $month->load(['payments.member:id,name', 'payments.receiver:id,name']);
        $admins = $this->memberQuery()->get();
        $memberRows = $this->buildMemberRows($month, $admins);

        $editPaymentId = $request->integer('editPayment');
        $selectedMemberId = $request->integer('member') ?: null;
        $editingPayment = null;

        if ($editPaymentId) {
            $payment = $month->payments->firstWhere('id', $editPaymentId);
            if ($payment) {
                $editingPayment = [
                    'id' => $payment->id,
                    'user_id' => $payment->user_id,
                    'amount' => (float) $payment->amount,
                    'paid_at' => $payment->paid_at?->toDateString(),
                    'payment_method' => $payment->payment_method,
                    'reference_no' => $payment->reference_no,
                    'notes' => $payment->notes,
                ];
            }
        }

        return Inertia::render('contribution-fund/month-show', [
            'month' => [
                'id' => $month->id,
                'label' => $month->month_date?->format('F Y'),
                'month' => $month->month_date?->format('Y-m'),
                'month_date' => $month->month_date?->toDateString(),
                'expected_amount' => (float) $month->expected_amount,
                'title' => $month->title,
                'notes' => $month->notes,
                'status' => $month->status,
                'summary' => $this->transformMonth($month, $admins),
            ],
            'members' => $memberRows,
            'memberOptions' => $admins->map(fn (User $user) => [
                'id' => $user->id,
                'label' => $user->name,
            ])->values(),
            'editingPayment' => $editingPayment,
            'selectedMemberId' => $editingPayment['user_id'] ?? $selectedMemberId,
            'pdfDownloadUrl' => route('contribution-fund.months.pdf', ['month' => $month->id, 'locale' => $this->resolveLocale($request)]),
        ]);
    }

    public function storePayment(Request $request, ContributionMonth $month): RedirectResponse
    {
        $validated = $this->validatePayment($request);
        $member = $this->resolveActiveMember((int) $validated['user_id']);

        $payment = ContributionPayment::create([
            'contribution_month_id' => $month->id,
            'user_id' => $member->id,
            'amount' => $validated['amount'],
            'paid_at' => $validated['paid_at'],
            'payment_method' => $validated['payment_method'],
            'reference_no' => $validated['reference_no'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'received_by' => $request->user()?->id,
        ]);

        AuditLogService::log(
            'contribution_fund',
            'payment_created',
            'Contribution payment recorded.',
            $payment,
            $request->user()?->id,
            $month->month_date?->format('Y-m'),
            [
                'member' => $member->name,
                'amount' => (float) $payment->amount,
                'paid_at' => $payment->paid_at?->toDateString(),
            ],
        );

        return redirect()->route('contribution-fund.months.show', $month)
            ->with('success', 'Contribution payment added successfully.');
    }

    public function updatePayment(Request $request, ContributionMonth $month, ContributionPayment $payment): RedirectResponse
    {
        abort_unless($payment->contribution_month_id === $month->id, 404);

        $validated = $this->validatePayment($request);
        $member = $this->resolveActiveMember((int) $validated['user_id']);

        $payment->update([
            'user_id' => $member->id,
            'amount' => $validated['amount'],
            'paid_at' => $validated['paid_at'],
            'payment_method' => $validated['payment_method'],
            'reference_no' => $validated['reference_no'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'received_by' => $request->user()?->id,
        ]);

        AuditLogService::log(
            'contribution_fund',
            'payment_updated',
            'Contribution payment updated.',
            $payment,
            $request->user()?->id,
            $month->month_date?->format('Y-m'),
            [
                'member' => $member->name,
                'amount' => (float) $payment->amount,
                'paid_at' => $payment->paid_at?->toDateString(),
            ],
        );

        return redirect()->route('contribution-fund.months.show', $month)
            ->with('success', 'Contribution payment updated successfully.');
    }

    public function destroyPayment(Request $request, ContributionMonth $month, ContributionPayment $payment): RedirectResponse
    {
        abort_unless($payment->contribution_month_id === $month->id, 404);

        AuditLogService::log(
            'contribution_fund',
            'payment_deleted',
            'Contribution payment deleted.',
            $payment,
            $request->user()?->id,
            $month->month_date?->format('Y-m'),
            [
                'member_id' => $payment->user_id,
                'amount' => (float) $payment->amount,
                'paid_at' => $payment->paid_at?->toDateString(),
            ],
        );

        $payment->delete();

        return redirect()->route('contribution-fund.months.show', $month)
            ->with('success', 'Contribution payment deleted successfully.');
    }

    public function members(Request $request): Response
    {
        $year = (int) ($request->integer('year') ?: now()->year);
        $admins = $this->memberQuery()->get();
        $months = ContributionMonth::query()
            ->with('payments')
            ->whereYear('month_date', $year)
            ->orderBy('month_date')
            ->get();

        $members = $admins->map(function (User $user) use ($months) {
            $monthCount = $months->count();
            $paidMonths = 0;
            $partialMonths = 0;
            $unpaidMonths = 0;
            $expectedTotal = 0.0;
            $paidTotal = 0.0;

            foreach ($months as $month) {
                $expected = (float) $month->expected_amount;
                $paid = (float) $month->payments->where('user_id', $user->id)->sum('amount');
                $expectedTotal += $expected;
                $paidTotal += $paid;
                if ($paid >= $expected && $expected > 0) {
                    $paidMonths++;
                } elseif ($paid > 0) {
                    $partialMonths++;
                } elseif ($expected > 0) {
                    $unpaidMonths++;
                }
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->getRoleNames()->first() ?? 'admin',
                'month_count' => $monthCount,
                'paid_months' => $paidMonths,
                'partial_months' => $partialMonths,
                'unpaid_months' => $unpaidMonths,
                'expected_total' => round($expectedTotal, 2),
                'paid_total' => round($paidTotal, 2),
                'due_total' => round(max(0, $expectedTotal - $paidTotal), 2),
            ];
        })->sortBy('name')->values();

        return Inertia::render('contribution-fund/members', [
            'filters' => ['year' => $year],
            'members' => $members,
        ]);
    }

    public function showMember(Request $request, User $user): Response
    {
        abort_unless($user->hasAnyRole(['super-admin', 'admin']), 404);

        $year = (int) ($request->integer('year') ?: now()->year);
        $months = ContributionMonth::query()
            ->with(['payments' => fn ($query) => $query->where('user_id', $user->id)->with('receiver:id,name')])
            ->whereYear('month_date', $year)
            ->orderByDesc('month_date')
            ->get();

        $history = $months->map(function (ContributionMonth $month) {
            $paid = (float) $month->payments->sum('amount');
            $expected = (float) $month->expected_amount;

            return [
                'id' => $month->id,
                'month_label' => $month->month_date?->format('F Y'),
                'month' => $month->month_date?->format('Y-m'),
                'expected_amount' => $expected,
                'paid_amount' => round($paid, 2),
                'due_amount' => round(max(0, $expected - $paid), 2),
                'status' => $paid >= $expected && $expected > 0 ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid'),
                'payments' => $month->payments->map(fn (ContributionPayment $payment) => [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'paid_at' => $payment->paid_at?->toDateString(),
                    'payment_method' => $payment->payment_method,
                    'reference_no' => $payment->reference_no,
                    'receiver' => $payment->receiver?->name,
                    'notes' => $payment->notes,
                ])->values(),
            ];
        })->values();

        return Inertia::render('contribution-fund/member-show', [
            'filters' => ['year' => $year],
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->getRoleNames()->first() ?? 'admin',
                'paid_total' => round((float) $history->sum('paid_amount'), 2),
                'expected_total' => round((float) $history->sum('expected_amount'), 2),
                'due_total' => round((float) $history->sum('due_amount'), 2),
                'paid_months' => $history->where('status', 'paid')->count(),
                'partial_months' => $history->where('status', 'partial')->count(),
                'unpaid_months' => $history->where('status', 'unpaid')->count(),
            ],
            'history' => $history,
            'pdfDownloadUrl' => route('contribution-fund.members.pdf', ['user' => $user->id, 'year' => $year, 'locale' => $this->resolveLocale($request)]),
        ]);
    }

    public function memberStatementPdf(Request $request, User $user)
    {
        abort_unless($user->hasAnyRole(['super-admin', 'admin']), 404);

        $locale = $this->resolveLocale($request);
        app()->setLocale($locale);
        $year = (int) ($request->integer('year') ?: now()->year);

        $months = ContributionMonth::query()
            ->with(['payments' => fn ($query) => $query->where('user_id', $user->id)->with('receiver:id,name')])
            ->whereYear('month_date', $year)
            ->orderBy('month_date')
            ->get();

        $history = $months->map(function (ContributionMonth $month) use ($locale) {
            $paid = (float) $month->payments->sum('amount');
            $expected = (float) $month->expected_amount;
            $due = max(0, $expected - $paid);
            $status = $paid >= $expected && $expected > 0 ? 'Paid' : ($paid > 0 ? 'Partial' : 'Unpaid');

            return [
                'month_label' => AppLocale::date($month->month_date?->format('Y-m'), $locale),
                'expected_money' => AppLocale::money($expected, $locale),
                'paid_money' => AppLocale::money($paid, $locale),
                'due_money' => AppLocale::money($due, $locale),
                'status' => $status,
                'payments' => $month->payments->map(fn (ContributionPayment $payment) => [
                    'amount_money' => AppLocale::money((float) $payment->amount, $locale),
                    'paid_at' => AppLocale::date($payment->paid_at?->format('Y-m-d'), $locale),
                    'method' => $payment->payment_method,
                    'reference_no' => $payment->reference_no,
                    'receiver' => $payment->receiver?->name,
                ])->values(),
            ];
        })->values();

        $expectedTotal = (float) $months->sum('expected_amount');
        $paidTotal = (float) $months->sum(fn (ContributionMonth $month) => (float) $month->payments->sum('amount'));
        $dueTotal = (float) $months->sum(function (ContributionMonth $month) {
            $expected = (float) $month->expected_amount;
            $paid = (float) $month->payments->sum('amount');

            return max(0, $expected - $paid);
        });

        $data = [
            'generatedAt' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'locale' => $locale,
            'title' => 'Member Contribution Statement',
            'year' => AppLocale::integer($year, $locale),
            'organization' => $this->organizationData($locale),
            'meta' => [
                'generated_at' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
                'prepared_by' => $request->user()?->name,
            ],
            'member' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->getRoleNames()->first() ?? 'admin',
                'expected_total_money' => AppLocale::money($expectedTotal, $locale),
                'paid_total_money' => AppLocale::money($paidTotal, $locale),
                'due_total_money' => AppLocale::money($dueTotal, $locale),
            ],
            'history' => $history,
        ];

        return $this->pdf->download('pdf.member-contribution-statement', $data, sprintf('member-contribution-%s-%s.pdf', $user->id, $year));
    }

    public function monthSummaryPdf(Request $request, ContributionMonth $month)
    {
        $locale = $this->resolveLocale($request);
        app()->setLocale($locale);

        $month->load(['payments.member:id,name', 'payments.receiver:id,name']);
        $admins = $this->memberQuery()->get();
        $rows = $this->buildMemberRows($month, $admins);

        $data = [
            'generatedAt' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'locale' => $locale,
            'title' => 'Monthly Contribution Summary',
            'organization' => $this->organizationData($locale),
            'meta' => [
                'generated_at' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
                'prepared_by' => $request->user()?->name,
            ],
            'month' => [
                'label' => AppLocale::date($month->month_date?->format('Y-m'), $locale),
                'expected_per_member_money' => AppLocale::money((float) $month->expected_amount, $locale),
                'expected_total_money' => AppLocale::money((float) $month->expected_amount * $admins->count(), $locale),
                'collected_total_money' => AppLocale::money((float) $month->payments->sum('amount'), $locale),
                'due_total_money' => AppLocale::money(max(0, ((float) $month->expected_amount * $admins->count()) - (float) $month->payments->sum('amount')), $locale),
                'title' => $month->title,
                'notes' => $month->notes,
            ],
            'rows' => $rows->map(function (array $row) use ($locale) {
                return [
                    'name' => $row['name'],
                    'role' => $row['role'],
                    'expected_money' => AppLocale::money((float) $row['expected_amount'], $locale),
                    'paid_money' => AppLocale::money((float) $row['paid_amount'], $locale),
                    'due_money' => AppLocale::money((float) $row['due_amount'], $locale),
                    'status' => ucfirst($row['status']),
                    'payments' => collect($row['payments'])->map(function (array $payment) use ($locale) {
                        return [
                            'amount_money' => AppLocale::money((float) $payment['amount'], $locale),
                            'paid_at' => AppLocale::date($payment['paid_at'], $locale),
                            'method' => $payment['payment_method'],
                            'reference_no' => $payment['reference_no'],
                            'receiver' => $payment['receiver'],
                            'notes' => $payment['notes'],
                        ];
                    })->values(),
                ];
            })->values(),
        ];

        return $this->pdf->download('pdf.month-contribution-summary', $data, sprintf('contribution-month-%s.pdf', $month->month_date?->format('Y-m')));
    }

    private function validatePayment(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date'],
            'payment_method' => ['required', 'in:cash,bank,mobile_banking'],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);
    }

    private function resolveActiveMember(int $userId): User
    {
        return $this->memberQuery()->findOrFail($userId);
    }

    private function resolveLocale(Request $request): string
    {
        return AppLocale::normalize($request->string('locale')->toString() ?: $request->cookie('somiti_locale') ?: 'en');
    }

    private function memberQuery()
    {
        return User::query()
            ->role(['super-admin', 'admin'])
            ->where('is_active', true)
            ->orderBy('name');
    }

    private function transformMonth(ContributionMonth $month, Collection $admins): array
    {
        $memberCount = $admins->count();
        $collectedAmount = (float) $month->payments->sum('amount');
        $expectedAmount = (float) $month->expected_amount;
        $paidMembers = $admins->filter(function (User $user) use ($month, $expectedAmount) {
            return (float) $month->payments->where('user_id', $user->id)->sum('amount') >= $expectedAmount && $expectedAmount > 0;
        })->count();
        $partialMembers = $admins->filter(function (User $user) use ($month, $expectedAmount) {
            $paid = (float) $month->payments->where('user_id', $user->id)->sum('amount');

            return $paid > 0 && $paid < $expectedAmount;
        })->count();

        return [
            'id' => $month->id,
            'label' => $month->month_date?->format('F Y'),
            'month' => $month->month_date?->format('Y-m'),
            'expected_amount' => $expectedAmount,
            'member_count' => $memberCount,
            'expected_total' => round($expectedAmount * $memberCount, 2),
            'collected_total' => round($collectedAmount, 2),
            'due_total' => round(max(0, ($expectedAmount * $memberCount) - $collectedAmount), 2),
            'paid_members' => $paidMembers,
            'partial_members' => $partialMembers,
            'unpaid_members' => max(0, $memberCount - $paidMembers - $partialMembers),
            'status' => $month->status,
            'title' => $month->title,
            'notes' => $month->notes,
        ];
    }

    private function buildMemberRows(ContributionMonth $month, Collection $admins): Collection
    {
        return $admins->map(function (User $user) use ($month) {
            $payments = $month->payments->where('user_id', $user->id)->sortByDesc('paid_at')->values();
            $paid = (float) $payments->sum('amount');
            $expected = (float) $month->expected_amount;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->getRoleNames()->first() ?? 'admin',
                'expected_amount' => $expected,
                'paid_amount' => round($paid, 2),
                'due_amount' => round(max(0, $expected - $paid), 2),
                'status' => $paid >= $expected && $expected > 0 ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid'),
                'payments' => $payments->map(fn (ContributionPayment $payment) => [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'paid_at' => $payment->paid_at?->toDateString(),
                    'payment_method' => $payment->payment_method,
                    'reference_no' => $payment->reference_no,
                    'receiver' => $payment->receiver?->name,
                    'notes' => $payment->notes,
                ])->values(),
            ];
        })->values();
    }

    private function organizationData(string $locale): array
    {
        return [
            'name' => Setting::get($locale === 'bn' ? 'organization_name_bn' : 'organization_name_en', Setting::get('app_name', config('app.name'))),
            'address' => Setting::get($locale === 'bn' ? 'organization_address_bn' : 'organization_address_en', ''),
            'phone' => Setting::get('organization_phone', ''),
            'email' => Setting::get('organization_email', ''),
            'footer_note' => Setting::get($locale === 'bn' ? 'organization_footer_bn' : 'organization_footer_en', ''),
            'authority_name' => Setting::get('organization_authority_name', ''),
            'authority_title' => Setting::get($locale === 'bn' ? 'organization_authority_title_bn' : 'organization_authority_title_en', ''),
        ];
    }
}
