<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGuarantorRequest;
use App\Http\Requests\UpdateGuarantorRequest;
use App\Models\Customer;
use App\Models\Guarantor;
use App\Services\AuditLogService;
use App\Services\CsvExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class GuarantorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = (string) $request->string('status', 'all');
        $customerId = (string) $request->string('customer_id', 'all');

        $query = Guarantor::query()
            ->with('customer:id,name,customer_code')
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested->where('guarantor_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('nid_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), fn ($builder) => $builder->where('status', $status))
            ->when($customerId !== 'all' && ctype_digit($customerId), fn ($builder) => $builder->where('customer_id', (int) $customerId));

        $guarantors = $query->latest()->paginate(10)->withQueryString()->through(fn (Guarantor $guarantor) => [
            'id' => $guarantor->id,
            'guarantor_code' => $guarantor->guarantor_code,
            'name' => $guarantor->name,
            'phone' => $guarantor->phone,
            'email' => $guarantor->email,
            'relationship' => $guarantor->relationship,
            'status' => $guarantor->status,
            'has_photo' => filled($guarantor->photo_path),
            'has_documents' => filled($guarantor->nid_front_path) || filled($guarantor->nid_back_path),
            'customer' => $guarantor->customer ? [
                'id' => $guarantor->customer->id,
                'name' => $guarantor->customer->name,
                'customer_code' => $guarantor->customer->customer_code,
            ] : null,
            'created_at' => $guarantor->created_at?->format('Y-m-d'),
        ]);

        return Inertia::render('guarantors/index', [
            'guarantors' => $guarantors,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'customer_id' => $customerId,
            ],
            'stats' => [
                'total' => Guarantor::count(),
                'active' => Guarantor::where('status', 'active')->count(),
                'inactive' => Guarantor::where('status', 'inactive')->count(),
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

        $rows = Guarantor::query()->with('customer:id,name,customer_code')
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested->where('guarantor_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('nid_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), fn ($builder) => $builder->where('status', $status))
            ->when($customerId !== 'all' && ctype_digit($customerId), fn ($builder) => $builder->where('customer_id', (int) $customerId))
            ->latest()->get()
            ->map(fn (Guarantor $guarantor) => [
                $guarantor->guarantor_code,
                $guarantor->name,
                $guarantor->phone,
                $guarantor->email,
                $guarantor->relationship,
                $guarantor->customer?->customer_code,
                $guarantor->customer?->name,
                $guarantor->status,
                $guarantor->created_at?->format('Y-m-d H:i:s'),
            ]);

        return CsvExportService::download('guarantors-' . now()->format('Y-m-d-His') . '.csv', ['Guarantor Code', 'Name', 'Phone', 'Email', 'Relationship', 'Customer Code', 'Customer Name', 'Status', 'Created At'], $rows);
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

        return Inertia::render('guarantors/create', [
            'guarantorCode' => $this->generateGuarantorCode(),
            'selectedCustomer' => $selectedCustomer,
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'customer_code'])->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'customer_code' => $customer->customer_code,
            ])->values(),
        ]);
    }

    public function store(StoreGuarantorRequest $request): RedirectResponse
    {
        $guarantor = Guarantor::create([
            ...$request->safe()->except(['photo', 'nid_front', 'nid_back', 'remove_photo', 'remove_nid_front', 'remove_nid_back']),
            'guarantor_code' => $this->generateGuarantorCode(),
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        $this->syncGuarantorIdentityMedia($request, $guarantor);

        AuditLogService::log('guarantor', 'created', 'Guarantor created.', $guarantor, $request->user()?->id, $guarantor->guarantor_code, [
            'name' => $guarantor->name,
            'customer_id' => $guarantor->customer_id,
        ]);

        return Redirect::route('guarantors.show', $guarantor)->with('success', __('Guarantor created successfully.'));
    }

    public function show(Guarantor $guarantor): Response
    {
        $guarantor->load(['customer:id,name,customer_code,phone,status', 'loans:id,loan_code,principal_amount,total_payable,status,start_date']);

        return Inertia::render('guarantors/show', [
            'guarantor' => $this->guarantorPayload($guarantor),
        ]);
    }

    public function edit(Guarantor $guarantor): Response
    {
        return Inertia::render('guarantors/edit', [
            'guarantor' => $this->guarantorPayload($guarantor),
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'customer_code'])->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'customer_code' => $customer->customer_code,
            ])->values(),
        ]);
    }

    public function update(UpdateGuarantorRequest $request, Guarantor $guarantor): RedirectResponse
    {
        try {
            $guarantor->update([
                ...$request->safe()->except(['photo', 'nid_front', 'nid_back', 'remove_photo', 'remove_nid_front', 'remove_nid_back']),
                'updated_by' => $request->user()?->id,
            ]);

            $this->syncGuarantorIdentityMedia($request, $guarantor);

            AuditLogService::log('guarantor', 'updated', 'Guarantor updated.', $guarantor, $request->user()?->id, $guarantor->guarantor_code, [
                'name' => $guarantor->name,
            ]);

            return Redirect::route('guarantors.show', $guarantor)->with('success', __('Guarantor updated successfully.'));
        } catch (Throwable $exception) {
            return Redirect::back()->withInput()->with('error', __('Guarantor update failed. Please check the form and try again.'));
        }
    }

    public function destroy(Guarantor $guarantor): RedirectResponse
    {
        try {
            $this->deleteStoredFile($guarantor->photo_path);
            $this->deleteStoredFile($guarantor->nid_front_path);
            $this->deleteStoredFile($guarantor->nid_back_path);

            AuditLogService::log('guarantor', 'deleted', 'Guarantor deleted.', $guarantor, request()->user()?->id, $guarantor->guarantor_code, [
                'name' => $guarantor->name,
            ]);

            $guarantor->delete();

            return Redirect::route('guarantors.index')->with('success', __('Guarantor deleted successfully.'));
        } catch (Throwable $exception) {
            return Redirect::back()->with('error', __('Guarantor delete failed. Remove related records first if needed.'));
        }
    }

    public function archive(Guarantor $guarantor): RedirectResponse
    {
        $nextStatus = $guarantor->status === 'active' ? 'inactive' : 'active';

        $guarantor->update([
            'status' => $nextStatus,
            'updated_by' => request()->user()?->id,
        ]);

        AuditLogService::log('guarantor', $nextStatus === 'active' ? 'activated' : 'archived', $nextStatus === 'active' ? 'Guarantor marked as active.' : 'Guarantor archived.', $guarantor, request()->user()?->id, $guarantor->guarantor_code, [
            'status' => $nextStatus,
        ]);

        return Redirect::back()->with('success', $nextStatus === 'active' ? __('Guarantor marked as active successfully.') : __('Guarantor archived successfully.'));
    }

    protected function guarantorPayload(Guarantor $guarantor): array
    {
        return [
            'id' => $guarantor->id,
            'guarantor_code' => $guarantor->guarantor_code,
            'customer_id' => $guarantor->customer_id,
            'name' => $guarantor->name,
            'phone' => $guarantor->phone,
            'email' => $guarantor->email,
            'nid_number' => $guarantor->nid_number,
            'date_of_birth' => $guarantor->date_of_birth?->format('Y-m-d'),
            'gender' => $guarantor->gender,
            'relationship' => $guarantor->relationship,
            'occupation' => $guarantor->occupation,
            'address' => $guarantor->address,
            'status' => $guarantor->status,
            'notes' => $guarantor->notes,
            'photo_path' => $guarantor->photo_path,
            'nid_front_path' => $guarantor->nid_front_path,
            'nid_back_path' => $guarantor->nid_back_path,
            'photo_url' => $guarantor->photo_url,
            'nid_front_url' => $guarantor->nid_front_url,
            'nid_back_url' => $guarantor->nid_back_url,
            'customer' => $guarantor->customer ? [
                'id' => $guarantor->customer->id,
                'name' => $guarantor->customer->name,
                'customer_code' => $guarantor->customer->customer_code,
                'phone' => $guarantor->customer->phone,
                'status' => $guarantor->customer->status,
            ] : null,
            'loans' => $guarantor->relationLoaded('loans') ? $guarantor->loans->map(fn ($loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'principal_amount' => (float) $loan->principal_amount,
                'total_payable' => (float) $loan->total_payable,
                'status' => $loan->status,
                'start_date' => $loan->start_date?->format('Y-m-d'),
            ])->values() : [],
            'created_at' => $guarantor->created_at?->format('Y-m-d h:i A'),
            'updated_at' => $guarantor->updated_at?->format('Y-m-d h:i A'),
        ];
    }

    protected function generateGuarantorCode(): string
    {
        $latestNumericSuffix = Guarantor::query()->select('guarantor_code')->get()->map(function (Guarantor $guarantor) {
            if (preg_match('/(\d+)$/', (string) $guarantor->guarantor_code, $matches) !== 1) {
                return 0;
            }
            return (int) $matches[1];
        })->max() ?? 0;

        $nextNumber = max(1, $latestNumericSuffix + 1);
        do {
            $candidate = 'GUA-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
            $exists = Guarantor::where('guarantor_code', $candidate)->exists();
            $nextNumber++;
        } while ($exists);

        return $candidate;
    }

    protected function syncGuarantorIdentityMedia(Request $request, Guarantor $guarantor): void
    {
        $updates = [];
        $base = "guarantors/{$guarantor->id}/identity";

        if ($request->boolean('remove_photo')) {
            $this->deleteStoredFile($guarantor->photo_path);
            $updates['photo_path'] = null;
        }
        if ($request->hasFile('photo')) {
            $this->deleteStoredFile($guarantor->photo_path);
            $updates['photo_path'] = $request->file('photo')->store($base, 'public');
        }
        if ($request->boolean('remove_nid_front')) {
            $this->deleteStoredFile($guarantor->nid_front_path);
            $updates['nid_front_path'] = null;
        }
        if ($request->hasFile('nid_front')) {
            $this->deleteStoredFile($guarantor->nid_front_path);
            $updates['nid_front_path'] = $request->file('nid_front')->store($base, 'public');
        }
        if ($request->boolean('remove_nid_back')) {
            $this->deleteStoredFile($guarantor->nid_back_path);
            $updates['nid_back_path'] = null;
        }
        if ($request->hasFile('nid_back')) {
            $this->deleteStoredFile($guarantor->nid_back_path);
            $updates['nid_back_path'] = $request->file('nid_back')->store($base, 'public');
        }

        if ($updates) {
            $guarantor->forceFill($updates)->save();
        }
    }

    protected function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
