<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanSettlementRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\CsvExportService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $method = (string) $request->string('payment_method', 'all');
        $paymentType = (string) $request->string('payment_type', 'all');
        $collectorId = $request->integer('collector_id');
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));

        $payments = Payment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code', 'installment:id,installment_no,due_date', 'collector:id,name'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested
                        ->where('payment_code', 'like', "%{$search}%")
                        ->orWhere('reference_no', 'like', "%{$search}%")
                        ->orWhereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%"));
                });
            })
            ->when(in_array($method, ['cash', 'bank', 'mobile_banking'], true), fn ($builder) => $builder->where('payment_method', $method))
            ->when(in_array($paymentType, ['regular', 'full_settlement'], true), fn ($builder) => $builder->where('payment_type', $paymentType))
            ->when($collectorId, fn ($builder) => $builder->where('collected_by', $collectorId))
            ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('payment_date', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($builder) => $builder->whereDate('payment_date', '<=', $dateTo))
            ->latest('payment_date')
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Payment $payment) => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->format('Y-m-d'),
                'payment_method' => $payment->payment_method,
                'payment_type' => $payment->payment_type ?: 'regular',
                'reference_no' => $payment->reference_no,
                'loan' => $payment->loan ? [
                    'id' => $payment->loan->id,
                    'loan_code' => $payment->loan->loan_code,
                ] : null,
                'customer' => $payment->customer ? [
                    'id' => $payment->customer->id,
                    'name' => $payment->customer->name,
                    'customer_code' => $payment->customer->customer_code,
                ] : null,
                'installment' => $payment->installment ? [
                    'id' => $payment->installment->id,
                    'installment_no' => $payment->installment->installment_no,
                    'due_date' => $payment->installment->due_date?->format('Y-m-d'),
                ] : null,
                'collector' => $payment->collector?->name,
            ]);

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'payment_method' => $method,
                'payment_type' => $paymentType,
                'collector_id' => $collectorId ? (string) $collectorId : 'all',
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'collectorOptions' => User::query()->role(['super-admin', 'admin'])->orderBy('name')->get(['id', 'name'])->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
            ])->values(),
            'stats' => [
                'total' => Payment::count(),
                'total_amount' => (float) Payment::sum('amount'),
                'today_amount' => (float) Payment::whereDate('payment_date', today())->sum('amount'),
                'month_amount' => (float) Payment::whereBetween('payment_date', [today()->startOfMonth(), today()->endOfMonth()])->sum('amount'),
                'cash_count' => Payment::where('payment_method', 'cash')->count(),
                'settlement_count' => Payment::where('payment_type', 'full_settlement')->count(),
                'settlement_amount' => (float) Payment::where('payment_type', 'full_settlement')->sum('amount'),
                'regular_count' => Payment::where('payment_type', 'regular')->count(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->string('search'));
        $method = (string) $request->string('payment_method', $request->string('method', 'all'));
        $paymentType = (string) $request->string('payment_type', 'all');
        $collectorId = $request->integer('collector_id');
        $dateFrom = $request->string('date_from')->toString();
        $dateTo = $request->string('date_to')->toString();

        $rows = Payment::query()
            ->with(['loan:id,loan_code', 'customer:id,name,customer_code', 'installment:id,installment_no', 'collector:id,name'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested
                        ->where('payment_code', 'like', "%{$search}%")
                        ->orWhere('reference_no', 'like', "%{$search}%")
                        ->orWhereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_code', 'like', "%{$search}%"));
                });
            })
            ->when($method !== 'all' && $method !== '', fn ($builder) => $builder->where('payment_method', $method))
            ->when(in_array($paymentType, ['regular', 'full_settlement'], true), fn ($builder) => $builder->where('payment_type', $paymentType))
            ->when($collectorId, fn ($builder) => $builder->where('collected_by', $collectorId))
            ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('payment_date', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($builder) => $builder->whereDate('payment_date', '<=', $dateTo))
            ->latest('payment_date')
            ->latest('id')
            ->get()
            ->map(fn (Payment $payment) => [
                $payment->payment_code,
                $payment->payment_date?->format('Y-m-d'),
                $payment->payment_type ?: 'regular',
                $payment->loan?->loan_code,
                $payment->customer?->customer_code,
                $payment->customer?->name,
                $payment->installment?->installment_no,
                $payment->amount,
                $payment->payment_method,
                $payment->reference_no,
                $payment->batch_reference,
                $payment->collector?->name,
                $payment->created_at?->format('Y-m-d H:i:s'),
            ]);

        return CsvExportService::download('payments-' . now()->format('Y-m-d-His') . '.csv', ['Payment Code', 'Payment Date', 'Payment Type', 'Loan Code', 'Customer Code', 'Customer Name', 'Installment No', 'Amount', 'Payment Method', 'Reference No', 'Batch Reference', 'Collector', 'Created At'], $rows);
    }

    public function create(Request $request): Response
    {
        $selectedInstallment = null;
        $selectedLoan = null;
        $installmentId = $request->integer('installment_id');
        $loanId = $request->integer('loan_id');
        $paymentMode = (string) $request->string('payment_mode', $installmentId ? 'regular' : 'full_settlement');

        if ($installmentId) {
            $installment = Installment::query()->with(['loan:id,loan_code,status,total_payable', 'customer:id,name,customer_code'])->find($installmentId);
            if ($installment) {
                $selectedInstallment = $this->installmentOption($installment);
                $loanId = $installment->loan_id;
                $paymentMode = 'regular';
            }
        }

        if ($loanId) {
            $loan = Loan::query()->with(['customer:id,name,customer_code'])->find($loanId);
            if ($loan) {
                $selectedLoan = $this->loanOption($loan);
            }
        }

        return Inertia::render('payments/create', [
            'paymentCode' => $this->generatePaymentCode(),
            'selectedInstallment' => $selectedInstallment,
            'selectedLoan' => $selectedLoan,
            'paymentMode' => in_array($paymentMode, ['regular', 'full_settlement'], true) ? $paymentMode : 'regular',
            'admins' => User::query()->role(['super-admin', 'admin'])->orderBy('name')->get(['id', 'name', 'email'])->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
            ])->values(),
            'installments' => Installment::query()
                ->with(['loan:id,loan_code,status,total_payable', 'customer:id,name,customer_code'])
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->orderBy('due_date')
                ->get()
                ->map(fn (Installment $installment) => $this->installmentOption($installment))
                ->values(),
            'loanOptions' => Loan::query()
                ->with(['customer:id,name,customer_code'])
                ->where('status', '!=', 'closed')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Loan $loan) => $this->loanOption($loan))
                ->filter(fn (array $loan) => ($loan['financial_summary']['remaining_balance'] ?? 0) > 0)
                ->values(),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $installment = Installment::query()->with(['loan:id,status,total_payable'])->findOrFail($validated['installment_id']);

        $payment = DB::transaction(function () use ($validated, $installment, $request) {
            $payment = Payment::create([
                'payment_code' => $this->generatePaymentCode(),
                'installment_id' => $installment->id,
                'loan_id' => $installment->loan_id,
                'customer_id' => $installment->customer_id,
                'collected_by' => $validated['collected_by'] ?? $request->user()?->id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'payment_type' => 'regular',
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->applyInstallmentPayment($installment->fresh(), (float) $validated['amount'], Carbon::parse($validated['payment_date']), $request->user()?->id);
            $this->syncLoanStatus($installment->loan_id, $request->user()?->id);

            return $payment;
        });

        AuditLogService::log('payment', 'collected', 'Payment collected.', $payment, $request->user()?->id, $payment->payment_code, [
            'loan_id' => $payment->loan_id,
            'customer_id' => $payment->customer_id,
            'amount' => (float) $payment->amount,
            'payment_type' => 'regular',
        ]);

        return Redirect::route('payments.show', $payment)->with('success', 'Payment collected successfully.');
    }

    public function settle(StoreLoanSettlementRequest $request, Loan $loan): RedirectResponse
    {
        $validated = $request->validated();
        $loan->load(['customer:id,name,customer_code', 'installments' => fn ($query) => $query->orderBy('due_date')->orderBy('installment_no')]);

        $openInstallments = $loan->installments->filter(fn (Installment $installment) => round((float) $installment->installment_amount - (float) $installment->paid_amount, 2) > 0)->values();
        $remainingBalance = round($openInstallments->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);

        if ($loan->status === 'closed' || $remainingBalance <= 0 || $openInstallments->isEmpty()) {
            return Redirect::route('loans.show', $loan)->with('error', 'This loan is already settled.');
        }

        $batchReference = 'SET-' . now()->format('YmdHis') . '-' . $loan->id;
        $paymentDate = Carbon::parse($validated['payment_date']);
        $primaryPaymentId = null;

        DB::transaction(function () use ($validated, $loan, $openInstallments, $remainingBalance, $batchReference, $paymentDate, $request, &$primaryPaymentId) {
            $remaining = $remainingBalance;

            foreach ($openInstallments as $installment) {
                $outstanding = round((float) $installment->installment_amount - (float) $installment->paid_amount, 2);
                if ($outstanding <= 0 || $remaining <= 0) {
                    continue;
                }

                $allocation = min($remaining, $outstanding);
                $payment = Payment::create([
                    'payment_code' => $this->generatePaymentCode(),
                    'installment_id' => $installment->id,
                    'loan_id' => $loan->id,
                    'customer_id' => $loan->customer_id,
                    'collected_by' => $validated['collected_by'] ?? $request->user()?->id,
                    'amount' => $allocation,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'payment_type' => 'full_settlement',
                    'batch_reference' => $batchReference,
                    'reference_no' => $validated['reference_no'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'created_by' => $request->user()?->id,
                    'updated_by' => $request->user()?->id,
                ]);

                if ($primaryPaymentId === null) {
                    $primaryPaymentId = $payment->id;
                }

                $this->applyInstallmentPayment($installment->fresh(), $allocation, $paymentDate, $request->user()?->id);
                $remaining = round($remaining - $allocation, 2);
            }

            $loan->update([
                'status' => 'closed',
                'updated_by' => $request->user()?->id,
            ]);
        });

        AuditLogService::log('loan', 'settled', 'Loan fully settled and closed.', $loan, $request->user()?->id, $loan->loan_code, [
            'customer_id' => $loan->customer_id,
            'payment_type' => 'full_settlement',
            'settlement_amount' => $remainingBalance,
            'batch_reference' => $batchReference,
        ]);

        return Redirect::route('payments.show', $primaryPaymentId)->with('success', 'Loan fully settled and closed successfully.');
    }

    public function show(Payment $payment): Response
    {
        $payment->load([
            'loan:id,loan_code,status,total_payable',
            'customer:id,name,customer_code,phone',
            'installment:id,installment_no,due_date,installment_amount,paid_amount,status',
            'collector:id,name,email',
        ]);

        $relatedBatchPayments = collect();
        if ($payment->batch_reference) {
            $relatedBatchPayments = Payment::query()
                ->with(['collector:id,name'])
                ->where('batch_reference', $payment->batch_reference)
                ->orderBy('payment_date')
                ->orderBy('id')
                ->get()
                ->map(fn (Payment $item) => [
                    'id' => $item->id,
                    'payment_code' => $item->payment_code,
                    'amount' => (float) $item->amount,
                    'payment_date' => $item->payment_date?->format('Y-m-d'),
                    'collector' => $item->collector?->name,
                ]);
        }

        $recentLoanPayments = collect();
        if ($payment->loan_id) {
            $recentLoanPayments = Payment::query()
                ->where('loan_id', $payment->loan_id)
                ->where('id', '!=', $payment->id)
                ->latest('payment_date')
                ->latest('id')
                ->limit(6)
                ->get(['id', 'payment_code', 'amount', 'payment_date', 'payment_type', 'reference_no'])
                ->map(fn (Payment $item) => [
                    'id' => $item->id,
                    'payment_code' => $item->payment_code,
                    'amount' => (float) $item->amount,
                    'payment_date' => $item->payment_date?->format('Y-m-d'),
                    'payment_type' => $item->payment_type ?: 'regular',
                    'reference_no' => $item->reference_no,
                ]);
        }

        return Inertia::render('payments/show', [
            'payment' => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->format('Y-m-d'),
                'payment_method' => $payment->payment_method,
                'payment_type' => $payment->payment_type ?: 'regular',
                'batch_reference' => $payment->batch_reference,
                'reference_no' => $payment->reference_no,
                'notes' => $payment->notes,
                'loan' => $payment->loan ? [
                    'id' => $payment->loan->id,
                    'loan_code' => $payment->loan->loan_code,
                    'status' => $payment->loan->status,
                    'total_payable' => (float) $payment->loan->total_payable,
                ] : null,
                'customer' => $payment->customer ? [
                    'id' => $payment->customer->id,
                    'name' => $payment->customer->name,
                    'customer_code' => $payment->customer->customer_code,
                    'phone' => $payment->customer->phone,
                ] : null,
                'installment' => $payment->installment ? [
                    'id' => $payment->installment->id,
                    'installment_no' => $payment->installment->installment_no,
                    'due_date' => $payment->installment->due_date?->format('Y-m-d'),
                    'installment_amount' => (float) $payment->installment->installment_amount,
                    'paid_amount' => (float) $payment->installment->paid_amount,
                    'status' => $payment->installment->status,
                ] : null,
                'collector' => $payment->collector ? [
                    'name' => $payment->collector->name,
                    'email' => $payment->collector->email,
                ] : null,
                'created_at' => $payment->created_at?->format('Y-m-d h:i A'),
                'updated_at' => $payment->updated_at?->format('Y-m-d h:i A'),
            ],
            'relatedBatchPayments' => $relatedBatchPayments->values(),
            'recentLoanPayments' => $recentLoanPayments->values(),
        ]);
    }

    protected function installmentOption(Installment $installment): array
    {
        $outstanding = round((float) $installment->installment_amount - (float) $installment->paid_amount, 2);

        return [
            'id' => $installment->id,
            'installment_no' => $installment->installment_no,
            'due_date' => $installment->due_date?->format('Y-m-d'),
            'installment_amount' => (float) $installment->installment_amount,
            'paid_amount' => (float) $installment->paid_amount,
            'outstanding_amount' => $outstanding,
            'status' => $installment->status,
            'loan' => $installment->loan ? [
                'id' => $installment->loan->id,
                'loan_code' => $installment->loan->loan_code,
                'status' => $installment->loan->status,
            ] : null,
            'customer' => $installment->customer ? [
                'id' => $installment->customer->id,
                'name' => $installment->customer->name,
                'customer_code' => $installment->customer->customer_code,
            ] : null,
        ];
    }

    protected function loanOption(Loan $loan): array
    {
        $openInstallments = Installment::query()
            ->where('loan_id', $loan->id)
            ->orderBy('due_date')
            ->get(['id', 'loan_id', 'customer_id', 'installment_no', 'due_date', 'installment_amount', 'paid_amount', 'status']);

        $remainingBalance = round($openInstallments->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
        $nextDue = $openInstallments->first(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true));

        return [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'status' => $loan->status,
            'customer' => $loan->customer ? [
                'id' => $loan->customer->id,
                'name' => $loan->customer->name,
                'customer_code' => $loan->customer->customer_code,
            ] : null,
            'financial_summary' => [
                'total_payable' => (float) $loan->total_payable,
                'total_paid' => round((float) $loan->total_payable - $remainingBalance, 2),
                'remaining_balance' => $remainingBalance,
                'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
                'next_due_amount' => $nextDue ? round(max(0, (float) $nextDue->installment_amount - (float) $nextDue->paid_amount), 2) : 0,
                'open_installments' => $openInstallments->filter(fn (Installment $installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true))->count(),
            ],
        ];
    }

    protected function applyInstallmentPayment(Installment $installment, float $amount, Carbon $paymentDate, ?int $actorId = null): void
    {
        $newPaidAmount = round((float) $installment->paid_amount + $amount, 2);
        $installmentAmount = round((float) $installment->installment_amount, 2);

        $status = 'partial';
        $paidAt = null;

        if ($newPaidAmount >= $installmentAmount) {
            $newPaidAmount = $installmentAmount;
            $status = 'paid';
            $paidAt = $paymentDate->format('Y-m-d');
        } elseif ($newPaidAmount <= 0) {
            $status = $installment->due_date && $installment->due_date->isPast() ? 'overdue' : 'pending';
        } else {
            $status = $installment->due_date && $installment->due_date->isPast() ? 'partial' : 'partial';
        }

        $installment->update([
            'paid_amount' => $newPaidAmount,
            'status' => $status,
            'paid_at' => $paidAt,
            'updated_by' => $actorId,
        ]);
    }

    protected function syncLoanStatus(int $loanId, ?int $actorId = null): void
    {
        $loan = Loan::query()->with('installments:id,loan_id,installment_amount,paid_amount,status')->find($loanId);
        if (! $loan) {
            return;
        }

        $remainingBalance = round($loan->installments->sum(fn (Installment $installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), 2);
        $nextStatus = $remainingBalance <= 0 ? 'closed' : 'active';

        if ($loan->status !== $nextStatus) {
            $loan->update([
                'status' => $nextStatus,
                'updated_by' => $actorId,
            ]);
        }
    }

    protected function generatePaymentCode(): string
    {
        $latestId = (int) Payment::max('id') + 1;

        return 'PAY-' . str_pad((string) $latestId, 5, '0', STR_PAD_LEFT);
    }
}
