<?php

namespace App\Services;

use App\Models\Installment;
use App\Models\Loan;
use Illuminate\Support\Carbon;

class LoanSummaryService
{
    public function summary(Loan $loan): array
    {
        $loan->loadMissing('installments');

        $installments = $loan->installments;
        $today = Carbon::today();

        $totalPaid = round((float) $installments->sum('paid_amount'), 2);
        $outstanding = round(max((float) $loan->total_payable - $totalPaid, 0), 2);
        $overdueAmount = round((float) $installments
            ->filter(fn (Installment $installment) => $installment->due_date && $installment->due_date->lt($today) && ! in_array($installment->status, ['paid'], true))
            ->sum(fn (Installment $installment) => max((float) $installment->installment_amount - (float) $installment->paid_amount, 0)), 2);

        $nextDueInstallment = $installments
            ->filter(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true))
            ->sortBy('due_date')
            ->first();

        $paidInstallments = $installments->where('status', 'paid')->count();
        $totalInstallments = $installments->count();

        return [
            'total_paid' => $totalPaid,
            'remaining_balance' => $outstanding,
            'outstanding' => $outstanding,
            'overdue_amount' => $overdueAmount,
            'next_due' => $nextDueInstallment ? [
                'installment_id' => $nextDueInstallment->id,
                'installment_no' => $nextDueInstallment->installment_no,
                'due_date' => $nextDueInstallment->due_date?->format('Y-m-d'),
                'amount' => round(max((float) $nextDueInstallment->installment_amount - (float) $nextDueInstallment->paid_amount, 0), 2),
            ] : null,
            'installment_progress' => [
                'paid' => $paidInstallments,
                'total' => $totalInstallments,
                'pending' => max($totalInstallments - $paidInstallments, 0),
            ],
            'closeable' => $outstanding <= 0.0,
        ];
    }

    public function outstandingAmount(Loan $loan): float
    {
        return (float) ($this->summary($loan)['outstanding'] ?? 0);
    }
}
