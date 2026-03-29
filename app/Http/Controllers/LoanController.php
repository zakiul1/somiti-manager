<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanDisbursementRequest;
use App\Http\Requests\StoreLoanRequest;
use App\Http\Requests\UpdateLoanRequest;
use App\Models\Customer;
use App\Models\Guarantor;
use App\Services\AuditLogService;
use App\Services\CsvExportService;
use App\Models\Loan;
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
            ->with(['customer:id,name,customer_code', 'guarantors:id,name,guarantor_code'])
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
            ->when(in_array($status, ['draft', 'approved', 'active', 'closed', 'defaulted'], true), function ($builder) use ($status) {
                $builder->where('status', $status);
            })
            ->when($customerId !== 'all' && ctype_digit($customerId), function ($builder) use ($customerId) {
                $builder->where('customer_id', (int) $customerId);
            });

        $loans = $query->latest()->paginate(10)->withQueryString()->through(fn (Loan $loan) => [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'principal_amount' => (float) $loan->principal_amount,
            'interest_rate' => (float) $loan->interest_rate,
            'interest_amount' => (float) $loan->interest_amount,
            'total_payable' => (float) $loan->total_payable,
            'disbursement_amount' => (float) ($loan->disbursement_amount ?? 0),
            'duration_label' => $loan->duration_value . ' ' . $loan->duration_unit,
            'collection_frequency' => $loan->collection_frequency,
            'start_date' => $loan->start_date?->format('Y-m-d'),
            'status' => $loan->status,
            'guarantor_count' => $loan->guarantors->count(),
            'approved_at' => $loan->approved_at?->format('Y-m-d h:i A'),
            'disbursed_at' => $loan->disbursed_at?->format('Y-m-d'),
            'assigned_staff' => $loan->assignedStaff?->name,
            'assigned_staff' => $loan->assignedStaff ? [
                'id' => $loan->assignedStaff->id,
                'name' => $loan->assignedStaff->name,
                'email' => $loan->assignedStaff->email,
            ] : null,
            'customer' => $loan->customer ? [
                'id' => $loan->customer->id,
                'name' => $loan->customer->name,
                'customer_code' => $loan->customer->customer_code,
            ] : null,
        ]);

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
                'draft' => Loan::where('status', 'draft')->count(),
                'approved' => Loan::where('status', 'approved')->count(),
                'closed' => Loan::where('status', 'closed')->count(),
            ],
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'customer_code'])->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'customer_code' => $customer->customer_code,
            ])->values(),
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
            ->when(in_array($status, ['draft', 'approved', 'active', 'closed'], true), fn ($builder) => $builder->where('status', $status))
            ->when($customerId !== 'all' && ctype_digit($customerId), fn ($builder) => $builder->where('customer_id', (int) $customerId))
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

        return CsvExportService::download('loans-' . now()->format('Y-m-d-His') . '.csv', ['Loan Code', 'Customer Code', 'Customer Name', 'Principal', 'Interest Rate', 'Interest Amount', 'Total Payable', 'Collection Frequency', 'Start Date', 'Status', 'Assigned Staff', 'Created At'], $rows);
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
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
            'assigned_staff_id' => $validated['assigned_staff_id'] ?? null,
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
            'installments:id,loan_id,installment_no,due_date,installment_amount,status',
            'documents:id,loan_id,document_code,title,document_type',
            'approver:id,name,email',
            'disburser:id,name,email',
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
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'updated_by' => $request->user()?->id,
            'assigned_staff_id' => $validated['assigned_staff_id'] ?? null,
        ]);

        $loan->guarantors()->sync($validated['guarantor_ids'] ?? []);

        AuditLogService::log('loan', 'updated', 'Loan updated.', $loan, $request->user()?->id, $loan->loan_code, [
            'customer_id' => $loan->customer_id,
            'status' => $loan->status,
            'guarantor_count' => count($validated['guarantor_ids'] ?? []),
        ]);

        return Redirect::route('loans.show', $loan)->with('success', __('Loan updated successfully.'));
    }

    public function approve(Request $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== 'draft') {
            return Redirect::back()->with('error', 'Only draft loans can be approved.');
        }

        $loan->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()?->id,
            'approval_notes' => $request->string('approval_notes')->toString() ?: $loan->approval_notes,
            'updated_by' => $request->user()?->id,
        ]);

        AuditLogService::log('loan', 'approved', 'Loan approved.', $loan, $request->user()?->id, $loan->loan_code, [
            'status' => 'approved',
        ]);

        return Redirect::route('loans.show', $loan)->with('success', 'Loan approved successfully.');
    }

    public function createDisbursement(Loan $loan): Response|RedirectResponse
    {
        if ($loan->status !== 'approved') {
            return Redirect::route('loans.show', $loan)->with('error', 'Only approved loans can be disbursed.');
        }

        $loan->load(['customer:id,name,customer_code', 'guarantors:id,name,guarantor_code']);

        return Inertia::render('loans/disburse', [
            'loan' => $this->loanPayload($loan),
            'paymentMethods' => [
                ['value' => 'cash', 'label' => 'Cash'],
                ['value' => 'bank', 'label' => 'Bank'],
                ['value' => 'mobile_banking', 'label' => 'Mobile Banking'],
            ],
        ]);
    }

    public function storeDisbursement(StoreLoanDisbursementRequest $request, Loan $loan): RedirectResponse
    {
        if ($loan->status !== 'approved') {
            return Redirect::route('loans.show', $loan)->with('error', 'Only approved loans can be disbursed.');
        }

        $validated = $request->validated();

        $loan->update([
            'status' => 'active',
            'disbursement_amount' => $validated['disbursement_amount'],
            'disbursed_at' => $validated['disbursed_at'],
            'disbursed_by' => $request->user()?->id,
            'disbursement_method' => $validated['disbursement_method'],
            'disbursement_reference' => $validated['disbursement_reference'] ?? null,
            'disbursement_notes' => $validated['disbursement_notes'] ?? null,
            'updated_by' => $request->user()?->id,
        ]);

        AuditLogService::log('loan', 'disbursed', 'Loan disbursed.', $loan, $request->user()?->id, $loan->loan_code, [
            'status' => 'active',
            'disbursement_amount' => $validated['disbursement_amount'],
        ]);

        return Redirect::route('loans.show', $loan)->with('success', 'Loan disbursed successfully.');
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
            'approved_at' => $loan->approved_at?->format('Y-m-d h:i A'),
            'approval_notes' => $loan->approval_notes,
            'disbursement_amount' => (float) ($loan->disbursement_amount ?? 0),
            'disbursed_at' => $loan->disbursed_at?->format('Y-m-d'),
            'assigned_staff' => $loan->assignedStaff?->name,
            'disbursement_method' => $loan->disbursement_method,
            'disbursement_reference' => $loan->disbursement_reference,
            'disbursement_notes' => $loan->disbursement_notes,
            'approver' => $loan->relationLoaded('approver') && $loan->approver ? [
                'id' => $loan->approver->id,
                'name' => $loan->approver->name,
                'email' => $loan->approver->email,
            ] : null,
            'disburser' => $loan->relationLoaded('disburser') && $loan->disburser ? [
                'id' => $loan->disburser->id,
                'name' => $loan->disburser->name,
                'email' => $loan->disburser->email,
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

    protected function calculateInterestAmount(float|int|string $principalAmount, float|int|string $interestRate): float
    {
        return round(((float) $principalAmount * (float) $interestRate) / 100, 2);
    }

    protected function calculateTotalPayable(float|int|string $principalAmount, float|int|string $interestRate): float
    {
        return round((float) $principalAmount + $this->calculateInterestAmount($principalAmount, $interestRate), 2);
    }

    protected function generateLoanCode(): string
    {
        $latest = Loan::query()->latest('id')->value('id') ?? 0;

        return 'LOAN-' . str_pad((string) ($latest + 1), 5, '0', STR_PAD_LEFT);
    }
}
