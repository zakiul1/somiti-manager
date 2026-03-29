<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->routeIs('customer.login.store')) {
            return [
                'login' => ['required', 'string', 'max:255'],
                'password' => ['required', 'string'],
            ];
        }

        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if ($this->routeIs('customer.login.store')) {
            $this->authenticateCustomer();
            RateLimiter::clear($this->throttleKey());
            return;
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    protected function authenticateCustomer(): void
    {
        $login = trim((string) $this->input('login'));

        $user = User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'customer'))
            ->where(function ($query) use ($login) {
                $query->where('email', $login)
                    ->orWhereHas('customer', fn ($customerQuery) => $customerQuery->where('phone', $login));
            })
            ->first();

        if (! $user || ! Auth::attempt(['id' => $user->id, 'password' => (string) $this->input('password')], $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => trans('auth.failed'),
            ]);
        }
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            $this->routeIs('customer.login.store') ? 'login' : 'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        $identifier = $this->routeIs('customer.login.store')
            ? $this->string('login')->toString()
            : $this->string('email')->toString();

        return Str::transliterate(Str::lower($identifier).'|'.$this->ip());
    }
}
