<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanDisbursementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'disbursement_amount' => ['required', 'numeric', 'min:0.01'],
            'disbursed_at' => ['required', 'date'],
            'disbursement_method' => ['required', Rule::in(['cash', 'bank', 'mobile_banking'])],
            'disbursement_reference' => ['nullable', 'string', 'max:255'],
            'disbursement_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'disbursement_amount.required' => 'Disbursement amount is required.',
            'disbursement_method.required' => 'Choose a disbursement method.',
            'disbursed_at.required' => 'Disbursement date is required.',
        ];
    }
}
