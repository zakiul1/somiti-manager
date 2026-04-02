<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerPortalController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $customer = $this->customer($request);

        $loanQuery = Loan::query()
            ->where('customer_id', $customer->id)
            ->withCount('installments')
            ->withSum('payments', 'amount')
            ->latest('id');

        $loans = (clone $loanQuery)
            ->limit(5)
            ->get()
            ->map(fn (Loan $loan) => $this->mapLoan($loan))
            ->values();

        $recentInstallments = Installment::query()
            ->where('customer_id', $customer->id)
            ->with('loan:id,loan_code')
            ->orderBy('due_date')
            ->orderBy('installment_no')
            ->limit(6)
            ->get()
            ->map(fn (Installment $installment) => $this->mapInstallment($installment))
            ->values();

        $recentPayments = Payment::query()
            ->where('customer_id', $customer->id)
            ->with(['loan:id,loan_code', 'installment:id,installment_no'])
            ->latest('payment_date')
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Payment $payment) => $this->mapPayment($payment))
            ->values();

        return Inertia::render('portal/dashboard', [
            'customer' => $this->customerPayload($customer),
            'portalAccount' => $this->portalAccountPayload($request),
            'summary' => $this->summaryPayload($customer),
            'loans' => $loans,
            'recentInstallments' => $recentInstallments,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function loans(Request $request): Response
    {
        $customer = $this->customer($request);
        $status = $request->string('status')->toString();

        $loans = Loan::query()
            ->where('customer_id', $customer->id)
            ->when($status !== '' && $status !== 'all', fn (Builder $query) => $query->where('status', $status))
            ->withCount('installments')
            ->withSum('payments', 'amount')
            ->latest('id')
            ->get()
            ->map(fn (Loan $loan) => $this->mapLoan($loan))
            ->values();

        return Inertia::render('portal/loans/index', [
            'customer' => $this->customerPayload($customer),
            'summary' => $this->summaryPayload($customer),
            'filters' => [
                'status' => $status !== '' ? $status : 'all',
            ],
            'loans' => $loans,
        ]);
    }

    public function installments(Request $request): Response
    {
        $customer = $this->customer($request);
        $status = $request->string('status')->toString();

        $installments = Installment::query()
            ->where('customer_id', $customer->id)
            ->with('loan:id,loan_code')
            ->when($status !== '' && $status !== 'all', fn (Builder $query) => $query->where('status', $status))
            ->orderBy('due_date')
            ->orderBy('installment_no')
            ->get()
            ->map(fn (Installment $installment) => $this->mapInstallment($installment))
            ->values();

        return Inertia::render('portal/installments/index', [
            'customer' => $this->customerPayload($customer),
            'summary' => $this->summaryPayload($customer),
            'filters' => [
                'status' => $status !== '' ? $status : 'all',
            ],
            'installments' => $installments,
        ]);
    }

    public function payments(Request $request): Response
    {
        $customer = $this->customer($request);
        $method = $request->string('method')->toString();

        $payments = Payment::query()
            ->where('customer_id', $customer->id)
            ->with(['loan:id,loan_code', 'installment:id,installment_no'])
            ->when($method !== '' && $method !== 'all', fn (Builder $query) => $query->where('payment_method', $method))
            ->latest('payment_date')
            ->latest('id')
            ->get()
            ->map(fn (Payment $payment) => $this->mapPayment($payment))
            ->values();

        return Inertia::render('portal/payments/index', [
            'customer' => $this->customerPayload($customer),
            'summary' => $this->summaryPayload($customer),
            'filters' => [
                'method' => $method !== '' ? $method : 'all',
            ],
            'payments' => $payments,
        ]);
    }

    public function profile(Request $request): Response
    {
        $customer = $this->customer($request);

        return Inertia::render('portal/profile', [
            'customer' => $this->customerProfilePayload($customer),
            'portalAccount' => $this->portalAccountPayload($request),
            'summary' => $this->summaryPayload($customer),
        ]);
    }

    private function customer(Request $request)
    {
        return $request->user()
            ->customer()
            ->with(['guarantors'])
            ->firstOrFail();
    }

    private function customerPayload($customer): array
    {
        return [
            'id' => $customer->id,
            'customer_code' => $customer->customer_code,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'status' => $customer->status,
            'present_address' => $customer->present_address,
            'permanent_address' => $customer->permanent_address,
            'photo_url' => $customer->photo_url,
            'guarantor_count' => $customer->guarantors->count(),
        ];
    }

    private function customerProfilePayload($customer): array
    {
        return [
            'id' => $customer->id,
            'full_name' => $customer->name,
            'name' => $customer->name,
            'customer_code' => $customer->customer_code,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'nid_number' => $customer->nid_number,
            'date_of_birth' => $customer->date_of_birth?->format('Y-m-d'),
            'gender' => $customer->gender,
            'status' => $customer->status,
            'present_address' => $customer->present_address,
            'permanent_address' => $customer->permanent_address,
            'photo_url' => $customer->photo_url,
            'nid_front_url' => $customer->nid_front_url,
            'nid_back_url' => $customer->nid_back_url,
        ];
    }

    private function portalAccountPayload(Request $request): array
    {
        $user = $request->user();

        return [
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->email,
            'last_login_at' => optional($user->last_login_at)?->format('Y-m-d H:i'),
        ];
    }

    private function summaryPayload($customer): array
    {
        $loanQuery = Loan::query()->where('customer_id', $customer->id)->whereIn('status', ['active', 'closed', 'defaulted']);
        $activeLoanCount = (clone $loanQuery)->where('status', 'active')->count();
        $closedLoanCount = (clone $loanQuery)->where('status', 'closed')->count();
        $installmentQuery = Installment::query()->where('customer_id', $customer->id);
        $openInstallmentQuery = (clone $installmentQuery)->whereIn('status', ['pending', 'partial', 'overdue']);
        $overdueInstallmentQuery = (clone $installmentQuery)->where('status', 'overdue');
        $nextDue = (clone $openInstallmentQuery)->with('loan:id,loan_code')->orderBy('due_date')->orderBy('installment_no')->first();
        $today = now()->toDateString();
        $totalPaid = (float) Payment::query()->where('customer_id', $customer->id)->sum('amount');
        $remainingBalance = (float) $openInstallmentQuery->get()->sum(fn (Installment $installment) => (float) $installment->installment_amount - (float) $installment->paid_amount);
        $overdueAmount = (float) $overdueInstallmentQuery->get()->sum(fn (Installment $installment) => (float) $installment->installment_amount - (float) $installment->paid_amount);
        $dueTodayAmount = (float) (clone $openInstallmentQuery)->whereDate('due_date', $today)->get()->sum(fn (Installment $installment) => (float) $installment->installment_amount - (float) $installment->paid_amount);
        $settlementCount = (int) Payment::query()->where('customer_id', $customer->id)->where('payment_type', 'full_settlement')->count();

        return [
            'activeLoans' => $activeLoanCount,
            'closedLoans' => $closedLoanCount,
            'totalInstallments' => (clone $installmentQuery)->count(),
            'openInstallments' => (clone $openInstallmentQuery)->count(),
            'overdueInstallments' => (clone $overdueInstallmentQuery)->count(),
            'totalPaid' => $totalPaid,
            'nextDueAmount' => $nextDue ? (float) $nextDue->installment_amount - (float) $nextDue->paid_amount : 0,
            'remainingBalance' => $remainingBalance,
            'overdueAmount' => $overdueAmount,
            'dueTodayAmount' => $dueTodayAmount,
            'nextDueDate' => $nextDue?->due_date?->format('Y-m-d'),
            'nextDueLoanCode' => $nextDue?->loan?->loan_code,
            'settlementPayments' => $settlementCount,
        ];
    }

    private function mapLoan(Loan $loan): array
    {
        $paid = (float) ($loan->payments_sum_amount ?? 0);
        $total = (float) $loan->total_payable;
        $nextDue = $loan->installments()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->orderBy('due_date')
            ->orderBy('installment_no')
            ->first();
        $openInstallments = $loan->installments()->whereIn('status', ['pending', 'partial', 'overdue'])->count();
        $overdueAmount = (float) $loan->installments()->where('status', 'overdue')->get()->sum(fn (Installment $installment) => (float) $installment->installment_amount - (float) $installment->paid_amount);

        return [
            'id' => $loan->id,
            'loan_code' => $loan->loan_code,
            'principal_amount' => (float) $loan->principal_amount,
            'total_payable' => $total,
            'total_paid' => $paid,
            'outstanding' => max($total - $paid, 0),
            'installments_count' => (int) ($loan->installments_count ?? 0),
            'open_installments' => $openInstallments,
            'overdue_amount' => $overdueAmount,
            'next_due_amount' => $nextDue ? max((float) $nextDue->installment_amount - (float) $nextDue->paid_amount, 0) : 0,
            'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
            'status' => $loan->status,
            'start_date' => $loan->start_date?->format('Y-m-d'),
            'first_collection_date' => $loan->first_collection_date?->format('Y-m-d'),
            'collection_frequency' => $loan->collection_frequency,
        ];
    }

    private function mapInstallment(Installment $installment): array
    {
        return [
            'id' => $installment->id,
            'installment_no' => $installment->installment_no,
            'loan_code' => $installment->loan?->loan_code,
            'due_date' => $installment->due_date?->format('Y-m-d'),
            'installment_amount' => (float) $installment->installment_amount,
            'paid_amount' => (float) $installment->paid_amount,
            'outstanding' => max((float) $installment->installment_amount - (float) $installment->paid_amount, 0),
            'status' => $installment->status,
        ];
    }

    private function mapPayment(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'payment_code' => $payment->payment_code,
            'loan_code' => $payment->loan?->loan_code,
            'installment_no' => $payment->installment?->installment_no,
            'amount' => (float) $payment->amount,
            'payment_date' => $payment->payment_date?->format('Y-m-d'),
            'payment_method' => $payment->payment_method,
            'payment_type' => $payment->payment_type ?: 'regular',
            'batch_reference' => $payment->batch_reference,
            'reference_no' => $payment->reference_no,
        ];
    }
}
