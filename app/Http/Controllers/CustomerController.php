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
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function dashboard(): Response
    {
        $dueTodayQuery = Installment::query()->whereDate('due_date', today());
        $paymentsTodayQuery = Payment::query()->whereDate('payment_date', today());
        $paymentsMonthQuery = Payment::query()->whereBetween('payment_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()]);
        $openInstallments = Installment::query()->whereIn('status', ['pending', 'partial', 'overdue'])->get();

        return Inertia::render('dashboard/index', [
            'customerStats' => [
                'total' => Customer::count(),
                'active' => Customer::where('status', 'active')->count(),
                'inactive' => Customer::where('status', 'inactive')->count(),
                'new_this_month' => Customer::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'guarantors' => Guarantor::count(),
                'loans' => Loan::count(),
                'active_loans' => Loan::where('status', 'active')->count(),
                'installments' => Installment::count(),
                'pending_installments' => Installment::whereIn('status', ['pending', 'partial'])->count(),
                'overdue_installments' => Installment::whereIn('status', ['pending', 'partial', 'overdue'])->whereDate('due_date', '<', today())->count(),
                'due_today_count' => (clone $dueTodayQuery)->count(),
                'due_today_amount' => (float) (clone $dueTodayQuery)->sum('installment_amount'),
                'collected_today_amount' => (float) (clone $paymentsTodayQuery)->sum('amount'),
                'payments_today_count' => (clone $paymentsTodayQuery)->count(),
                'payments_this_month_count' => (clone $paymentsMonthQuery)->count(),
                'collected_this_month_amount' => (float) (clone $paymentsMonthQuery)->sum('amount'),
                'outstanding_open_amount' => (float) $openInstallments->sum(fn (Installment $installment) => (float) $installment->installment_amount - (float) $installment->paid_amount),
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
                'has_photo' => filled($customer->photo_path),
                'has_documents' => filled($customer->nid_front_path) || filled($customer->nid_back_path),
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
            'customer_code', 'name', 'phone', 'email', 'nid_number', 'gender', 'occupation', 'status', 'created_at',
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

        return CsvExportService::download($filename, ['Customer Code', 'Name', 'Phone', 'Email', 'NID', 'Gender', 'Occupation', 'Status', 'Created At'], $rows);
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
        $customer = Customer::create([
            ...$request->safe()->except(['photo', 'nid_front', 'nid_back', 'remove_photo', 'remove_nid_front', 'remove_nid_back', 'create_portal_account', 'portal_email', 'portal_password', 'portal_password_confirmation', 'portal_access_enabled']),
            'customer_code' => $this->generateCustomerCode(),
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
            'assigned_staff_id' => $request->validated('assigned_staff_id'),
        ]);

        $this->syncCustomerIdentityMedia($request, $customer);

        if ($request->boolean('create_portal_account')) {
            $portalUser = User::create([
                'customer_id' => $customer->id,
                'name' => $customer->name,
                'email' => $request->validated('portal_email'),
                'password' => $request->validated('portal_password'),
                'is_active' => true,
                'portal_access_enabled' => (bool) $request->boolean('portal_access_enabled', true),
            ]);

            $portalUser->assignRole('customer');
        }

        AuditLogService::log('customer', 'created', 'Customer created.', $customer, $request->user()?->id, $customer->customer_code, [
            'name' => $customer->name,
            'status' => $customer->status,
            'assigned_staff_id' => $customer->assigned_staff_id,
        ]);

        return Redirect::route('customers.show', $customer)->with('success', __('Customer created successfully.'));
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'assignedStaff:id,name,email',
            'guarantors:id,customer_id,guarantor_code,name,phone,relationship,status,photo_path,nid_front_path,nid_back_path',
            'loans:id,customer_id,loan_code,principal_amount,total_payable,status,start_date',
            'documents:id,customer_id,document_code,title,document_type',
            'portalUsers:id,customer_id,name,email,portal_access_enabled,last_login_at',
        ]);

        return Inertia::render('customers/show', [
            'customer' => $this->customerPayload($customer),
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
                ...$request->safe()->except(['photo', 'nid_front', 'nid_back', 'remove_photo', 'remove_nid_front', 'remove_nid_back']),
                'updated_by' => $request->user()?->id,
                'assigned_staff_id' => $request->validated('assigned_staff_id'),
            ]);

            $this->syncCustomerIdentityMedia($request, $customer);

            AuditLogService::log('customer', 'updated', 'Customer updated.', $customer, $request->user()?->id, $customer->customer_code, [
                'name' => $customer->name,
                'status' => $customer->status,
                'assigned_staff_id' => $customer->assigned_staff_id,
            ]);

            return Redirect::route('customers.show', $customer)->with('success', __('Customer updated successfully.'));
        } catch (Throwable $exception) {
            return Redirect::back()->withInput()->with('error', __('Customer update failed. Please check the form and try again.'));
        }
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        try {
            $this->deleteStoredFile($customer->photo_path);
            $this->deleteStoredFile($customer->nid_front_path);
            $this->deleteStoredFile($customer->nid_back_path);

            $customer->portalUsers()->delete();

            AuditLogService::log('customer', 'deleted', 'Customer deleted.', $customer, request()->user()?->id, $customer->customer_code, [
                'name' => $customer->name,
            ]);

            $customer->delete();

            return Redirect::route('customers.index')->with('success', __('Customer deleted successfully.'));
        } catch (Throwable $exception) {
            return Redirect::back()->with('error', __('Customer delete failed. Remove related records first if needed.'));
        }
    }

    public function archive(Customer $customer): RedirectResponse
    {
        $nextStatus = $customer->status === 'active' ? 'inactive' : 'active';

        $customer->update([
            'status' => $nextStatus,
            'updated_by' => request()->user()?->id,
        ]);

        AuditLogService::log('customer', $nextStatus === 'active' ? 'activated' : 'archived', $nextStatus === 'active' ? 'Customer marked as active.' : 'Customer archived.', $customer, request()->user()?->id, $customer->customer_code, [
            'status' => $nextStatus,
        ]);

        return Redirect::back()->with('success', $nextStatus === 'active' ? __('Customer marked as active successfully.') : __('Customer archived successfully.'));
    }

    protected function staffOptions(): array
    {
        return User::query()->role(['super-admin', 'admin'])->orderBy('name')->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
            ])->values()->all();
    }

    protected function customerPayload(Customer $customer): array
    {
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
            'photo_url' => $customer->photo_url,
            'nid_front_url' => $customer->nid_front_url,
            'nid_back_url' => $customer->nid_back_url,
            'portal_account' => $customer->portalUser ? [
                'id' => $customer->portalUser->id,
                'name' => $customer->portalUser->name,
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
            ]),
            'loans' => $customer->loans->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'principal_amount' => (float) $loan->principal_amount,
                'total_payable' => (float) $loan->total_payable,
                'status' => $loan->status,
                'start_date' => $loan->start_date?->format('Y-m-d'),
            ])->values(),
            'loan_summary' => ['linked_count' => $customer->loans->count()],
            'created_at' => $customer->created_at?->format('Y-m-d h:i A'),
            'updated_at' => $customer->updated_at?->format('Y-m-d h:i A'),
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
            ->when(in_array($status, ['active', 'inactive'], true), fn ($builder) => $builder->where('status', $status))
            ->when(in_array($gender, ['male', 'female', 'other'], true), fn ($builder) => $builder->where('gender', $gender));

        return [$search, $status, $gender, $perPage, $query];
    }

    protected function generateCustomerCode(): string
    {
        $latestNumericSuffix = Customer::query()->select('customer_code')->get()->map(function (Customer $customer) {
            if (preg_match('/(\d+)$/', (string) $customer->customer_code, $matches) !== 1) {
                return 0;
            }
            return (int) $matches[1];
        })->max() ?? 0;

        $nextNumber = max(1, $latestNumericSuffix + 1);
        do {
            $candidate = 'CUS-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
            $exists = Customer::where('customer_code', $candidate)->exists();
            $nextNumber++;
        } while ($exists);

        return $candidate;
    }

    protected function syncCustomerIdentityMedia(Request $request, Customer $customer): void
    {
        $updates = [];
        $disk = Storage::disk('public');
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
