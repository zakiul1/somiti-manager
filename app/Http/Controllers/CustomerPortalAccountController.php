<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerPortalAccountRequest;
use App\Http\Requests\UpdateCustomerPortalAccountRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;
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

        try {
            DB::transaction(function () use ($request, $customer) {
                $name = trim((string) $request->validated('name'));
                $email = trim((string) $request->validated('email'));
                $password = $request->validated('password');

                $user = User::create([
                    'customer_id' => $customer->id,
                    'name' => $name,
                    'username' => $this->generateUniqueUsername($name, $customer->customer_code),
                    'email' => $email,
                    'password' => $password,
                    'is_active' => true,
                    'portal_access_enabled' => (bool) $request->boolean('portal_access_enabled', true),
                ]);

                $user->assignRole('customer');

                if (blank($customer->email) && filled($user->email)) {
                    $customer->update([
                        'email' => $user->email,
                    ]);
                }
            });

            return redirect()
                ->route('customers.show', $customer)
                ->with('success', __('Customer portal account created successfully.'));
        } catch (Throwable $exception) {
            Log::error('Customer portal account create failed.', [
                'customer_id' => $customer->id,
                'customer_code' => $customer->customer_code,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => $request->user()?->id,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', __('Customer portal account creation failed. Please check the form and try again.'));
        }
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

        try {
            DB::transaction(function () use ($request, $customer) {
                $portalUser = $customer->portalUser;

                $payload = [
                    'name' => trim((string) $request->validated('name')),
                    'email' => trim((string) $request->validated('email')),
                    'portal_access_enabled' => (bool) $request->boolean('portal_access_enabled', true),
                ];

                if (blank($portalUser->username)) {
                    $payload['username'] = $this->generateUniqueUsername(
                        $payload['name'],
                        $customer->customer_code
                    );
                }

                if ($request->filled('password')) {
                    $payload['password'] = $request->validated('password');
                }

                $portalUser->update($payload);

                if ($request->filled('email')) {
                    $customer->update([
                        'email' => trim((string) $request->validated('email')),
                    ]);
                }
            });

            return redirect()
                ->route('customers.show', $customer)
                ->with('success', __('Customer portal account updated successfully.'));
        } catch (Throwable $exception) {
            Log::error('Customer portal account update failed.', [
                'customer_id' => $customer->id,
                'portal_user_id' => $customer->portalUser?->id,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => $request->user()?->id,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', __('Customer portal account update failed. Please try again.'));
        }
    }

    public function toggle(Customer $customer): RedirectResponse
    {
        abort_unless($customer->portalUser, 404);

        try {
            $portalUser = $customer->portalUser;

            $portalUser->update([
                'portal_access_enabled' => ! (bool) $portalUser->portal_access_enabled,
            ]);

            return redirect()
                ->route('customers.show', $customer)
                ->with('success', $portalUser->portal_access_enabled
                    ? __('Customer portal access enabled successfully.')
                    : __('Customer portal access disabled successfully.'));
        } catch (Throwable $exception) {
            Log::error('Customer portal access toggle failed.', [
                'customer_id' => $customer->id,
                'portal_user_id' => $customer->portalUser?->id,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => request()->user()?->id,
            ]);

            return redirect()
                ->back()
                ->with('error', __('Customer portal access update failed.'));
        }
    }

    private function customerPayload(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'customer_code' => $customer->customer_code,
            'photo_url' => $customer->photo_url,
            'status' => $customer->status,
        ];
    }

    private function portalPayload(User $user, Customer $customer): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'login_phone' => $customer->phone,
            'portal_access_enabled' => (bool) $user->portal_access_enabled,
            'is_active' => (bool) $user->is_active,
            'last_login_at' => optional($user->last_login_at)?->format('Y-m-d H:i'),
        ];
    }

    private function generateUniqueUsername(string $name, ?string $customerCode = null): string
    {
        $base = Str::of($name ?: $customerCode ?: 'customer')
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
}