<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'nid_front' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'nid_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
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
                'string',
                'confirmed',
                'min:8',
                'max:255',
            ],

            'portal_password_confirmation' => [
                Rule::requiredIf($createPortalAccount),
                'nullable',
                'string',
                'min:8',
                'max:255',
            ],

            'portal_access_enabled' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $createPortalAccount = $this->boolean('create_portal_account');
            $customerEmail = trim((string) $this->input('email', ''));
            $portalEmail = trim((string) $this->input('portal_email', ''));
            $portalPassword = (string) $this->input('portal_password', '');
            $portalPasswordConfirmation = (string) $this->input('portal_password_confirmation', '');

            if ($createPortalAccount && $customerEmail === '' && $portalEmail === '') {
                $validator->errors()->add(
                    'portal_email',
                    __('Portal email is required when customer email is empty and portal access is enabled.')
                );
            }

            if ($createPortalAccount && trim($portalPassword) === '') {
                $validator->errors()->add(
                    'portal_password',
                    __('Portal password is required when creating customer portal access.')
                );
            }

            if ($createPortalAccount && trim($portalPasswordConfirmation) === '') {
                $validator->errors()->add(
                    'portal_password_confirmation',
                    __('Portal password confirmation is required when creating customer portal access.')
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => __('Customer name is required.'),
            'phone.required' => __('Phone number is required.'),
            'phone.unique' => __('This phone number is already used by another customer.'),
            'email.email' => __('Please enter a valid customer email address.'),
            'email.unique' => __('This customer email is already used by another customer.'),
            'nid_number.unique' => __('This NID number is already used by another customer.'),
            'date_of_birth.before' => __('Date of birth must be before today.'),
            'status.required' => __('Customer status is required.'),

            'photo.image' => __('Customer photo must be an image file.'),
            'photo.mimes' => __('Customer photo must be JPG, JPEG, PNG, or WEBP.'),
            'photo.max' => __('Customer photo may not be greater than 4 MB.'),

            'nid_front.mimes' => __('NID front must be JPG, JPEG, PNG, WEBP, or PDF.'),
            'nid_front.max' => __('NID front file may not be greater than 5 MB.'),

            'nid_back.mimes' => __('NID back must be JPG, JPEG, PNG, WEBP, or PDF.'),
            'nid_back.max' => __('NID back file may not be greater than 5 MB.'),

            'portal_email.required' => __('Portal email is required when creating customer portal access without a customer email.'),
            'portal_email.email' => __('Please enter a valid portal email address.'),
            'portal_email.unique' => __('This portal email is already used by another user.'),

            'portal_password.required' => __('Portal password is required when creating customer portal access.'),
            'portal_password.confirmed' => __('Portal password confirmation does not match.'),
            'portal_password.min' => __('Portal password must be at least 8 characters.'),

            'portal_password_confirmation.required' => __('Portal password confirmation is required when creating customer portal access.'),
        ];
    }
}