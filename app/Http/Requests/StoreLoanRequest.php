<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'guarantor_ids' => ['nullable', 'array', 'min:1'],
            'guarantor_ids.*' => ['integer', 'exists:guarantors,id'],
            'principal_amount' => ['required', 'numeric', 'min:1'],
            'interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'duration_value' => ['required', 'integer', 'min:1', 'max:120'],
            'duration_unit' => ['required', Rule::in(['days', 'weeks', 'months'])],
            'collection_frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
            'start_date' => ['required', 'date'],
            'first_collection_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(['draft', 'approved', 'active', 'closed', 'defaulted'])],
            'assigned_staff_id' => ['nullable', 'integer', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'A customer is required for every loan.',
            'principal_amount.required' => 'Loan amount is required.',
            'interest_rate.required' => 'Flat interest rate is required.',
            'first_collection_date.after_or_equal' => 'First collection date must be on or after the start date.',
        ];
    }
}
