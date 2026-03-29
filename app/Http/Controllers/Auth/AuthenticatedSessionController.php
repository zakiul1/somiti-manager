<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'variant' => 'admin',
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function createCustomer(): Response
    {
        return Inertia::render('Auth/Login', [
            'variant' => 'customer',
            'canResetPassword' => false,
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        return $this->loginAndRedirect($request, false);
    }

    public function storeCustomer(LoginRequest $request): RedirectResponse
    {
        return $this->loginAndRedirect($request, true);
    }

    private function loginAndRedirect(LoginRequest $request, bool $customerOnly): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        if ($customerOnly && ! $user->hasRole('customer')) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'login' => __('Only customer portal accounts can sign in here.'),
            ]);
        }

        if (! $user->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                $customerOnly ? 'login' : 'email' => __('Your account is inactive.'),
            ]);
        }

        if ($user->hasRole('customer') && ! $user->portal_access_enabled) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                $customerOnly ? 'login' : 'email' => __('Your portal access is disabled. Please contact the somiti office.'),
            ]);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        if ($user->hasRole('customer')) {
            $request->session()->forget('url.intended');

            return redirect()->route('portal.dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
