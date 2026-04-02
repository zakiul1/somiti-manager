<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\Setting;
use App\Services\ChromiumPdfService;
use App\Support\AppLocale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrintController extends Controller
{
    public function __construct(private readonly ChromiumPdfService $pdf)
    {
    }

    public function paymentReceipt(Request $request, Payment $payment): Response
    {
        $locale = $this->resolveLocale($request);
        $data = $this->buildPaymentReceiptData($request, $payment, $locale);

                $this->authorizePaymentAccess($request, $payment);

        return Inertia::render('print/payment-receipt', [
            'payment' => $data['payment'],
            'organization' => $data['organization'],
            'meta' => $data['meta'],
            'pdfDownloadUrl' => route('print.payment-receipt.pdf', ['payment' => $payment->id, 'locale' => $locale]),
            'backHref' => $this->paymentBackHref($request, $payment),
        ]);
    }

    public function paymentReceiptPdf(Request $request, Payment $payment)
    {
        $this->authorizePaymentAccess($request, $payment);

        $locale = $this->resolveLocale($request);
        $data = $this->buildPaymentReceiptData($request, $payment, $locale);

        return $this->pdf->download('pdf.payment-receipt', $data, sprintf('payment-receipt-%s-%s.pdf', $payment->payment_code, $locale));
    }

    public function loanStatement(Request $request, Loan $loan): Response
    {
        $locale = $this->resolveLocale($request);
        $data = $this->buildLoanStatementData($request, $loan, $locale);

        $this->authorizeLoanAccess($request, $loan);

        return Inertia::render('print/loan-statement', [
            'loan' => $data['loan'],
            'organization' => $data['organization'],
            'meta' => $data['meta'],
            'pdfDownloadUrl' => route('print.loan-statement.pdf', ['loan' => $loan->id, 'locale' => $locale]),
            'backHref' => $this->loanBackHref($request, $loan),
        ]);
    }

    public function loanStatementPdf(Request $request, Loan $loan)
    {
        $this->authorizeLoanAccess($request, $loan);

        $locale = $this->resolveLocale($request);
        $data = $this->buildLoanStatementData($request, $loan, $locale);

        return $this->pdf->download('pdf.loan-statement', $data, sprintf('loan-statement-%s-%s.pdf', $loan->loan_code, $locale));
    }

    public function installmentSchedule(Request $request, Loan $loan): Response
    {
        $locale = $this->resolveLocale($request);
        $data = $this->buildInstallmentScheduleData($request, $loan, $locale);

        $this->authorizeLoanAccess($request, $loan);

        return Inertia::render('print/installment-schedule', [
            'loan' => $data['loan'],
            'organization' => $data['organization'],
            'meta' => $data['meta'],
            'pdfDownloadUrl' => route('print.installment-schedule.pdf', ['loan' => $loan->id, 'locale' => $locale]),
            'backHref' => $this->loanBackHref($request, $loan),
        ]);
    }

    public function installmentSchedulePdf(Request $request, Loan $loan)
    {
        $this->authorizeLoanAccess($request, $loan);

        $locale = $this->resolveLocale($request);
        $data = $this->buildInstallmentScheduleData($request, $loan, $locale);

        return $this->pdf->download('pdf.installment-schedule', $data, sprintf('installment-schedule-%s-%s.pdf', $loan->loan_code, $locale));
    }


    public function customerLedger(Request $request, Customer $customer): Response
    {
        $locale = $this->resolveLocale($request);
        $data = $this->buildCustomerLedgerData($request, $customer, $locale);

        return Inertia::render('print/customer-ledger', [
            'customer' => $data['customer'],
            'organization' => $data['organization'],
            'meta' => $data['meta'],
            'pdfDownloadUrl' => route('print.customer-ledger.pdf', ['customer' => $customer->id, 'locale' => $locale]),
            'backHref' => route('customers.ledger', $customer),
        ]);
    }

    public function customerLedgerPdf(Request $request, Customer $customer)
    {
        $locale = $this->resolveLocale($request);
        $data = $this->buildCustomerLedgerData($request, $customer, $locale);

        return $this->pdf->download('pdf.customer-ledger', $data, sprintf('customer-ledger-%s-%s.pdf', $customer->customer_code, $locale));
    }

    private function authorizeLoanAccess(Request $request, Loan $loan): void
    {
        $user = $request->user();

        if ($user && $user->hasRole('customer')) {
            abort_unless($user->customer_id && $loan->customer_id === $user->customer_id, 403);
        }
    }

    private function authorizePaymentAccess(Request $request, Payment $payment): void
    {
        $user = $request->user();

        if ($user && $user->hasRole('customer')) {
            abort_unless($user->customer_id && $payment->customer_id === $user->customer_id, 403);
        }
    }

    private function loanBackHref(Request $request, Loan $loan): string
    {
        $user = $request->user();

        if ($user && $user->hasRole('customer')) {
            return route('portal.loans');
        }

        return '/loans/' . $loan->id;
    }

    private function paymentBackHref(Request $request, Payment $payment): string
    {
        $user = $request->user();

        if ($user && $user->hasRole('customer')) {
            return route('portal.payments');
        }

        return '/payments/' . $payment->id;
    }

    private function buildPaymentReceiptData(Request $request, Payment $payment, string $locale): array
    {
        app()->setLocale($locale);

        $payment->load([
            'loan:id,customer_id,loan_code,status,principal_amount,total_payable',
            'loan.installments:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status',
            'loan.payments:id,loan_id,customer_id,installment_id,payment_code,amount,payment_date,payment_method,payment_type,batch_reference,reference_no,notes,collected_by',
            'customer:id,name,customer_code,phone',
            'installment:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status',
            'collector:id,name,email',
        ]);

        $loan = $payment->loan;
        $installments = $loan?->installments
            ? $loan->installments->sortBy('installment_no')->values()
            : collect();
        $payments = $loan?->payments
            ? $loan->payments->sortBy(fn ($item) => $item->payment_date?->timestamp ?? 0)->values()
            : collect();

        $currentInstallment = $payment->installment;
        $today = now()->startOfDay();

        $outstandingFor = function ($installment): float {
            return max(0, (float) $installment->installment_amount - (float) $installment->paid_amount);
        };

        $completedInstallments = $installments
            ->filter(fn ($installment) => $outstandingFor($installment) <= 0 || $installment->status === 'paid')
            ->values();

        $openInstallments = $installments
            ->filter(fn ($installment) => $outstandingFor($installment) > 0)
            ->values();

        $overdueInstallments = $openInstallments
            ->filter(fn ($installment) => $installment->due_date && $installment->due_date->copy()->startOfDay()->lt($today))
            ->values();

        $nextInstallment = $openInstallments
            ->sortBy(fn ($installment) => $installment->due_date?->timestamp ?? PHP_INT_MAX)
            ->first();

        $completedNumbers = $completedInstallments
            ->pluck('installment_no')
            ->map(fn ($no) => AppLocale::integer((int) $no, $locale))
            ->implode(', ');

        $dueNumbers = $openInstallments
            ->pluck('installment_no')
            ->map(fn ($no) => AppLocale::integer((int) $no, $locale))
            ->implode(', ');

        $totalPaidAfter = (float) $payments->sum('amount');
        $currentPaymentAmount = (float) $payment->amount;
        $totalPaidBefore = max(0, $totalPaidAfter - $currentPaymentAmount);
        $totalLoanAmount = (float) ($loan?->total_payable ?? $loan?->principal_amount ?? 0);
        $totalDueAfter = max(0, $totalLoanAmount - $totalPaidAfter);
        $openInstallmentDue = (float) $openInstallments->sum(fn ($installment) => $outstandingFor($installment));
        $overdueAmount = (float) $overdueInstallments->sum(fn ($installment) => $outstandingFor($installment));

        return [
            'locale' => $locale,
            'title' => __('pdf.receipt'),
            'generatedAt' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'organization' => $this->organizationData($locale),
            'meta' => $this->metaData($request, $locale),
            'payment' => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => $currentPaymentAmount,
                'amount_money' => AppLocale::money($payment->amount, $locale),
                'payment_date' => AppLocale::date($payment->payment_date?->format('Y-m-d'), $locale),
                'payment_method' => $payment->payment_method,
                'payment_method_label' => $this->translatePaymentMethod($payment->payment_method),
                'payment_type' => $payment->payment_type ?: 'regular',
                'payment_type_label' => $this->translatePaymentType($payment->payment_type),
                'batch_reference' => $payment->batch_reference,
                'reference_no' => $payment->reference_no,
                'notes' => $payment->notes,
                'loan' => $loan ? [
                    'id' => $loan->id,
                    'loan_code' => $loan->loan_code,
                    'status' => $loan->status,
                    'status_label' => $this->translateLoanStatus($loan->status),
                    'principal_amount' => (float) $loan->principal_amount,
                    'principal_amount_money' => AppLocale::money($loan->principal_amount, $locale),
                    'total_payable' => (float) $loan->total_payable,
                    'total_payable_money' => AppLocale::money($loan->total_payable, $locale),
                ] : null,
                'customer' => $payment->customer ? [
                    'id' => $payment->customer->id,
                    'name' => $payment->customer->name,
                    'customer_code' => $payment->customer->customer_code,
                    'phone' => $payment->customer->phone,
                ] : null,
                'installment' => $currentInstallment ? [
                    'id' => $currentInstallment->id,
                    'installment_no' => $currentInstallment->installment_no,
                    'installment_no_label' => AppLocale::integer($currentInstallment->installment_no, $locale),
                    'due_date' => AppLocale::date($currentInstallment->due_date?->format('Y-m-d'), $locale),
                    'installment_amount' => (float) $currentInstallment->installment_amount,
                    'installment_amount_money' => AppLocale::money($currentInstallment->installment_amount, $locale),
                    'paid_amount' => (float) $currentInstallment->paid_amount,
                    'paid_amount_money' => AppLocale::money($currentInstallment->paid_amount, $locale),
                    'outstanding_amount' => $outstandingFor($currentInstallment),
                    'outstanding_amount_money' => AppLocale::money($outstandingFor($currentInstallment), $locale),
                    'status' => $currentInstallment->status,
                    'status_label' => $this->translateInstallmentStatus($currentInstallment->status),
                ] : null,
                'collector' => $payment->collector ? [
                    'name' => $payment->collector->name,
                    'email' => $payment->collector->email,
                ] : null,
                'receipt_metrics' => [
                    'total_installments' => $installments->count(),
                    'total_installments_label' => AppLocale::integer($installments->count(), $locale),
                    'completed_installments' => $completedInstallments->count(),
                    'completed_installments_label' => AppLocale::integer($completedInstallments->count(), $locale),
                    'completed_installment_numbers' => $completedNumbers ?: __('pdf.n_a'),
                    'due_installments_left' => $openInstallments->count(),
                    'due_installments_left_label' => AppLocale::integer($openInstallments->count(), $locale),
                    'due_installment_numbers' => $dueNumbers ?: __('pdf.n_a'),
                    'overdue_installments' => $overdueInstallments->count(),
                    'overdue_installments_label' => AppLocale::integer($overdueInstallments->count(), $locale),
                    'total_due_open_installments' => $openInstallmentDue,
                    'total_due_open_installments_money' => AppLocale::money($openInstallmentDue, $locale),
                    'total_loan_amount' => $totalLoanAmount,
                    'total_loan_amount_money' => AppLocale::money($totalLoanAmount, $locale),
                    'total_paid_before_payment' => $totalPaidBefore,
                    'total_paid_before_payment_money' => AppLocale::money($totalPaidBefore, $locale),
                    'total_paid_after_payment' => $totalPaidAfter,
                    'total_paid_after_payment_money' => AppLocale::money($totalPaidAfter, $locale),
                    'total_due_after_payment' => $totalDueAfter,
                    'total_due_after_payment_money' => AppLocale::money($totalDueAfter, $locale),
                    'overdue_amount' => $overdueAmount,
                    'overdue_amount_money' => AppLocale::money($overdueAmount, $locale),
                    'next_installment_no' => $nextInstallment?->installment_no,
                    'next_installment_no_label' => $nextInstallment ? AppLocale::integer($nextInstallment->installment_no, $locale) : __('pdf.n_a'),
                    'next_installment_due_date' => $nextInstallment ? AppLocale::date($nextInstallment->due_date?->format('Y-m-d'), $locale) : __('pdf.n_a'),
                    'next_installment_amount' => $nextInstallment ? $outstandingFor($nextInstallment) : 0,
                    'next_installment_amount_money' => $nextInstallment ? AppLocale::money($outstandingFor($nextInstallment), $locale) : __('pdf.n_a'),
                    'has_next_installment' => (bool) $nextInstallment,
                ],
            ],
        ];
    }

    private function buildLoanStatementData(Request $request, Loan $loan, string $locale): array
    {
        app()->setLocale($locale);

        $loan->load([
            'customer:id,name,customer_code,phone,status',
            'guarantors:id,name,guarantor_code,phone,relationship,status',
            'installments:id,loan_id,installment_no,due_date,principal_component,interest_component,installment_amount,paid_amount,status',
        ]);

        return [
            'locale' => $locale,
            'title' => __('pdf.loan_statement'),
            'generatedAt' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'organization' => $this->organizationData($locale),
            'meta' => $this->metaData($request, $locale),
            'loan' => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'principal_amount' => (float) $loan->principal_amount,
                'principal_amount_money' => AppLocale::money($loan->principal_amount, $locale),
                'interest_rate' => (float) $loan->interest_rate,
                'interest_rate_label' => AppLocale::digits(number_format((float) $loan->interest_rate, 2), $locale) . '%',
                'interest_amount' => (float) $loan->interest_amount,
                'interest_amount_money' => AppLocale::money($loan->interest_amount, $locale),
                'total_payable' => (float) $loan->total_payable,
                'total_payable_money' => AppLocale::money($loan->total_payable, $locale),
                'duration_value' => $loan->duration_value,
                'duration_unit' => $loan->duration_unit,
                'duration_label' => AppLocale::integer((int) $loan->duration_value, $locale) . ' ' . $this->translateDurationUnit($loan->duration_unit),
                'collection_frequency' => $loan->collection_frequency,
                'collection_frequency_label' => $this->translateCollectionFrequency($loan->collection_frequency),
                'start_date' => AppLocale::date($loan->start_date?->format('Y-m-d'), $locale),
                'first_collection_date' => AppLocale::date($loan->first_collection_date?->format('Y-m-d'), $locale),
                'status' => $loan->status,
                'status_label' => $this->translateLoanStatus($loan->status),
                'total_paid' => (float) $loan->payments()->sum('amount'),
                'total_paid_money' => AppLocale::money($loan->payments()->sum('amount'), $locale),
                'remaining_balance' => max(0, (float) $loan->total_payable - (float) $loan->payments()->sum('amount')),
                'remaining_balance_money' => AppLocale::money(max(0, (float) $loan->total_payable - (float) $loan->payments()->sum('amount')), $locale),
                'overdue_amount_money' => AppLocale::money($loan->installments->filter(fn ($installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true) && $installment->due_date && $installment->due_date->isPast() && ! $installment->due_date->isToday())->sum(fn ($installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), $locale),
                'customer' => $loan->customer ? [
                    'id' => $loan->customer->id,
                    'name' => $loan->customer->name,
                    'customer_code' => $loan->customer->customer_code,
                    'phone' => $loan->customer->phone,
                ] : null,
                'guarantors' => $loan->guarantors->map(fn ($guarantor) => [
                    'id' => $guarantor->id,
                    'name' => $guarantor->name,
                    'guarantor_code' => $guarantor->guarantor_code,
                    'phone' => $guarantor->phone,
                    'relationship' => $guarantor->relationship,
                    'status' => $guarantor->status,
                    'status_label' => $this->translateCustomerStatus($guarantor->status),
                ])->values()->all(),
                'installments' => $loan->installments->map(fn ($installment) => [
                    'id' => $installment->id,
                    'installment_no' => $installment->installment_no,
                    'installment_no_label' => AppLocale::integer($installment->installment_no, $locale),
                    'due_date' => AppLocale::date($installment->due_date?->format('Y-m-d'), $locale),
                    'principal_component' => (float) $installment->principal_component,
                    'interest_component' => (float) $installment->interest_component,
                    'installment_amount' => (float) $installment->installment_amount,
                    'paid_amount' => (float) $installment->paid_amount,
                    'principal_component_money' => AppLocale::money($installment->principal_component, $locale),
                    'interest_component_money' => AppLocale::money($installment->interest_component, $locale),
                    'installment_amount_money' => AppLocale::money($installment->installment_amount, $locale),
                    'paid_amount_money' => AppLocale::money($installment->paid_amount, $locale),
                    'status' => $installment->status,
                    'status_label' => $this->translateInstallmentStatus($installment->status),
                ])->values()->all(),
            ],
        ];
    }

    private function buildInstallmentScheduleData(Request $request, Loan $loan, string $locale): array
    {
        app()->setLocale($locale);

        $loan->load([
            'customer:id,name,customer_code,phone,status',
            'installments:id,loan_id,installment_no,due_date,principal_component,interest_component,installment_amount,paid_amount,status',
        ]);

        return [
            'locale' => $locale,
            'title' => __('pdf.installment_schedule'),
            'generatedAt' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'organization' => $this->organizationData($locale),
            'meta' => $this->metaData($request, $locale),
            'loan' => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'total_payable_money' => AppLocale::money($loan->total_payable, $locale),
                'collection_frequency' => $loan->collection_frequency,
                'collection_frequency_label' => $this->translateCollectionFrequency($loan->collection_frequency),
                'installment_count_label' => AppLocale::integer($loan->installments->count(), $locale),
                'customer' => $loan->customer ? [
                    'id' => $loan->customer->id,
                    'name' => $loan->customer->name,
                    'customer_code' => $loan->customer->customer_code,
                    'phone' => $loan->customer->phone,
                ] : null,
                'installments' => $loan->installments->map(fn ($installment) => [
                    'id' => $installment->id,
                    'installment_no' => $installment->installment_no,
                    'installment_no_label' => AppLocale::integer($installment->installment_no, $locale),
                    'due_date' => AppLocale::date($installment->due_date?->format('Y-m-d'), $locale),
                    'principal_component' => (float) $installment->principal_component,
                    'interest_component' => (float) $installment->interest_component,
                    'installment_amount' => (float) $installment->installment_amount,
                    'paid_amount' => (float) $installment->paid_amount,
                    'principal_component_money' => AppLocale::money($installment->principal_component, $locale),
                    'interest_component_money' => AppLocale::money($installment->interest_component, $locale),
                    'installment_amount_money' => AppLocale::money($installment->installment_amount, $locale),
                    'paid_amount_money' => AppLocale::money($installment->paid_amount, $locale),
                    'status' => $installment->status,
                    'status_label' => $this->translateInstallmentStatus($installment->status),
                ])->values()->all(),
            ],
        ];
    }

    private function buildCustomerLedgerData(Request $request, Customer $customer, string $locale): array
    {
        app()->setLocale($locale);

        $customer->load([
            'assignedStaff:id,name,email',
            'loans:id,customer_id,loan_code,principal_amount,total_payable,status,start_date,first_collection_date',
            'loans.installments:id,loan_id,customer_id,installment_no,due_date,installment_amount,paid_amount,status',
            'loans.payments:id,loan_id,customer_id,installment_id,payment_code,amount,payment_date,payment_method,payment_type,batch_reference,notes,collected_by',
            'loans.payments.collector:id,name,email',
        ]);

        $loanRows = $customer->loans->map(function (Loan $loan) use ($locale) {
            $totalPaid = (float) $loan->payments->sum('amount');
            $remaining = max(0, (float) $loan->total_payable - $totalPaid);
            $overdue = (float) $loan->installments
                ->filter(fn ($i) => in_array($i->status, ['pending', 'partial', 'overdue'], true) && $i->due_date && $i->due_date->isPast() && ! $i->due_date->isToday())
                ->sum(fn ($i) => max(0, (float) $i->installment_amount - (float) $i->paid_amount));
            $nextDue = $loan->installments
                ->filter(fn ($i) => max(0, (float) $i->installment_amount - (float) $i->paid_amount) > 0)
                ->sortBy(fn ($i) => $i->due_date?->timestamp ?? PHP_INT_MAX)
                ->first();

            return [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'status' => $loan->status,
                'status_label' => $this->translateLoanStatus($loan->status),
                'total_paid' => (float) $loan->payments()->sum('amount'),
                'total_paid_money' => AppLocale::money($loan->payments()->sum('amount'), $locale),
                'remaining_balance' => max(0, (float) $loan->total_payable - (float) $loan->payments()->sum('amount')),
                'remaining_balance_money' => AppLocale::money(max(0, (float) $loan->total_payable - (float) $loan->payments()->sum('amount')), $locale),
                'overdue_amount_money' => AppLocale::money($loan->installments->filter(fn ($installment) => in_array($installment->status, ['pending', 'partial', 'overdue'], true) && $installment->due_date && $installment->due_date->isPast() && ! $installment->due_date->isToday())->sum(fn ($installment) => max(0, (float) $installment->installment_amount - (float) $installment->paid_amount)), $locale),
                'principal_amount_money' => AppLocale::money($loan->principal_amount, $locale),
                'total_payable_money' => AppLocale::money($loan->total_payable, $locale),
                'total_paid_money' => AppLocale::money($totalPaid, $locale),
                'remaining_balance_money' => AppLocale::money($remaining, $locale),
                'overdue_amount_money' => AppLocale::money($overdue, $locale),
                'start_date' => AppLocale::date($loan->start_date?->format('Y-m-d'), $locale),
                'next_due_date' => AppLocale::date($nextDue?->due_date?->format('Y-m-d'), $locale),
                'next_due_amount_money' => AppLocale::money($nextDue ? max(0, (float) $nextDue->installment_amount - (float) $nextDue->paid_amount) : 0, $locale),
            ];
        })->values()->all();

        $paymentRows = $customer->loans->flatMap(function (Loan $loan) use ($locale) {
            return $loan->payments
                ->sortByDesc(fn (Payment $payment) => $payment->payment_date?->timestamp ?? 0)
                ->map(function (Payment $payment) use ($loan, $locale) {
                    return [
                        'payment_code' => $payment->payment_code,
                        'payment_date' => AppLocale::date($payment->payment_date?->format('Y-m-d'), $locale),
                        'loan_code' => $loan->loan_code,
                        'amount_money' => AppLocale::money($payment->amount, $locale),
                        'payment_method_label' => $this->translatePaymentMethod($payment->payment_method),
                        'payment_type_label' => $this->translatePaymentType($payment->payment_type),
                        'batch_reference' => $payment->batch_reference,
                        'collector' => $payment->collector?->name,
                    ];
                });
        })->values()->all();

        $totalPayable = (float) $customer->loans->sum('total_payable');
        $totalPaid = (float) $customer->loans->flatMap->payments->sum('amount');
        $remaining = max(0, $totalPayable - $totalPaid);
        $overdue = (float) $customer->loans->flatMap->installments
            ->filter(fn ($i) => in_array($i->status, ['pending', 'partial', 'overdue'], true) && $i->due_date && $i->due_date->isPast() && ! $i->due_date->isToday())
            ->sum(fn ($i) => max(0, (float) $i->installment_amount - (float) $i->paid_amount));

        return [
            'locale' => $locale,
            'title' => __('pdf.customer_ledger'),
            'generatedAt' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'organization' => $this->organizationData($locale),
            'meta' => $this->metaData($request, $locale),
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'customer_code' => $customer->customer_code,
                'phone' => $customer->phone,
                'status' => $customer->status,
                'status_label' => $this->translateCustomerStatus($customer->status),
                'assigned_staff' => $customer->assignedStaff?->name,
                'loan_count_label' => AppLocale::integer($customer->loans->count(), $locale),
                'payment_count_label' => AppLocale::integer($customer->loans->flatMap->payments->count(), $locale),
                'total_payable_money' => AppLocale::money($totalPayable, $locale),
                'total_paid_money' => AppLocale::money($totalPaid, $locale),
                'remaining_balance_money' => AppLocale::money($remaining, $locale),
                'overdue_amount_money' => AppLocale::money($overdue, $locale),
                'loans' => $loanRows,
                'payments' => $paymentRows,
            ],
        ];
    }

    private function translatePaymentType(?string $type): string
    {
        return match ($type) {
            'full_settlement' => __('pdf.full_settlement'),
            default => __('pdf.regular'),
        };
    }

    private function organizationData(string $locale): array
    {
        return [
            'name' => Setting::get($locale === 'bn' ? 'organization_name_bn' : 'organization_name_en', Setting::get('app_name', 'Somiti Manager')),
            'address' => Setting::get($locale === 'bn' ? 'organization_address_bn' : 'organization_address_en', ''),
            'phone' => Setting::get('organization_phone', ''),
            'email' => Setting::get('organization_email', ''),
            'footer_note' => Setting::get($locale === 'bn' ? 'organization_footer_bn' : 'organization_footer_en', ''),
            'authority_name' => Setting::get('organization_authority_name', ''),
            'authority_title' => Setting::get($locale === 'bn' ? 'organization_authority_title_bn' : 'organization_authority_title_en', ''),
        ];
    }

    private function metaData(Request $request, string $locale): array
    {
        $user = $request->user();

        return [
            'generated_at' => AppLocale::date(now()->format('Y-m-d H:i'), $locale),
            'prepared_by' => $user?->name,
            'prepared_by_email' => $user?->email,
        ];
    }

    private function resolveLocale(Request $request): string
    {
        $fallback = AppLocale::normalize((string) config('app.locale', 'en'));
        return AppLocale::normalize($request->query('locale') ?: $request->cookie('somiti_locale'), $fallback);
    }

    private function translatePaymentMethod(?string $method): string
    {
        return match ($method) {
            'cash' => __('pdf.method_cash'),
            'bank' => __('pdf.method_bank'),
            'mobile_banking' => __('pdf.method_mobile_banking'),
            'cheque' => __('pdf.method_cheque'),
            default => $method ?: __('pdf.n_a'),
        };
    }

    private function translateLoanStatus(?string $status): string
    {
        return match ($status) {
            'draft' => __('pdf.draft'),
            'approved' => __('pdf.approved'),
            'active' => __('pdf.active'),
            'closed' => __('pdf.closed'),
            'defaulted' => __('pdf.defaulted'),
            default => $status ?: __('pdf.n_a'),
        };
    }

    private function translateInstallmentStatus(?string $status): string
    {
        return match ($status) {
            'pending' => __('pdf.pending'),
            'partial' => __('pdf.partial'),
            'paid' => __('pdf.paid'),
            'overdue' => __('pdf.overdue'),
            default => $status ?: __('pdf.n_a'),
        };
    }

    private function translateCustomerStatus(?string $status): string
    {
        return $status === 'inactive' ? __('customers.inactive') : __('customers.active');
    }

    private function translateCollectionFrequency(?string $frequency): string
    {
        return match ($frequency) {
            'daily' => __('pdf.daily'),
            'weekly' => __('pdf.weekly'),
            'monthly' => __('pdf.monthly'),
            default => $frequency ?: __('pdf.n_a'),
        };
    }

    private function translateDurationUnit(?string $unit): string
    {
        return match ($unit) {
            'days' => __('loans.days'),
            'weeks' => __('loans.weeks'),
            'months' => __('loans.months'),
            default => $unit ?: __('pdf.n_a'),
        };
    }
}
