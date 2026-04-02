<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanRequest;
use App\Http\Requests\UpdateLoanRequest;
use App\Models\Customer;
use App\Models\Guarantor;
use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\CsvExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');
        $customerId = (string) $request->string('customer_id', 'all');

        $query = Loan::query()
            ->with([
                'customer:id,name,customer_code,phone',
                'guarantors:id,name,guarantor_code',
                'assignedStaff:id,name,email',
                'installments:id,loan_id,installment_no,due_date,installment_amount,paid_amount,status',
                'payments:id,loan_id,amount',
            ])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested
                        ->where('loan_code', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%"));
                });
            })
            ->when(
                in_array($status, ['active', 'closed', 'defaulted'], true),
                fn ($builder) => $builder->where('status', $status)
            )
            ->when(
                $customerId !== 'all' && ctype_digit($customerId),
                fn ($builder) => $builder->where('customer_id', (int) $customerId)
            );

        $loans = $query->latest()->paginate(10)->withQueryString()->through(function (Loan $loan) {
            $installments = $loan->installments->sortBy('due_date')->values();
            $payments = $loan->payments;
            $openInstallments = $installments->filter(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true))->values();
            $nextDue = $openInstallments->first();
            $remainingBalance = round($openInstallments->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
            $overdueAmount = round($openInstallments
                ->filter(fn (Installment $installment) => $installment->due_date && $installment->due_date->isPast())
                ->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
            $totalPaid = round((float) $payments->sum('amount'), 2);

            return [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'principal_amount' => (float) $loan->principal_amount,
                'interest_rate' => (float) $loan->interest_rate,
                'interest_amount' => (float) $loan->interest_amount,
                'total_payable' => (float) $loan->total_payable,
                'duration_label' => $loan->duration_value . ' ' . $loan->duration_unit,
                'collection_frequency' => $loan->collection_frequency,
                'start_date' => $loan->start_date?->format('Y-m-d'),
                'status' => $loan->status,
                'guarantor_count' => $loan->guarantors->count(),
                'assigned_staff' => $loan->assignedStaff ? [
                    'id' => $loan->assignedStaff->id,
                    'name' => $loan->assignedStaff->name,
                    'email' => $loan->assignedStaff->email,
                ] : null,
                'customer' => $loan->customer ? [
                    'id' => $loan->customer->id,
                    'name' => $loan->customer->name,
                    'customer_code' => $loan->customer->customer_code,
                    'phone' => $loan->customer->phone,
                ] : null,
                'financial_summary' => [
                    'total_paid' => $totalPaid,
                    'remaining_balance' => $remainingBalance,
                    'overdue_amount' => $overdueAmount,
                    'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
                    'next_due_amount' => $nextDue ? round(max(0, (float) $nextDue->installment_amount - (float) $nextDue->paid_amount), 2) : 0,
                ],
                'installment_summary' => [
                    'count' => $installments->count(),
                    'open' => $openInstallments->count(),
                    'paid' => $installments->where('status', 'paid')->count(),
                    'overdue' => $installments->where('status', 'overdue')->count(),
                ],
            ];
        });

        return Inertia::render('loans/index', [
            'loans' => $loans,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'customer_id' => $customerId,
            ],
            'stats' => [
                'total' => Loan::count(),
                'active' => Loan::where('status', 'active')->count(),
                'closed' => Loan::where('status', 'closed')->count(),
                'defaulted' => Loan::where('status', 'defaulted')->count(),
            ],
            'customers' => Customer::query()
                ->orderBy('name')
                ->get(['id', 'name', 'customer_code'])
                ->map(fn (Customer $customer) => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'customer_code' => $customer->customer_code,
                ])
                ->values(),
        ]);
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');
        $customerId = (string) $request->string('customer_id', 'all');

        $rows = Loan::query()
            ->with(['customer:id,name,customer_code', 'assignedStaff:id,name'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested
                        ->where('loan_code', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%"));
                });
            })
            ->when(
                in_array($status, ['active', 'closed', 'defaulted'], true),
                fn ($builder) => $builder->where('status', $status)
            )
            ->when(
                $customerId !== 'all' && ctype_digit($customerId),
                fn ($builder) => $builder->where('customer_id', (int) $customerId)
            )
            ->latest()
            ->get()
            ->map(fn (Loan $loan) => [
                $loan->loan_code,
                $loan->customer?->customer_code,
                $loan->customer?->name,
                $loan->principal_amount,
                $loan->interest_rate,
                $loan->interest_amount,
                $loan->total_payable,
                $loan->collection_frequency,
                $loan->start_date?->format('Y-m-d'),
                $loan->status,
                $loan->assignedStaff?->name,
                $loan->created_at?->format('Y-m-d H:i:s'),
            ]);

        return CsvExportService::download(
            'loans-' . now()->format('Y-m-d-His') . '.csv',
            ['Loan Code', 'Customer Code', 'Customer Name', 'Principal', 'Interest Rate', 'Interest Amount', 'Total Payable', 'Collection Frequency', 'Start Date', 'Status', 'Assigned Staff', 'Created At'],
            $rows
        );
    }

    public function create(Request $request): Response
    {
        $selectedCustomer = null;
        $customerId = $request->integer('customer_id');

        if ($customerId) {
            $customer = Customer::query()->find($customerId);

            if ($customer) {
                $selectedCustomer = [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'customer_code' => $customer->customer_code,
                ];
            }
        }

        return Inertia::render('loans/create', [
            'loanCode' => $this->generateLoanCode(),
            'selectedCustomer' => $selectedCustomer,
            'customers' => $this->customerOptions(),
            'guarantors' => $this->guarantorOptions($customerId),
            'staffOptions' => $this->staffOptions(),
        ]);
    }

    public function store(StoreLoanRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $status = $validated['status'] ?? 'active';

        $loan = Loan::create([
            'loan_code' => $this->generateLoanCode(),
            'customer_id' => $validated['customer_id'],
            'principal_amount' => $validated['principal_amount'],
            'interest_rate' => $validated['interest_rate'],
            'interest_amount' => $this->calculateInterestAmount($validated['principal_amount'], $validated['interest_rate']),
            'total_payable' => $this->calculateTotalPayable($validated['principal_amount'], $validated['interest_rate']),
            'duration_value' => $validated['duration_value'],
            'duration_unit' => $validated['duration_unit'],
            'collection_frequency' => $validated['collection_frequency'],
            'start_date' => $validated['start_date'],
            'first_collection_date' => $validated['first_collection_date'] ?? null,
            'status' => $status,
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
            'assigned_staff_id' => $validated['assigned_staff_id'] ?? null,
            'disbursement_amount' => $status === 'active' ? $validated['principal_amount'] : null,
            'disbursed_at' => $status === 'active' ? ($validated['start_date'] ?? now()->toDateString()) : null,
            'disbursed_by' => $status === 'active' ? $request->user()?->id : null,
            'disbursement_method' => $status === 'active' ? 'cash' : null,
        ]);

        $loan->guarantors()->sync($validated['guarantor_ids'] ?? []);

        AuditLogService::log('loan', 'created', 'Loan created.', $loan, $request->user()?->id, $loan->loan_code, [
            'customer_id' => $loan->customer_id,
            'status' => $loan->status,
            'guarantor_count' => count($validated['guarantor_ids'] ?? []),
        ]);

        return Redirect::route('loans.show', $loan)->with('success', __('Loan created successfully.'));
    }

    public function show(Loan $loan): Response
    {
        $loan->load([
            'customer:id,name,customer_code,phone,status',
            'assignedStaff:id,name,email',
            'guarantors:id,name,guarantor_code,phone,relationship,status',
            'installments:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status,paid_at',
            'payments:id,loan_id,installment_id,amount,payment_date,payment_method,payment_type,reference_no',
            'documents:id,loan_id,document_code,title,document_type',
        ]);

        return Inertia::render('loans/show', [
            'loan' => $this->loanPayload($loan),
        ]);
    }

    public function edit(Loan $loan): Response
    {
        $loan->load('guarantors:id');

        return Inertia::render('loans/edit', [
            'loan' => $this->loanPayload($loan),
            'customers' => $this->customerOptions(),
            'guarantors' => $this->guarantorOptions($loan->customer_id),
            'staffOptions' => $this->staffOptions(),
        ]);
    }

    public function update(UpdateLoanRequest $request, Loan $loan): RedirectResponse
    {
        $validated = $request->validated();
        $status = $validated['status'] ?? 'active';

        $loan->update([
            'customer_id' => $validated['customer_id'],
            'principal_amount' => $validated['principal_amount'],
            'interest_rate' => $validated['interest_rate'],
            'interest_amount' => $this->calculateInterestAmount($validated['principal_amount'], $validated['interest_rate']),
            'total_payable' => $this->calculateTotalPayable($validated['principal_amount'], $validated['interest_rate']),
            'duration_value' => $validated['duration_value'],
            'duration_unit' => $validated['duration_unit'],
            'collection_frequency' => $validated['collection_frequency'],
            'start_date' => $validated['start_date'],
            'first_collection_date' => $validated['first_collection_date'] ?? null,
            'status' => $status,
            'notes' => $validated['notes'] ?? null,
            'updated_by' => $request->user()?->id,
            'assigned_staff_id' => $validated['assigned_staff_id'] ?? null,
            'disbursement_amount' => $status === 'active' ? ($loan->disbursement_amount ?: $validated['principal_amount']) : $loan->disbursement_amount,
            'disbursed_at' => $status === 'active' ? ($loan->disbursed_at ?: ($validated['start_date'] ?? now()->toDateString())) : $loan->disbursed_at,
            'disbursed_by' => $status === 'active' ? ($loan->disbursed_by ?: $request->user()?->id) : $loan->disbursed_by,
            'disbursement_method' => $status === 'active' ? ($loan->disbursement_method ?: 'cash') : $loan->disbursement_method,
        ]);

        $loan->guarantors()->sync($validated['guarantor_ids'] ?? []);

        AuditLogService::log('loan', 'updated', 'Loan updated.', $loan, $request->user()?->id, $loan->loan_code, [
            'customer_id' => $loan->customer_id,
            'status' => $loan->status,
            'guarantor_count' => count($validated['guarantor_ids'] ?? []),
        ]);

        return Redirect::route('loans.show', $loan)->with('success', __('Loan updated successfully.'));
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        AuditLogService::log('loan', 'deleted', 'Loan deleted.', $loan, request()->user()?->id, $loan->loan_code, [
            'customer_id' => $loan->customer_id,
        ]);

        $loan->guarantors()->detach();
        $loan->delete();

        return Redirect::route('loans.index')->with('success', __('Loan deleted successfully.'));
    }

    protected function loanPayload(Loan $loan): array
    {
        $installments = $loan->relationLoaded('installments') ? $loan->installments : collect();
        $payments = $loan->relationLoaded('payments') ? $loan->payments : collect();

        $remainingBalance = round($installments->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
        $overdueAmount = round($installments->filter(fn (Installment $installment) => $installment->due_date && $installment->due_date->isPast() && in_array($installment->status, ['pending', 'partial', 'overdue'], true))->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
        $nextDueInstallment = $installments->first(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true));
        $paidCount = $installments->where('status', 'paid')->count();
        $openCount = $installments->filter(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true))->count();

        return [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'customer_id' => $loan->customer_id,
            'principal_amount' => (float) $loan->principal_amount,
            'interest_rate' => (float) $loan->interest_rate,
            'interest_amount' => (float) $loan->interest_amount,
            'total_payable' => (float) $loan->total_payable,
            'duration_value' => $loan->duration_value,
            'duration_unit' => $loan->duration_unit,
            'collection_frequency' => $loan->collection_frequency,
            'start_date' => $loan->start_date?->format('Y-m-d'),
            'first_collection_date' => $loan->first_collection_date?->format('Y-m-d'),
            'status' => $loan->status,
            'notes' => $loan->notes,
            'assigned_staff_id' => $loan->assigned_staff_id,
            'disbursement_amount' => (float) ($loan->disbursement_amount ?? 0),
            'disbursed_at' => $loan->disbursed_at?->format('Y-m-d'),
            'disbursement_method' => $loan->disbursement_method,
            'disbursement_reference' => $loan->disbursement_reference,
            'disbursement_notes' => $loan->disbursement_notes,
            'assigned_staff' => $loan->assignedStaff ? [
                'id' => $loan->assignedStaff->id,
                'name' => $loan->assignedStaff->name,
                'email' => $loan->assignedStaff->email,
            ] : null,
            'customer' => $loan->customer ? [
                'id' => $loan->customer->id,
                'name' => $loan->customer->name,
                'customer_code' => $loan->customer->customer_code,
                'phone' => $loan->customer->phone,
                'status' => $loan->customer->status,
            ] : null,
            'guarantor_ids' => $loan->relationLoaded('guarantors')
                ? $loan->guarantors->pluck('id')->values()
                : [],
            'guarantors' => $loan->relationLoaded('guarantors')
                ? $loan->guarantors->map(fn (Guarantor $guarantor) => [
                    'id' => $guarantor->id,
                    'name' => $guarantor->name,
                    'guarantor_code' => $guarantor->guarantor_code,
                    'phone' => $guarantor->phone,
                    'relationship' => $guarantor->relationship,
                    'status' => $guarantor->status,
                ])->values()
                : [],
            'financial_summary' => [
                'total_payable' => (float) $loan->total_payable,
                'total_paid' => round((float) $payments->sum('amount'), 2),
                'remaining_balance' => $remainingBalance,
                'overdue_amount' => $overdueAmount,
                'next_due_date' => $nextDueInstallment?->due_date?->format('Y-m-d'),
                'next_due_amount' => $nextDueInstallment ? round(max(0, (float) $nextDueInstallment->installment_amount - (float) $nextDueInstallment->paid_amount), 2) : 0,
                'can_settle' => $loan->status !== 'closed' && $remainingBalance > 0,
            ],
            'installment_summary' => [
                'count' => $installments->count(),
                'pending' => $installments->where('status', 'pending')->count(),
                'partial' => $installments->where('status', 'partial')->count(),
                'overdue' => $installments->where('status', 'overdue')->count(),
                'paid' => $paidCount,
                'open' => $openCount,
                'next_due_date' => $nextDueInstallment?->due_date?->format('Y-m-d'),
            ],
            'next_due_installment' => $nextDueInstallment ? [
                'id' => $nextDueInstallment->id,
                'installment_no' => $nextDueInstallment->installment_no,
                'due_date' => $nextDueInstallment->due_date?->format('Y-m-d'),
                'installment_amount' => (float) $nextDueInstallment->installment_amount,
                'paid_amount' => (float) $nextDueInstallment->paid_amount,
                'outstanding_amount' => round(max(0, (float) $nextDueInstallment->installment_amount - (float) $nextDueInstallment->paid_amount), 2),
                'status' => $nextDueInstallment->status,
            ] : null,
            'recent_payments' => $payments->sortByDesc('payment_date')->take(5)->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->format('Y-m-d'),
                'payment_method' => $payment->payment_method,
                'payment_type' => $payment->payment_type ?: 'regular',
            ])->values(),
            'created_at' => $loan->created_at?->format('Y-m-d h:i A'),
            'updated_at' => $loan->updated_at?->format('Y-m-d h:i A'),
        ];
    }

    protected function customerOptions()
    {
        return Customer::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'customer_code', 'phone'])
            ->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'customer_code' => $customer->customer_code,
                'phone' => $customer->phone,
            ])->values();
    }

    protected function guarantorOptions(?int $customerId = null)
    {
        return Guarantor::query()
            ->where('status', 'active')
            ->when($customerId, fn ($builder) => $builder->where('customer_id', $customerId))
            ->with('customer:id,name,customer_code')
            ->orderBy('name')
            ->get(['id', 'customer_id', 'name', 'guarantor_code', 'phone', 'relationship', 'status'])
            ->map(fn (Guarantor $guarantor) => [
                'id' => $guarantor->id,
                'customer_id' => $guarantor->customer_id,
                'name' => $guarantor->name,
                'guarantor_code' => $guarantor->guarantor_code,
                'phone' => $guarantor->phone,
                'relationship' => $guarantor->relationship,
                'customer' => $guarantor->customer ? [
                    'id' => $guarantor->customer->id,
                    'name' => $guarantor->customer->name,
                    'customer_code' => $guarantor->customer->customer_code,
                ] : null,
            ])->values();
    }

    protected function staffOptions(): array
    {
        return User::query()
            ->role(['super-admin', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
            ])
            ->values()
            ->all();
    }

    protected function calculateInterestAmount(float|int|string $principalAmount, float|int|string $interestRate): float
    {
        $principal = (float) $principalAmount;
        $rate = (float) $interestRate;

        return round($principal * ($rate / 100), 2);
    }

    protected function calculateTotalPayable(float|int|string $principalAmount, float|int|string $interestRate): float
    {
        $principal = (float) $principalAmount;

        return round($principal + $this->calculateInterestAmount($principalAmount, $interestRate), 2);
    }

    protected function generateLoanCode(): string
    {
        $nextId = (Loan::max('id') ?? 0) + 1;

        return 'LOAN-' . str_pad((string) $nextId, 5, '0', STR_PAD_LEFT);
    }
}
