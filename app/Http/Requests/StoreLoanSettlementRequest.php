<?php

namespace App\Http\Requests;

use App\Models\Loan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreLoanSettlementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', Rule::in(['cash', 'bank', 'mobile_banking'])],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'collected_by' => ['nullable', 'integer', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $loan = $this->route('loan');
            if (! $loan instanceof Loan) {
                return;
            }

            $loan->loadMissing('installments');

            $remainingBalance = round($loan->installments->sum(fn ($installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
            $amount = round((float) $this->input('amount'), 2);

            if ($remainingBalance <= 0 || $loan->status === 'closed') {
                $validator->errors()->add('amount', 'This loan is already fully settled.');
                return;
            }

            if ($amount !== $remainingBalance) {
                $validator->errors()->add('amount', 'Full settlement amount must match the remaining loan balance exactly.');
            }
        });
    }
}
