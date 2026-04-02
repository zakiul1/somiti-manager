<?php

namespace App\Services;

use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LoanSettlementService
{
    public function __construct(
        protected LoanSummaryService $loanSummaryService,
    ) {
    }

    public function collectInstallmentPayment(Installment $installment, array $attributes): Payment
    {
        return DB::transaction(function () use ($installment, $attributes) {
            $installment->loadMissing('loan');

            $amount = round((float) $attributes['amount'], 2);
            $paymentDate = Carbon::parse($attributes['payment_date']);
            $actorId = $attributes['actor_id'] ?? null;

            $outstanding = round(max((float) $installment->installment_amount - (float) $installment->paid_amount, 0), 2);
            if ($amount <= 0 || $amount > $outstanding) {
                throw new RuntimeException('Invalid installment payment amount.');
            }

            $payment = Payment::create([
                'payment_code' => $attributes['payment_code'],
                'installment_id' => $installment->id,
                'loan_id' => $installment->loan_id,
                'customer_id' => $installment->customer_id,
                'collected_by' => $attributes['collected_by'] ?? $actorId,
                'amount' => $amount,
                'payment_date' => $paymentDate->toDateString(),
                'payment_method' => $attributes['payment_method'],
                'payment_type' => $attributes['payment_type'] ?? ($amount >= $outstanding ? 'regular' : 'partial'),
                'batch_reference' => $attributes['batch_reference'] ?? null,
                'reference_no' => $attributes['reference_no'] ?? null,
                'notes' => $attributes['notes'] ?? null,
                'created_by' => $actorId,
                'updated_by' => $actorId,
            ]);

            $this->applyInstallmentPayment($installment->fresh(), $amount, $paymentDate, $actorId);
            $this->refreshLoanStatus($installment->loan->fresh('installments'));

            return $payment;
        });
    }

    public function settleLoan(Loan $loan, array $attributes): array
    {
        return DB::transaction(function () use ($loan, $attributes) {
            $loan->loadMissing('installments');

            $paymentDate = Carbon::parse($attributes['payment_date']);
            $actorId = $attributes['actor_id'] ?? null;
            $batchReference = $attributes['batch_reference'] ?? ('SET-' . now()->format('YmdHis') . '-' . $loan->id);
            $amount = round((float) $attributes['amount'], 2);
            $outstanding = round($this->loanSummaryService->outstandingAmount($loan->fresh('installments')), 2);

            if ($outstanding <= 0) {
                throw new RuntimeException('This loan is already fully settled.');
            }

            if (round($amount, 2) !== round($outstanding, 2)) {
                throw new RuntimeException('Settlement amount must match the remaining loan balance.');
            }

            $remaining = $amount;
            $payments = [];
            $sequence = 1;

            $installments = $loan->installments()
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->orderBy('due_date')
                ->orderBy('installment_no')
                ->get();

            foreach ($installments as $installment) {
                $installmentOutstanding = round(max((float) $installment->installment_amount - (float) $installment->paid_amount, 0), 2);
                if ($installmentOutstanding <= 0) {
                    continue;
                }

                $allocation = min($remaining, $installmentOutstanding);
                if ($allocation <= 0) {
                    break;
                }

                $payment = Payment::create([
                    'payment_code' => $attributes['payment_code_prefix']
                        ? sprintf('%s-%02d', $attributes['payment_code_prefix'], $sequence)
                        : $this->generateSettlementPaymentCode($loan->id, $sequence),
                    'installment_id' => $installment->id,
                    'loan_id' => $installment->loan_id,
                    'customer_id' => $installment->customer_id,
                    'collected_by' => $attributes['collected_by'] ?? $actorId,
                    'amount' => $allocation,
                    'payment_date' => $paymentDate->toDateString(),
                    'payment_method' => $attributes['payment_method'],
                    'payment_type' => 'full_settlement',
                    'batch_reference' => $batchReference,
                    'reference_no' => $attributes['reference_no'] ?? null,
                    'notes' => $attributes['notes'] ?? null,
                    'created_by' => $actorId,
                    'updated_by' => $actorId,
                ]);

                $this->applyInstallmentPayment($installment->fresh(), $allocation, $paymentDate, $actorId);

                $payments[] = $payment;
                $remaining = round($remaining - $allocation, 2);
                $sequence++;
            }

            if ($remaining > 0) {
                throw new RuntimeException('Could not fully allocate the settlement payment.');
            }

            $loan = $loan->fresh('installments');
            $this->refreshLoanStatus($loan);

            return [
                'payments' => $payments,
                'loan' => $loan->fresh('installments'),
                'batch_reference' => $batchReference,
                'settled_amount' => $amount,
            ];
        });
    }

    protected function applyInstallmentPayment(Installment $installment, float $amount, Carbon $paymentDate, ?int $actorId = null): void
    {
        $newPaidAmount = round((float) $installment->paid_amount + $amount, 2);
        $installmentAmount = round((float) $installment->installment_amount, 2);

        if ($newPaidAmount >= $installmentAmount) {
            $status = 'paid';
            $paidAt = $paymentDate->toDateString();
        } elseif ($newPaidAmount > 0) {
            $status = 'partial';
            $paidAt = null;
        } else {
            $status = $installment->status;
            $paidAt = $installment->paid_at?->toDateString();
        }

        $installment->update([
            'paid_amount' => min($newPaidAmount, $installmentAmount),
            'status' => $status,
            'paid_at' => $paidAt,
            'updated_by' => $actorId,
        ]);
    }

    protected function refreshLoanStatus(Loan $loan): void
    {
        $summary = $this->loanSummaryService->summary($loan->fresh('installments'));

        $loan->update([
            'status' => $summary['closeable'] ? 'closed' : 'active',
            'updated_by' => auth()->id(),
        ]);
    }

    protected function generateSettlementPaymentCode(int $loanId, int $sequence): string
    {
        return sprintf('SET-%05d-%02d', $loanId, $sequence);
    }
}
