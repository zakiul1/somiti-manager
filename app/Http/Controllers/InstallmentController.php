<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInstallmentBatchRequest;
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
    $dateFrom = trim((string) $request->string('date_from'));
    $dateTo = trim((string) $request->string('date_to'));

    $installments = Installment::query()
        ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
        ->when($search !== '', function ($builder) use ($search) {
            $builder->where(function ($nested) use ($search) {
                $nested
                    ->whereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$search}%"))
                    ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_code', 'like', "%{$search}%"));
            });
        })
        ->when(in_array($status, ['pending', 'partial', 'paid', 'overdue'], true), function ($builder) use ($status) {
            $builder->where('status', $status);
        })
        ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('due_date', '>=', $dateFrom))
        ->when($dateTo !== '', fn ($builder) => $builder->whereDate('due_date', '<=', $dateTo))
        ->orderBy('due_date')
        ->paginate(12)
        ->withQueryString()
        ->through(fn (Installment $installment) => [
            'id' => $installment->id,
            'installment_no' => $installment->installment_no,
            'due_date' => $installment->due_date?->format('Y-m-d'),
            'principal_component' => (float) $installment->principal_component,
            'interest_component' => (float) $installment->interest_component,
            'installment_amount' => (float) $installment->installment_amount,
            'paid_amount' => (float) $installment->paid_amount,
            'status' => $installment->status,
            'loan' => $installment->loan ? [
                'id' => $installment->loan->id,
                'loan_code' => $installment->loan->loan_code,
            ] : null,
            'customer' => $installment->customer ? [
                'id' => $installment->customer->id,
                'name' => $installment->customer->name,
                'customer_code' => $installment->customer->customer_code,
            ] : null,
        ]);

    return Inertia::render('installments/index', [
        'installments' => $installments,
        'filters' => [
            'search' => $search,
            'status' => $status,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ],
        'stats' => [
            'total' => Installment::count(),
            'pending' => Installment::where('status', 'pending')->count(),
            'paid' => Installment::where('status', 'paid')->count(),
            'overdue' => Installment::where('status', 'overdue')->count(),
        ],
    ]);
}


public function export(Request $request)
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');

        $rows = Installment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested
                        ->whereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%"));
                });
            })
            ->when(in_array($status, ['pending', 'partial', 'paid', 'overdue'], true), fn ($builder) => $builder->where('status', $status))
            ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('due_date', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($builder) => $builder->whereDate('due_date', '<=', $dateTo))
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
