<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerPortalAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['super-admin', 'admin']) ?? false;
    }

    public function rules(): array
    {
        $customer = $this->route('customer');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email', Rule::unique('customers', 'email')->ignore($customer?->id)],
            'password' => ['required', 'confirmed', 'min:8'],
            'portal_access_enabled' => ['nullable', 'boolean'],
        ];
    }
}
