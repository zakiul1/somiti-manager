<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CustomerController extends Controller
{
    public function dashboard(): Response
    {
        $dueTodayQuery = Installment::query()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereDate('due_date', today());

        $dueThisWeekQuery = Installment::query()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereBetween('due_date', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]);

        $paymentsTodayQuery = Payment::query()->whereDate('payment_date', today());
        $paymentsMonthQuery = Payment::query()->whereBetween('payment_date', [
            now()->startOfMonth()->toDateString(),
            now()->endOfMonth()->toDateString(),
        ]);

        $openInstallments = Installment::query()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->get();

        $customerStats = [
            'total' => Customer::count(),
            'active' => Customer::where('status', 'active')->count(),
            'inactive' => Customer::where('status', 'inactive')->count(),
            'new_this_month' => Customer::whereBetween('created_at', [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ])->count(),
            'guarantors' => Guarantor::count(),
            'loans' => Loan::count(),
            'active_loans' => Loan::where('status', 'active')->count(),
            'closed_loans' => Loan::where('status', 'closed')->count(),
            'installments' => Installment::count(),
            'pending_installments' => Installment::whereIn('status', ['pending', 'partial'])->count(),
            'overdue_installments' => Installment::whereIn('status', ['pending', 'partial', 'overdue'])
                ->whereDate('due_date', '<', today())
                ->count(),
            'due_today_count' => (clone $dueTodayQuery)->count(),
            'due_today_amount' => (float) (clone $dueTodayQuery)->sum(DB::raw('installment_amount - paid_amount')),
            'due_this_week_count' => (clone $dueThisWeekQuery)->count(),
            'due_this_week_amount' => (float) (clone $dueThisWeekQuery)->sum(DB::raw('installment_amount - paid_amount')),
            'collected_today_amount' => (float) (clone $paymentsTodayQuery)->sum('amount'),
            'payments_today_count' => (clone $paymentsTodayQuery)->count(),
            'payments_this_month_count' => (clone $paymentsMonthQuery)->count(),
            'collected_this_month_amount' => (float) (clone $paymentsMonthQuery)->sum('amount'),
            'outstanding_open_amount' => (float) $openInstallments->sum(
                fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)
            ),
        ];

        $overdueCustomers = Customer::query()
            ->select([
                'customers.id',
                'customers.customer_code',
                'customers.name',
                'customers.phone',
                DB::raw('COUNT(installments.id) as overdue_count'),
                DB::raw('COALESCE(SUM(installments.installment_amount - installments.paid_amount), 0) as overdue_amount'),
                DB::raw('MIN(installments.due_date) as oldest_due_date'),
            ])
            ->join('installments', 'installments.customer_id', '=', 'customers.id')
            ->whereIn('installments.status', ['pending', 'partial', 'overdue'])
            ->whereDate('installments.due_date', '<', today())
            ->groupBy('customers.id', 'customers.customer_code', 'customers.name', 'customers.phone')
            ->orderByDesc('overdue_amount')
            ->limit(5)
            ->get()
            ->map(fn ($customer) => [
                'id' => $customer->id,
                'customer_code' => $customer->customer_code,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'overdue_count' => (int) $customer->overdue_count,
                'overdue_amount' => (float) $customer->overdue_amount,
                'oldest_due_date' => $customer->oldest_due_date,
            ]);

        $recentPayments = Payment::query()
            ->with(['customer:id,name,customer_code', 'loan:id,loan_code', 'collector:id,name'])
            ->latest('payment_date')
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->toDateString(),
                'customer' => $payment->customer?->name,
                'customer_code' => $payment->customer?->customer_code,
                'loan_code' => $payment->loan?->loan_code,
                'collector' => $payment->collector?->name,
                'payment_method' => $payment->payment_method,
            ]);

        $topCollectors = User::query()
            ->select([
                'users.id',
                'users.name',
                DB::raw('COUNT(payments.id) as payments_count'),
                DB::raw('COALESCE(SUM(payments.amount), 0) as total_collected'),
            ])
            ->join('payments', 'payments.collected_by', '=', 'users.id')
            ->whereDate('payments.payment_date', '>=', now()->startOfMonth()->toDateString())
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_collected')
            ->limit(5)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'payments_count' => (int) $user->payments_count,
                'total_collected' => (float) $user->total_collected,
            ]);

        return Inertia::render('dashboard/index', [
            'customerStats' => $customerStats,
            'attentionBoard' => [
                'overdue_customers' => $overdueCustomers,
                'recent_payments' => $recentPayments,
                'top_collectors' => $topCollectors,
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        [$search, $status, $gender, $perPage, $query] = $this->customerIndexQuery($request);

        $customers = $query->with('assignedStaff:id,name')
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Customer $customer) => [
                'id' => $customer->id,
                'customer_code' => $customer->customer_code,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'nid_number' => $customer->nid_number,
                'occupation' => $customer->occupation,
                'gender' => $customer->gender,
                'status' => $customer->status,
                'assigned_staff_id' => $customer->assigned_staff_id,
                'has_photo' => (bool) $customer->has_photo,
                'has_documents' => (bool) $customer->has_documents,
                'photo_url' => $customer->photo_url,
                'photo_preview' => $customer->photo_preview,
                'created_at' => $customer->created_at?->format('Y-m-d'),
                'assigned_staff' => $customer->assignedStaff?->name,
            ]);

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'gender' => $gender,
                'per_page' => $perPage,
            ],
            'stats' => [
                'total' => Customer::count(),
                'active' => Customer::where('status', 'active')->count(),
                'inactive' => Customer::where('status', 'inactive')->count(),
            ],
        ]);
    }
    public function export(Request $request)
    {
        [, , , , $query] = $this->customerIndexQuery($request);

        $filename = 'customers-' . now()->format('Y-m-d-His') . '.csv';

        $rows = $query->latest()->get([
            'customer_code',
            'name',
            'phone',
            'email',
            'nid_number',
            'gender',
            'occupation',
            'status',
            'created_at',
        ])->map(fn (Customer $row) => [
            $row->customer_code,
            $row->name,
            $row->phone,
            $row->email,
            $row->nid_number,
            $row->gender,
            $row->occupation,
            $row->status,
            $row->created_at?->format('Y-m-d H:i:s'),
        ]);

        return CsvExportService::download(
            $filename,
            ['Customer Code', 'Name', 'Phone', 'Email', 'NID', 'Gender', 'Occupation', 'Status', 'Created At'],
            $rows
        );
    }

    public function create(): Response
    {
        return Inertia::render('customers/create', [
            'customerCode' => $this->generateCustomerCode(),
            'staffOptions' => $this->staffOptions(),
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        try {
            $customer = DB::transaction(function () use ($request) {
                $customer = Customer::create([
                    ...$request->safe()->except([
                        'photo',
                        'nid_front',
                        'nid_back',
                        'remove_photo',
                        'remove_nid_front',
                        'remove_nid_back',
                        'create_portal_account',
                        'portal_email',
                        'portal_password',
                        'portal_password_confirmation',
                        'portal_access_enabled',
                    ]),
                    'customer_code' => $this->generateCustomerCode(),
                    'created_by' => $request->user()?->id,
                    'updated_by' => $request->user()?->id,
                    'assigned_staff_id' => $request->validated('assigned_staff_id'),
                ]);

                $this->syncCustomerIdentityMedia($request, $customer);

                if ($request->boolean('create_portal_account')) {
                    $portalEmail = $request->validated('portal_email') ?: $customer->email;
                    $portalPassword = $request->validated('portal_password');

                    if (blank($portalEmail)) {
                        throw new \RuntimeException('Portal account creation failed: email is required.');
                    }

                    if (blank($portalPassword)) {
                        throw new \RuntimeException('Portal account creation failed: password is required.');
                    }

                    $portalUser = User::create([
                        'customer_id' => $customer->id,
                        'name' => $customer->name,
                        'username' => $this->generateUniqueUsername($customer),
                        'email' => $portalEmail,
                        'password' => $portalPassword,
                        'is_active' => true,
                        'portal_access_enabled' => (bool) $request->boolean('portal_access_enabled', true),
                    ]);

                    $portalUser->assignRole('customer');
                }

                AuditLogService::log(
                    'customer',
                    'created',
                    'Customer created.',
                    $customer,
                    $request->user()?->id,
                    $customer->customer_code,
                    [
                        'name' => $customer->name,
                        'status' => $customer->status,
                        'assigned_staff_id' => $customer->assigned_staff_id,
                    ]
                );

                return $customer;
            });

            return Redirect::route('customers.show', $customer)
                ->with('success', __('Customer created successfully.'));
        } catch (Throwable $exception) {
            Log::error('Customer create failed.', [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'customer_name' => $request->input('name'),
                'customer_phone' => $request->input('phone'),
                'create_portal_account' => $request->boolean('create_portal_account'),
                'portal_email' => $request->input('portal_email'),
                'user_id' => $request->user()?->id,
            ]);

            return Redirect::back()
                ->withInput()
                ->with('error', __('Customer create failed. Please check portal account fields and try again.'));
        }
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'assignedStaff:id,name,email',
            'guarantors:id,customer_id,guarantor_code,name,phone,relationship,status,photo_path,nid_front_path,nid_back_path',
            'loans:id,customer_id,loan_code,principal_amount,total_payable,status,start_date',
            'loans.installments:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status',
            'loans.payments:id,loan_id,customer_id,payment_code,amount,payment_date,payment_type',
            'documents:id,customer_id,document_code,title,document_type,file_path,status,expiry_date',
            'portalUsers:id,customer_id,name,username,email,portal_access_enabled,last_login_at',
        ]);

        return Inertia::render('customers/show', [
            'customer' => $this->customerPayload($customer),
        ]);
    }

    public function ledger(Customer $customer): Response
    {
        $customer->load([
            'assignedStaff:id,name,email',
            'loans:id,customer_id,loan_code,principal_amount,total_payable,status,start_date,first_collection_date',
            'loans.installments:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status',
            'loans.payments:id,loan_id,customer_id,installment_id,payment_code,amount,payment_date,payment_method,payment_type,batch_reference,notes,collected_by',
            'loans.payments.collector:id,name',
        ]);

        return Inertia::render('customers/ledger', [
            'customer' => $this->customerLedgerPayload($customer),
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('customers/edit', [
            'customer' => $this->customerPayload($customer),
            'staffOptions' => $this->staffOptions(),
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        try {
            $customer->update([
                ...$request->safe()->except([
                    'photo',
                    'nid_front',
                    'nid_back',
                    'remove_photo',
                    'remove_nid_front',
                    'remove_nid_back',
                ]),
                'updated_by' => $request->user()?->id,
                'assigned_staff_id' => $request->validated('assigned_staff_id'),
            ]);

            $this->syncCustomerIdentityMedia($request, $customer);

            if ($customer->portalUser) {
                $customer->portalUser->update([
                    'name' => $customer->name,
                    'email' => $customer->email ?: $customer->portalUser->email,
                ]);
            }

            AuditLogService::log(
                'customer',
                'updated',
                'Customer updated.',
                $customer,
                $request->user()?->id,
                $customer->customer_code,
                [
                    'name' => $customer->name,
                    'status' => $customer->status,
                    'assigned_staff_id' => $customer->assigned_staff_id,
                ]
            );

            return Redirect::route('customers.show', $customer)
                ->with('success', __('Customer updated successfully.'));
        } catch (Throwable $exception) {
            Log::error('Customer update failed.', [
                'customer_id' => $customer->id,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => $request->user()?->id,
            ]);

            return Redirect::back()
                ->withInput()
                ->with('error', __('Customer update failed. Please check the form and try again.'));
        }
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        try {
            $customer->load(['portalUsers', 'guarantors', 'documents']);

            if (
                $customer->loans()->exists() ||
                $customer->installments()->exists() ||
                $customer->payments()->exists()
            ) {
                return Redirect::back()->with(
                    'error',
                    __('Customer cannot be deleted because loan, installment, or payment records exist.')
                );
            }

            DB::transaction(function () use ($customer) {
                $this->deleteStoredFile($customer->photo_path);
                $this->deleteStoredFile($customer->nid_front_path);
                $this->deleteStoredFile($customer->nid_back_path);

                foreach ($customer->documents as $document) {
                    if (! empty($document->file_path)) {
                        $this->deleteStoredFile($document->file_path);
                    }

                    $document->delete();
                }

                foreach ($customer->guarantors as $guarantor) {
                    if (! empty($guarantor->photo_path)) {
                        $this->deleteStoredFile($guarantor->photo_path);
                    }

                    if (! empty($guarantor->nid_front_path)) {
                        $this->deleteStoredFile($guarantor->nid_front_path);
                    }

                    if (! empty($guarantor->nid_back_path)) {
                        $this->deleteStoredFile($guarantor->nid_back_path);
                    }

                    if (method_exists($guarantor, 'loans')) {
                        $guarantor->loans()->detach();
                    }

                    $guarantor->delete();
                }

                foreach ($customer->portalUsers as $portalUser) {
                    if (method_exists($portalUser, 'roles')) {
                        $portalUser->roles()->detach();
                    }

                    if (method_exists($portalUser, 'permissions')) {
                        $portalUser->permissions()->detach();
                    }

                    $portalUser->delete();
                }

                AuditLogService::log(
                    'customer',
                    'deleted',
                    'Customer deleted.',
                    $customer,
                    request()->user()?->id,
                    $customer->customer_code,
                    [
                        'name' => $customer->name,
                    ]
                );

                $customer->delete();
            });

            return Redirect::route('customers.index')
                ->with('success', __('Customer deleted successfully.'));
        } catch (Throwable $exception) {
            Log::error('Customer delete failed.', [
                'customer_id' => $customer->id,
                'customer_code' => $customer->customer_code,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => request()->user()?->id,
            ]);

            return Redirect::back()
                ->with('error', __('Customer delete failed. Remove related records first if needed.'));
        }
    }

    public function archive(Customer $customer): RedirectResponse
    {
        $nextStatus = $customer->status === 'active' ? 'inactive' : 'active';

        $customer->update([
            'status' => $nextStatus,
            'updated_by' => request()->user()?->id,
        ]);

        AuditLogService::log(
            'customer',
            $nextStatus === 'active' ? 'activated' : 'archived',
            $nextStatus === 'active' ? 'Customer marked as active.' : 'Customer archived.',
            $customer,
            request()->user()?->id,
            $customer->customer_code,
            [
                'status' => $nextStatus,
            ]
        );

        return Redirect::back()->with(
            'success',
            $nextStatus === 'active'
                ? __('Customer marked as active successfully.')
                : __('Customer archived successfully.')
        );
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


    protected function customerPayload(Customer $customer): array
    {
        $loanSummaries = $customer->loans
            ->map(fn (Loan $loan) => $this->loanSummaryPayload($loan))
            ->values();

        $allInstallments = $customer->loans
            ->flatMap(fn (Loan $loan) => $loan->installments)
            ->values();

        $allPayments = $customer->loans
            ->flatMap(fn (Loan $loan) => $loan->payments)
            ->sortByDesc(fn (Payment $payment) => optional($payment->payment_date)->timestamp ?? 0)
            ->values();

        $activeLoanCount = $loanSummaries->where('status', 'active')->count();
        $totalPrincipal = (float) $loanSummaries->sum('principal_amount');
        $totalPayable = (float) $loanSummaries->sum('total_payable');
        $totalPaid = (float) $loanSummaries->sum('financial_summary.total_paid');
        $remainingBalance = (float) $loanSummaries->sum('financial_summary.remaining_balance');
        $overdueAmount = (float) $loanSummaries->sum('financial_summary.overdue_amount');
        $openInstallments = (int) $loanSummaries->sum('installment_summary.open');

        $dueTodayAmount = (float) $allInstallments
            ->filter(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true) && optional($installment->due_date)?->isToday())
            ->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount));

        $nextDueInstallment = $allInstallments
            ->filter(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount) > 0)
            ->sortBy(fn (Installment $installment) => optional($installment->due_date)?->timestamp ?? PHP_INT_MAX)
            ->first();

        return [
            'id' => $customer->id,
            'customer_code' => $customer->customer_code,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'nid_number' => $customer->nid_number,
            'date_of_birth' => $customer->date_of_birth?->format('Y-m-d'),
            'gender' => $customer->gender,
            'father_name' => $customer->father_name,
            'mother_name' => $customer->mother_name,
            'spouse_name' => $customer->spouse_name,
            'occupation' => $customer->occupation,
            'present_address' => $customer->present_address,
            'permanent_address' => $customer->permanent_address,
            'status' => $customer->status,
            'assigned_staff_id' => $customer->assigned_staff_id,
            'notes' => $customer->notes,

            'photo_path' => $customer->photo_path,
            'nid_front_path' => $customer->nid_front_path,
            'nid_back_path' => $customer->nid_back_path,

            'has_photo' => (bool) $customer->has_photo,
            'has_documents' => (bool) $customer->has_documents,

            'photo_url' => $customer->photo_url,
            'nid_front_url' => $customer->nid_front_url,
            'nid_back_url' => $customer->nid_back_url,

            'photo_preview' => $customer->photo_preview,
            'nid_front_preview' => $customer->nid_front_preview,
            'nid_back_preview' => $customer->nid_back_preview,

            'portal_account' => $customer->portalUser ? [
                'id' => $customer->portalUser->id,
                'name' => $customer->portalUser->name,
                'username' => $customer->portalUser->username,
                'email' => $customer->portalUser->email,
                'login_phone' => $customer->phone,
                'portal_access_enabled' => (bool) $customer->portalUser->portal_access_enabled,
                'last_login_at' => $customer->portalUser->last_login_at?->format('Y-m-d H:i'),
            ] : null,

            'guarantor_summary' => [
                'linked_count' => $customer->guarantors->count(),
                'note' => $customer->guarantors->isEmpty()
                    ? 'No guarantor is linked yet. Add the first guarantor from this customer profile.'
                    : 'Guarantor linkage is active for this customer.',
            ],

            'guarantors' => $customer->guarantors->map(fn (Guarantor $guarantor) => [
                'id' => $guarantor->id,
                'guarantor_code' => $guarantor->guarantor_code,
                'name' => $guarantor->name,
                'phone' => $guarantor->phone,
                'relationship' => $guarantor->relationship,
                'status' => $guarantor->status,
                'photo_path' => $guarantor->photo_path,
                'nid_front_path' => $guarantor->nid_front_path,
                'nid_back_path' => $guarantor->nid_back_path,
                'photo_url' => $guarantor->photo_url ?? null,
                'nid_front_url' => $guarantor->nid_front_url ?? null,
                'nid_back_url' => $guarantor->nid_back_url ?? null,
                'photo_preview' => $guarantor->photo_preview ?? null,
                'nid_front_preview' => $guarantor->nid_front_preview ?? null,
                'nid_back_preview' => $guarantor->nid_back_preview ?? null,
            ])->values(),

            'assigned_staff' => $customer->assignedStaff ? [
                'id' => $customer->assignedStaff->id,
                'name' => $customer->assignedStaff->name,
                'email' => $customer->assignedStaff->email,
            ] : null,

            'documents' => $customer->documents->map(fn ($document) => [
                'id' => $document->id,
                'document_code' => $document->document_code,
                'title' => $document->title,
                'document_type' => $document->document_type,
                'status' => $document->status ?? null,
                'expiry_date' => $document->expiry_date
                    ? (method_exists($document->expiry_date, 'format')
                        ? $document->expiry_date->format('Y-m-d')
                        : (string) $document->expiry_date)
                    : null,
                'file_path' => $document->file_path ?? null,
                'file_url' => ! empty($document->file_path) && Storage::disk('public')->exists($document->file_path)
                    ? Storage::disk('public')->url($document->file_path)
                    : null,
                'is_pdf' => ! empty($document->file_path)
                    ? Str::lower(pathinfo($document->file_path, PATHINFO_EXTENSION)) === 'pdf'
                    : false,
                'is_image' => ! empty($document->file_path)
                    ? in_array(Str::lower(pathinfo($document->file_path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)
                    : false,
            ])->values(),

            'loans' => $loanSummaries,

            'loan_summary' => [
                'linked_count' => $customer->loans->count(),
                'active_count' => $activeLoanCount,
            ],

            'financial_summary' => [
                'total_principal' => round($totalPrincipal, 2),
                'total_payable' => round($totalPayable, 2),
                'total_paid' => round($totalPaid, 2),
                'remaining_balance' => round(max(0, $remainingBalance), 2),
                'overdue_amount' => round(max(0, $overdueAmount), 2),
                'due_today_amount' => round(max(0, $dueTodayAmount), 2),
                'next_due_date' => $nextDueInstallment?->due_date?->format('Y-m-d'),
                'active_loan_count' => $activeLoanCount,
                'open_installments' => $openInstallments,
            ],

            'recent_payments' => $allPayments->take(5)->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->format('Y-m-d'),
                'payment_type' => $payment->payment_type ?: 'regular',
                'loan_id' => $payment->loan_id,
                'loan_code' => optional($customer->loans->firstWhere('id', $payment->loan_id))->loan_code,
            ])->values(),

            'created_at' => $customer->created_at?->format('Y-m-d h:i A'),
            'updated_at' => $customer->updated_at?->format('Y-m-d h:i A'),
        ];
    }

    protected function loanSummaryPayload(Loan $loan): array
    {
        $totalPaid = (float) $loan->payments->sum(fn (Payment $payment) => (float) $payment->amount);
        $remainingBalance = max(0, round((float) $loan->total_payable - $totalPaid, 2));

        $openInstallments = $loan->installments
            ->filter(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount) > 0)
            ->values();

        $overdueAmount = (float) $openInstallments
            ->filter(fn (Installment $installment) => optional($installment->due_date)?->isPast() && ! optional($installment->due_date)?->isToday())
            ->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount));

        $nextDueInstallment = $openInstallments
            ->sortBy(fn (Installment $installment) => optional($installment->due_date)?->timestamp ?? PHP_INT_MAX)
            ->first();

        return [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'principal_amount' => (float) $loan->principal_amount,
            'total_payable' => (float) $loan->total_payable,
            'status' => $loan->status,
            'start_date' => $loan->start_date?->format('Y-m-d'),
            'financial_summary' => [
                'total_paid' => round($totalPaid, 2),
                'remaining_balance' => round($remainingBalance, 2),
                'overdue_amount' => round(max(0, $overdueAmount), 2),
                'next_due_date' => $nextDueInstallment?->due_date?->format('Y-m-d'),
                'next_due_amount' => $nextDueInstallment
                    ? round(max(0, (float) $nextDueInstallment->installment_amount - (float) $nextDueInstallment->paid_amount), 2)
                    : 0,
            ],
            'installment_summary' => [
                'total' => $loan->installments->count(),
                'open' => $openInstallments->count(),
                'paid' => $loan->installments->where('status', 'paid')->count(),
            ],
        ];
    }


    protected function customerLedgerPayload(Customer $customer): array
    {
        $customer->loadMissing([
            'assignedStaff:id,name,email',
            'loans.installments:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status',
            'loans.payments:id,loan_id,customer_id,installment_id,payment_code,amount,payment_date,payment_method,payment_type,batch_reference,notes,collected_by',
            'loans.payments.collector:id,name',
        ]);

        $loanSummaries = $customer->loans
            ->map(fn (Loan $loan) => $this->loanSummaryPayload($loan))
            ->values();

        $installments = $customer->loans
            ->flatMap(function (Loan $loan) {
                return $loan->installments->map(function (Installment $installment) use ($loan) {
                    $outstanding = max(0, round((float) $installment->installment_amount - (float) $installment->paid_amount, 2));

                    return [
                        'id' => $installment->id,
                        'loan_id' => $loan->id,
                        'loan_code' => $loan->loan_code,
                        'installment_no' => $installment->installment_no,
                        'due_date' => $installment->due_date?->format('Y-m-d'),
                        'installment_amount' => (float) $installment->installment_amount,
                        'paid_amount' => (float) $installment->paid_amount,
                        'outstanding_amount' => $outstanding,
                        'status' => $installment->status,
                    ];
                });
            })
            ->sortBy([['due_date', 'asc'], ['installment_no', 'asc']])
            ->values();

        $payments = $customer->loans
            ->flatMap(function (Loan $loan) {
                return $loan->payments->map(function (Payment $payment) use ($loan) {
                    return [
                        'id' => $payment->id,
                        'loan_id' => $loan->id,
                        'loan_code' => $loan->loan_code,
                        'installment_id' => $payment->installment_id,
                        'payment_code' => $payment->payment_code,
                        'payment_date' => $payment->payment_date?->format('Y-m-d'),
                        'amount' => (float) $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'payment_type' => $payment->payment_type ?: 'regular',
                        'batch_reference' => $payment->batch_reference,
                        'collector' => $payment->collector?->name,
                        'notes' => $payment->notes,
                    ];
                });
            })
            ->sortByDesc('payment_date')
            ->values();

        $regularPayments = $payments->where('payment_type', 'regular');
        $settlementPayments = $payments->where('payment_type', 'full_settlement');
        $lastPayment = $payments->first();

        return [
            'id' => $customer->id,
            'customer_code' => $customer->customer_code,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'status' => $customer->status,
            'assigned_staff' => $customer->assignedStaff ? [
                'id' => $customer->assignedStaff->id,
                'name' => $customer->assignedStaff->name,
                'email' => $customer->assignedStaff->email,
            ] : null,
            'loans' => $loanSummaries,
            'installments' => $installments->values()->all(),
            'payments' => $payments->values()->all(),
            'financial_summary' => [
                'total_principal' => round((float) $loanSummaries->sum('principal_amount'), 2),
                'total_payable' => round((float) $loanSummaries->sum('total_payable'), 2),
                'total_paid' => round((float) $loanSummaries->sum('financial_summary.total_paid'), 2),
                'remaining_balance' => round((float) $loanSummaries->sum('financial_summary.remaining_balance'), 2),
                'overdue_amount' => round((float) $loanSummaries->sum('financial_summary.overdue_amount'), 2),
                'active_loan_count' => $loanSummaries->where('status', 'active')->count(),
                'closed_loan_count' => $loanSummaries->where('status', 'closed')->count(),
                'open_installments' => $loanSummaries->sum('installment_summary.open'),
                'payment_count' => $payments->count(),
                'regular_payment_total' => round((float) $regularPayments->sum('amount'), 2),
                'settlement_payment_total' => round((float) $settlementPayments->sum('amount'), 2),
                'last_payment_date' => $lastPayment['payment_date'] ?? null,
            ],
            'recent_payments' => $payments->take(10)->values()->all(),
        ];
    }

    protected function customerIndexQuery(Request $request): array
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');
        $gender = (string) $request->string('gender', 'all');
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $query = Customer::query()
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested->where('customer_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('nid_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(
                in_array($status, ['active', 'inactive'], true),
                fn ($builder) => $builder->where('status', $status)
            )
            ->when(
                in_array($gender, ['male', 'female', 'other'], true),
                fn ($builder) => $builder->where('gender', $gender)
            );

        return [$search, $status, $gender, $perPage, $query];
    }

    protected function generateCustomerCode(): string
    {
        $latestNumericSuffix = Customer::query()
            ->select('customer_code')
            ->get()
            ->map(function (Customer $customer) {
                if (preg_match('/(\d+)$/', (string) $customer->customer_code, $matches) !== 1) {
                    return 0;
                }

                return (int) $matches[1];
            })
            ->max() ?? 0;

        $nextNumber = max(1, $latestNumericSuffix + 1);

        do {
            $candidate = 'CUS-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
            $exists = Customer::where('customer_code', $candidate)->exists();
            $nextNumber++;
        } while ($exists);

        return $candidate;
    }

    protected function generateUniqueUsername(Customer $customer): string
    {
        $base = Str::of($customer->name ?: $customer->customer_code)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', '')
            ->value();

        if (blank($base)) {
            $base = 'customer';
        }

        $base = substr($base, 0, 20);
        $candidate = $base;
        $counter = 1;

        while (User::where('username', $candidate)->exists()) {
            $candidate = substr($base, 0, 16) . str_pad((string) $counter, 4, '0', STR_PAD_LEFT);
            $counter++;
        }

        return $candidate;
    }

    protected function syncCustomerIdentityMedia(Request $request, Customer $customer): void
    {
        $updates = [];
        $base = "customers/{$customer->id}/identity";

        if ($request->boolean('remove_photo')) {
            $this->deleteStoredFile($customer->photo_path);
            $updates['photo_path'] = null;
        }

        if ($request->hasFile('photo')) {
            $this->deleteStoredFile($customer->photo_path);
            $updates['photo_path'] = $request->file('photo')->store($base, 'public');
        }

        if ($request->boolean('remove_nid_front')) {
            $this->deleteStoredFile($customer->nid_front_path);
            $updates['nid_front_path'] = null;
        }

        if ($request->hasFile('nid_front')) {
            $this->deleteStoredFile($customer->nid_front_path);
            $updates['nid_front_path'] = $request->file('nid_front')->store($base, 'public');
        }

        if ($request->boolean('remove_nid_back')) {
            $this->deleteStoredFile($customer->nid_back_path);
            $updates['nid_back_path'] = null;
        }

        if ($request->hasFile('nid_back')) {
            $this->deleteStoredFile($customer->nid_back_path);
            $updates['nid_back_path'] = $request->file('nid_back')->store($base, 'public');
        }

        if ($updates) {
            $customer->forceFill($updates)->save();
        }
    }

    protected function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
