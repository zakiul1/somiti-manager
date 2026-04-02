<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuarantorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-() ]+$/', 'unique:guarantors,phone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:guarantors,email'],
            'nid_number' => ['nullable', 'string', 'max:50', 'unique:guarantors,nid_number'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'relationship' => ['nullable', 'string', 'max:100'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string', 'max:2000'],

            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'nid_front' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'nid_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],

            'remove_photo' => ['nullable', 'boolean'],
            'remove_nid_front' => ['nullable', 'boolean'],
            'remove_nid_back' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => __('Please select a customer.'),
            'customer_id.exists' => __('The selected customer was not found.'),

            'name.required' => __('Guarantor name is required.'),
            'phone.required' => __('Phone number is required.'),
            'phone.regex' => __('Please enter a valid phone number.'),
            'phone.unique' => __('This phone number is already used by another guarantor.'),

            'email.email' => __('Please enter a valid email address.'),
            'email.unique' => __('This email is already used by another guarantor.'),

            'nid_number.unique' => __('This NID number is already used by another guarantor.'),
            'date_of_birth.before' => __('Date of birth must be before today.'),

            'status.required' => __('Status is required.'),

            'photo.image' => __('Photo must be an image file.'),
            'photo.mimes' => __('Photo must be JPG, JPEG, PNG, or WEBP.'),
            'photo.max' => __('Photo may not be greater than 4 MB.'),

            'nid_front.mimes' => __('NID front must be JPG, JPEG, PNG, WEBP, or PDF.'),
            'nid_front.max' => __('NID front file may not be greater than 5 MB.'),

            'nid_back.mimes' => __('NID back must be JPG, JPEG, PNG, WEBP, or PDF.'),
            'nid_back.max' => __('NID back file may not be greater than 5 MB.'),
        ];
    }
}