<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $createPortalAccount = $this->boolean('create_portal_account');
        $customerEmail = trim((string) $this->input('email', ''));
        $portalEmail = trim((string) $this->input('portal_email', ''));

        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-() ]+$/', 'unique:customers,phone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:customers,email'],
            'nid_number' => ['nullable', 'string', 'max:50', 'unique:customers,nid_number'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'father_name' => ['nullable', 'string', 'max:255'],
            'mother_name' => ['nullable', 'string', 'max:255'],
            'spouse_name' => ['nullable', 'string', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'present_address' => ['nullable', 'string', 'max:1000'],
            'permanent_address' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'assigned_staff_id' => ['nullable', 'integer', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'nid_front' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'nid_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'remove_photo' => ['nullable', 'boolean'],
            'remove_nid_front' => ['nullable', 'boolean'],
            'remove_nid_back' => ['nullable', 'boolean'],

            'create_portal_account' => ['nullable', 'boolean'],

            'portal_email' => [
                Rule::requiredIf($createPortalAccount && $customerEmail === ''),
                'nullable',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'portal_password' => [
                Rule::requiredIf($createPortalAccount),
                'nullable',
                'confirmed',
                'min:8',
            ],

            'portal_access_enabled' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $createPortalAccount = $this->boolean('create_portal_account');
            $customerEmail = trim((string) $this->input('email', ''));
            $portalEmail = trim((string) $this->input('portal_email', ''));

            if ($createPortalAccount && $customerEmail === '' && $portalEmail === '') {
                $validator->errors()->add(
                    'portal_email',
                    __('Portal email is required when customer email is empty and portal access is enabled.')
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'portal_email.required' => __('Portal email is required when creating customer portal access without a customer email.'),
            'portal_password.required' => __('Portal password is required when creating customer portal access.'),
            'portal_password.confirmed' => __('Portal password confirmation does not match.'),
        ];
    }
}
