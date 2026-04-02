<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInstallmentBatchRequest;
use App\Models\Customer;
use App\Models\Installment;
use App\Models\Loan;
use App\Services\AuditLogService;
use App\Services\CsvExportService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class InstallmentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));
        $tab = (string) $request->string('tab', 'overview');

        $installmentsQuery = $this->filteredInstallmentQuery($search, $status, $dateFrom, $dateTo);

        $installments = $installmentsQuery
            ->orderBy('due_date')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Installment $installment) => $this->installmentListItem($installment));

        $overdueItems = Installment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
            ->overdue()
            ->orderBy('due_date')
            ->limit(8)
            ->get()
            ->map(fn (Installment $installment) => $this->installmentListItem($installment))
            ->values();

        $dueTodayItems = Installment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
            ->dueToday()
            ->orderBy('due_date')
            ->limit(8)
            ->get()
            ->map(fn (Installment $installment) => $this->installmentListItem($installment))
            ->values();

        $upcomingItems = Installment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
            ->upcoming(7)
            ->orderBy('due_date')
            ->limit(8)
            ->get()
            ->map(fn (Installment $installment) => $this->installmentListItem($installment))
            ->values();

        return Inertia::render('installments/index', [
            'installments' => $installments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'tab' => in_array($tab, ['overview', 'due', 'all'], true) ? $tab : 'overview',
            ],
            'stats' => [
                'total' => Installment::count(),
                'pending' => Installment::pending()->count(),
                'paid' => Installment::paid()->count(),
                'overdue' => Installment::overdue()->count(),
                'due_today' => Installment::dueToday()->count(),
                'upcoming' => Installment::upcoming(7)->count(),
                'customers_with_open' => Installment::open()->distinct('customer_id')->count('customer_id'),
            ],
            'overview' => [
                'overdue_items' => $overdueItems,
                'due_today_items' => $dueTodayItems,
                'upcoming_items' => $upcomingItems,
            ],
        ]);
    }

    public function customers(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $customers = Customer::query()
            ->withCount([
                'loans as active_loans_count' => fn ($query) => $query->where('status', 'active'),
                'installments as pending_installments_count' => fn ($query) => $query->whereIn('status', ['pending', 'partial', 'overdue']),
                'installments as overdue_installments_count' => fn ($query) => $query->overdue(),
            ])
            ->withSum([
                'installments as overdue_installments_sum_installment_amount' => fn ($query) => $query->overdue(),
            ], 'installment_amount')
            ->with([
                'installments' => fn ($query) => $query
                    ->whereIn('status', ['pending', 'partial', 'overdue'])
                    ->orderBy('due_date')
                    ->select('id', 'customer_id', 'due_date'),
                'payments' => fn ($query) => $query
                    ->latest('payment_date')
                    ->limit(1)
                    ->select('id', 'customer_id', 'payment_date'),
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_code', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->whereHas('installments')
            ->orderByDesc('overdue_installments_count')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString()
            ->through(function (Customer $customer) {
                $nextDue = $customer->installments->sortBy('due_date')->first();
                $lastPayment = $customer->payments->first();

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'customer_code' => $customer->customer_code,
                    'phone' => $customer->phone,
                    'status' => $customer->status,
                    'active_loans_count' => $customer->active_loans_count,
                    'pending_installments_count' => $customer->pending_installments_count,
                    'overdue_installments_count' => $customer->overdue_installments_count,
                    'overdue_amount' => (float) ($customer->overdue_installments_sum_installment_amount ?? 0),
                    'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
                    'last_payment_date' => $lastPayment?->payment_date?->format('Y-m-d'),
                ];
            });

        return Inertia::render('installments/customers', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function customerShow(Customer $customer): Response
    {
        $customer->load([
            'loans' => fn ($query) => $query
                ->with(['installments' => fn ($installments) => $installments->orderBy('installment_no')])
                ->orderByDesc('id'),
            'payments' => fn ($query) => $query->latest('payment_date')->limit(10),
        ]);

        $loans = $customer->loans->map(function (Loan $loan) {
            $installments = $loan->installments;
            $openInstallments = $installments->whereIn('status', ['pending', 'partial', 'overdue']);
            $nextDue = $openInstallments->sortBy('due_date')->first();
            $overdueCount = $installments->filter(fn ($item) => in_array($item->status, ['pending', 'partial', 'overdue'], true) && optional($item->due_date)->lt(today()))->count();

            return [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'status' => $loan->status,
                'start_date' => $loan->start_date?->format('Y-m-d'),
                'collection_frequency' => $loan->collection_frequency,
                'total_payable' => (float) $loan->total_payable,
                'principal_amount' => (float) $loan->principal_amount,
                'total_paid' => (float) $installments->sum('paid_amount'),
                'remaining_balance' => (float) $installments->sum(fn (Installment $item) => max(0, (float) $item->installment_amount - (float) $item->paid_amount)),
                'overdue_count' => $overdueCount,
                'open_installments_count' => $openInstallments->count(),
                'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
                'next_due_amount' => $nextDue ? max(0, (float) $nextDue->installment_amount - (float) $nextDue->paid_amount) : 0,
                'installments' => $installments->map(fn (Installment $installment) => [
                    'id' => $installment->id,
                    'installment_no' => $installment->installment_no,
                    'due_date' => $installment->due_date?->format('Y-m-d'),
                    'installment_amount' => (float) $installment->installment_amount,
                    'paid_amount' => (float) $installment->paid_amount,
                    'outstanding_amount' => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount),
                    'status' => $installment->status,
                ])->values(),
            ];
        })->values();

        $allInstallments = $customer->loans
            ->flatMap(fn (Loan $loan) => $loan->installments)
            ->values();

        $openInstallments = $allInstallments->filter(fn (Installment $item) => in_array($item->status, ['pending', 'partial', 'overdue'], true));
        $nextDue = $openInstallments->sortBy('due_date')->first();
        $lastPayment = $customer->payments->first();

        return Inertia::render('installments/customer-show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'customer_code' => $customer->customer_code,
                'phone' => $customer->phone,
                'status' => $customer->status,
                'financial_summary' => [
                    'total_payable' => (float) $allInstallments->sum('installment_amount'),
                    'total_paid' => (float) $allInstallments->sum('paid_amount'),
                    'remaining_balance' => (float) $allInstallments->sum(fn (Installment $item) => max(0, (float) $item->installment_amount - (float) $item->paid_amount)),
                    'overdue_amount' => (float) $allInstallments->filter(fn (Installment $item) => in_array($item->status, ['pending', 'partial', 'overdue'], true) && optional($item->due_date)->lt(today()))->sum(fn (Installment $item) => max(0, (float) $item->installment_amount - (float) $item->paid_amount)),
                    'active_loans' => $customer->loans->where('status', 'active')->count(),
                    'open_installments' => $openInstallments->count(),
                    'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
                    'next_due_amount' => $nextDue ? max(0, (float) $nextDue->installment_amount - (float) $nextDue->paid_amount) : 0,
                    'last_payment_date' => $lastPayment?->payment_date?->format('Y-m-d'),
                ],
            ],
            'loans' => $loans,
        ]);
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));

        $rows = $this->filteredInstallmentQuery($search, $status, $dateFrom, $dateTo)
            ->orderBy('due_date')
            ->get()
            ->map(fn (Installment $installment) => [
                $installment->loan?->loan_code,
                $installment->customer?->customer_code,
                $installment->customer?->name,
                $installment->installment_no,
                $installment->due_date?->format('Y-m-d'),
                $installment->principal_component,
                $installment->interest_component,
                $installment->installment_amount,
                $installment->paid_amount,
                $installment->status,
            ]);

        return CsvExportService::download('installments-' . now()->format('Y-m-d-His') . '.csv', ['Loan Code', 'Customer Code', 'Customer Name', 'Installment No', 'Due Date', 'Principal Component', 'Interest Component', 'Installment Amount', 'Paid Amount', 'Status'], $rows);
    }

    public function create(Request $request): Response
    {
        $selectedLoan = null;
        $loanId = $request->integer('loan_id');

        if ($loanId) {
            $loan = Loan::query()->with('customer:id,name,customer_code')->find($loanId);
            if ($loan) {
                $selectedLoan = $this->loanOption($loan);
            }
        }

        return Inertia::render('installments/create', [
            'selectedLoan' => $selectedLoan,
            'loans' => Loan::query()
                ->with('customer:id,name,customer_code')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Loan $loan) => $this->loanOption($loan))
                ->values(),
        ]);
    }

    public function store(StoreInstallmentBatchRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $loan = Loan::query()->with('customer:id')->findOrFail($validated['loan_id']);

        if ($loan->installments()->exists()) {
            return Redirect::back()->with('error', 'This loan already has an installment schedule.');
        }

        $count = (int) ($validated['installment_count'] ?? $this->deriveInstallmentCount($loan));
        $firstDueDate = Carbon::parse($validated['first_due_date'] ?? $loan->first_collection_date ?? $loan->start_date);
        $notes = $validated['notes'] ?? null;

        DB::transaction(function () use ($loan, $count, $firstDueDate, $notes, $request) {
            $totalPrincipal = (float) $loan->principal_amount;
            $totalInterest = (float) $loan->interest_amount;
            $basePrincipal = round($totalPrincipal / $count, 2);
            $baseInterest = round($totalInterest / $count, 2);
            $principalAllocated = 0.0;
            $interestAllocated = 0.0;

            for ($i = 1; $i <= $count; $i++) {
                $principal = $i === $count ? round($totalPrincipal - $principalAllocated, 2) : $basePrincipal;
                $interest = $i === $count ? round($totalInterest - $interestAllocated, 2) : $baseInterest;
                $amount = round($principal + $interest, 2);

                Installment::create([
                    'loan_id' => $loan->id,
                    'customer_id' => $loan->customer_id,
                    'installment_no' => $i,
                    'due_date' => $this->incrementDate($firstDueDate->copy(), $loan->collection_frequency, $i - 1)->format('Y-m-d'),
                    'principal_component' => $principal,
                    'interest_component' => $interest,
                    'installment_amount' => $amount,
                    'paid_amount' => 0,
                    'status' => 'pending',
                    'notes' => $notes,
                    'created_by' => $request->user()?->id,
                    'updated_by' => $request->user()?->id,
                ]);

                $principalAllocated += $principal;
                $interestAllocated += $interest;
            }
        });

        AuditLogService::log('installment', 'generated', 'Installment schedule generated.', $loan, $request->user()?->id, $loan->loan_code, [
            'installment_count' => $count,
            'first_due_date' => $firstDueDate->format('Y-m-d'),
        ]);

        return Redirect::route('loans.show', $loan)->with('success', 'Installment schedule generated successfully.');
    }

    public function show(Loan $loan): Response
    {
        $loan->load([
            'customer:id,name,customer_code,phone',
            'installments' => fn ($query) => $query->orderBy('installment_no'),
        ]);

        return Inertia::render('installments/show', [
            'loan' => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'customer' => $loan->customer ? [
                    'id' => $loan->customer->id,
                    'name' => $loan->customer->name,
                    'customer_code' => $loan->customer->customer_code,
                    'phone' => $loan->customer->phone,
                ] : null,
                'principal_amount' => (float) $loan->principal_amount,
                'interest_amount' => (float) $loan->interest_amount,
                'total_payable' => (float) $loan->total_payable,
                'collection_frequency' => $loan->collection_frequency,
                'status' => $loan->status,
                'installments' => $loan->installments->map(fn (Installment $installment) => [
                    'id' => $installment->id,
                    'installment_no' => $installment->installment_no,
                    'due_date' => $installment->due_date?->format('Y-m-d'),
                    'principal_component' => (float) $installment->principal_component,
                    'interest_component' => (float) $installment->interest_component,
                    'installment_amount' => (float) $installment->installment_amount,
                    'paid_amount' => (float) $installment->paid_amount,
                    'status' => $installment->status,
                ])->values(),
            ],
        ]);
    }

    protected function filteredInstallmentQuery(string $search, string $status, string $dateFrom, string $dateTo)
    {
        return Installment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code,phone'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested
                        ->whereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%"));
                });
            })
            ->when(in_array($status, ['pending', 'partial', 'paid'], true), fn ($builder) => $builder->where('status', $status))
            ->when($status === 'overdue', fn ($builder) => $builder->overdue())
            ->when($status === 'due_today', fn ($builder) => $builder->dueToday())
            ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('due_date', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($builder) => $builder->whereDate('due_date', '<=', $dateTo));
    }

    protected function installmentListItem(Installment $installment): array
    {
        $outstanding = max(0, (float) $installment->installment_amount - (float) $installment->paid_amount);

        return [
            'id' => $installment->id,
            'installment_no' => $installment->installment_no,
            'due_date' => $installment->due_date?->format('Y-m-d'),
            'principal_component' => (float) $installment->principal_component,
            'interest_component' => (float) $installment->interest_component,
            'installment_amount' => (float) $installment->installment_amount,
            'paid_amount' => (float) $installment->paid_amount,
            'outstanding_amount' => $outstanding,
            'days_late' => $installment->due_date && $installment->due_date->lt(today()) && $outstanding > 0 ? $installment->due_date->diffInDays(today()) : 0,
            'status' => $installment->status,
            'loan' => $installment->loan ? [
                'id' => $installment->loan->id,
                'loan_code' => $installment->loan->loan_code,
            ] : null,
            'customer' => $installment->customer ? [
                'id' => $installment->customer->id,
                'name' => $installment->customer->name,
                'customer_code' => $installment->customer->customer_code,
                'phone' => $installment->customer->phone,
            ] : null,
        ];
    }

    protected function deriveInstallmentCount(Loan $loan): int
    {
        return match ($loan->collection_frequency) {
            'daily' => match ($loan->duration_unit) {
                'days' => max(1, $loan->duration_value),
                'weeks' => max(1, $loan->duration_value * 7),
                'months' => max(1, $loan->duration_value * 30),
                default => 1,
            },
            'weekly' => match ($loan->duration_unit) {
                'days' => max(1, (int) ceil($loan->duration_value / 7)),
                'weeks' => max(1, $loan->duration_value),
                'months' => max(1, $loan->duration_value * 4),
                default => 1,
            },
            'monthly' => match ($loan->duration_unit) {
                'days' => max(1, (int) ceil($loan->duration_value / 30)),
                'weeks' => max(1, (int) ceil($loan->duration_value / 4)),
                'months' => max(1, $loan->duration_value),
                default => 1,
            },
            default => 1,
        };
    }

    protected function incrementDate(Carbon $date, string $frequency, int $steps): Carbon
    {
        return match ($frequency) {
            'daily' => $date->addDays($steps),
            'weekly' => $date->addWeeks($steps),
            'monthly' => $date->addMonths($steps),
            default => $date,
        };
    }

    protected function loanOption(Loan $loan): array
    {
        return [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'customer' => $loan->customer ? [
                'id' => $loan->customer->id,
                'name' => $loan->customer->name,
                'customer_code' => $loan->customer->customer_code,
            ] : null,
            'total_payable' => (float) $loan->total_payable,
            'principal_amount' => (float) $loan->principal_amount,
            'collection_frequency' => $loan->collection_frequency,
            'duration_value' => $loan->duration_value,
            'duration_unit' => $loan->duration_unit,
            'status' => $loan->status,
            'first_collection_date' => $loan->first_collection_date?->format('Y-m-d'),
            'start_date' => $loan->start_date?->format('Y-m-d'),
        ];
    }
}
