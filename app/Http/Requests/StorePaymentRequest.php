<?php

namespace App\Http\Requests;

use App\Models\Installment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'installment_id' => ['required', 'integer', 'exists:installments,id'],
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
            $installmentId = (int) $this->input('installment_id');
            $amount = (float) $this->input('amount');

            if (! $installmentId || $amount <= 0) {
                return;
            }

            $installment = Installment::query()->find($installmentId);
            if (! $installment) {
                return;
            }

            $outstanding = round((float) $installment->installment_amount - (float) $installment->paid_amount, 2);
            if ($outstanding <= 0) {
                $validator->errors()->add('installment_id', 'This installment is already fully paid.');
                return;
            }

            if ($amount > $outstanding) {
                $validator->errors()->add('amount', 'Payment amount cannot exceed the outstanding installment balance.');
            }
        });
    }
}
