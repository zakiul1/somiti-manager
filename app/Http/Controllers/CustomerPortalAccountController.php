<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerPortalAccountRequest;
use App\Http\Requests\UpdateCustomerPortalAccountRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerPortalAccountController extends Controller
{
    public function create(Customer $customer): Response|RedirectResponse
    {
        if ($customer->portalUser) {
            return redirect()->route('customer-portal-accounts.edit', $customer);
        }

        return Inertia::render('customer-portal-accounts/create', [
            'customer' => $this->customerPayload($customer),
        ]);
    }

    public function store(StoreCustomerPortalAccountRequest $request, Customer $customer): RedirectResponse
    {
        abort_if($customer->portalUser, 409, 'Portal account already exists for this customer.');

        $user = User::create([
            'customer_id' => $customer->id,
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'is_active' => true,
            'portal_access_enabled' => (bool) $request->boolean('portal_access_enabled', true),
        ]);

        $user->assignRole('customer');

        if (! $customer->email && $user->email) {
            $customer->update(['email' => $user->email]);
        }

        return redirect()->route('customers.show', $customer)->with('success', __('Customer portal account created successfully.'));
    }

    public function edit(Customer $customer): Response|RedirectResponse
    {
        if (! $customer->portalUser) {
            return redirect()->route('customer-portal-accounts.create', $customer);
        }

        return Inertia::render('customer-portal-accounts/edit', [
            'customer' => $this->customerPayload($customer),
            'portalAccount' => $this->portalPayload($customer->portalUser, $customer),
        ]);
    }

    public function update(UpdateCustomerPortalAccountRequest $request, Customer $customer): RedirectResponse
    {
        abort_unless($customer->portalUser, 404);

        $payload = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'portal_access_enabled' => (bool) $request->boolean('portal_access_enabled', true),
        ];

        if ($request->filled('password')) {
            $payload['password'] = $request->validated('password');
        }

        $customer->portalUser->update($payload);

        if ($request->filled('email')) {
            $customer->update(['email' => $request->validated('email')]);
        }

        return redirect()->route('customers.show', $customer)->with('success', __('Customer portal account updated successfully.'));
    }

    public function toggle(Customer $customer): RedirectResponse
    {
        abort_unless($customer->portalUser, 404);

        $customer->portalUser->update([
            'portal_access_enabled' => ! $customer->portalUser->portal_access_enabled,
        ]);

        return redirect()->route('customers.show', $customer)->with('success', __('Customer portal access status updated.'));
    }

    private function customerPayload(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'customer_code' => $customer->customer_code,
        ];
    }

    private function portalPayload(User $user, Customer $customer): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'login_phone' => $customer->phone,
            'portal_access_enabled' => (bool) $user->portal_access_enabled,
            'last_login_at' => optional($user->last_login_at)->format('Y-m-d H:i'),
        ];
    }
}
