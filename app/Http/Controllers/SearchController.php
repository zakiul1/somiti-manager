<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Document;
use App\Models\Guarantor;
use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->string('q'));

        $customers = collect();
        $guarantors = collect();
        $loans = collect();
        $installments = collect();
        $payments = collect();
        $documents = collect();

        if ($query !== '') {
            $customers = Customer::query()
                ->where(function ($builder) use ($query) {
                    $builder
                        ->where('customer_code', 'like', "%{$query}%")
                        ->orWhere('name', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('nid_number', 'like', "%{$query}%");
                })
                ->latest()
                ->limit(6)
                ->get(['id', 'customer_code', 'name', 'phone', 'status'])
                ->map(fn (Customer $customer) => [
                    'id' => $customer->id,
                    'title' => $customer->name,
                    'subtitle' => $customer->customer_code . ' • ' . ($customer->phone ?: '-'),
                    'status' => $customer->status,
                    'url' => route('customers.show', $customer),
                ]);

            $guarantors = Guarantor::query()
                ->with('customer:id,name,customer_code')
                ->where(function ($builder) use ($query) {
                    $builder
                        ->where('guarantor_code', 'like', "%{$query}%")
                        ->orWhere('name', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%")
                        ->orWhere('nid_number', 'like', "%{$query}%");
                })
                ->latest()
                ->limit(6)
                ->get(['id', 'customer_id', 'guarantor_code', 'name', 'phone', 'status'])
                ->map(fn (Guarantor $guarantor) => [
                    'id' => $guarantor->id,
                    'title' => $guarantor->name,
                    'subtitle' => $guarantor->guarantor_code . ' • ' . ($guarantor->customer?->name ?: '-'),
                    'status' => $guarantor->status,
                    'url' => route('guarantors.show', $guarantor),
                ]);

            $loans = Loan::query()
                ->with(['customer:id,name,customer_code', 'assignedStaff:id,name'])
                ->where(function ($builder) use ($query) {
                    $builder
                        ->where('loan_code', 'like', "%{$query}%")
                        ->orWhereHas('customer', fn ($nested) => $nested
                            ->where('name', 'like', "%{$query}%")
                            ->orWhere('customer_code', 'like', "%{$query}%"));
                })
                ->latest()
                ->limit(6)
                ->get(['id', 'customer_id', 'assigned_staff_id', 'loan_code', 'status', 'principal_amount'])
                ->map(fn (Loan $loan) => [
                    'id' => $loan->id,
                    'title' => $loan->loan_code,
                    'subtitle' => ($loan->customer?->name ?: '-') . ' • ' . number_format((float) $loan->principal_amount, 2),
                    'status' => $loan->status,
                    'url' => route('loans.show', $loan),
                ]);

            $installments = Installment::query()
                ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
                ->where(function ($builder) use ($query) {
                    $builder->whereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$query}%"))
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$query}%")
                            ->orWhere('customer_code', 'like', "%{$query}%"));
                })
                ->orderBy('due_date')
                ->limit(6)
                ->get(['id', 'loan_id', 'customer_id', 'installment_no', 'due_date', 'status'])
                ->map(fn (Installment $installment) => [
                    'id' => $installment->id,
                    'title' => ($installment->loan?->loan_code ?: '-') . ' • #' . $installment->installment_no,
                    'subtitle' => ($installment->customer?->name ?: '-') . ' • ' . optional($installment->due_date)->format('Y-m-d'),
                    'status' => $installment->status,
                    'url' => route('installments.show', $installment->loan_id),
                ]);

            $payments = Payment::query()
                ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
                ->where(function ($builder) use ($query) {
                    $builder
                        ->where('payment_code', 'like', "%{$query}%")
                        ->orWhere('reference_no', 'like', "%{$query}%")
                        ->orWhereHas('loan', fn ($loanQuery) => $loanQuery->where('loan_code', 'like', "%{$query}%"))
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('name', 'like', "%{$query}%")
                            ->orWhere('customer_code', 'like', "%{$query}%"));
                })
                ->latest('payment_date')
                ->limit(6)
                ->get(['id', 'loan_id', 'customer_id', 'payment_code', 'amount', 'payment_date', 'payment_method'])
                ->map(fn (Payment $payment) => [
                    'id' => $payment->id,
                    'title' => $payment->payment_code,
                    'subtitle' => ($payment->customer?->name ?: '-') . ' • ' . number_format((float) $payment->amount, 2),
                    'status' => $payment->payment_method,
                    'url' => route('payments.show', $payment),
                ]);

            $documents = Document::query()
                ->where(function ($builder) use ($query) {
                    $builder
                        ->where('document_code', 'like', "%{$query}%")
                        ->orWhere('title', 'like', "%{$query}%")
                        ->orWhere('document_type', 'like', "%{$query}%")
                        ->orWhere('original_file_name', 'like', "%{$query}%");
                })
                ->latest()
                ->limit(6)
                ->get(['id', 'document_code', 'title', 'document_type', 'status'])
                ->map(fn (Document $document) => [
                    'id' => $document->id,
                    'title' => $document->title,
                    'subtitle' => $document->document_code . ' • ' . $document->document_type,
                    'status' => $document->status,
                    'url' => route('documents.show', $document),
                ]);
        }

        return Inertia::render('search/index', [
            'query' => $query,
            'results' => [
                'customers' => $customers,
                'guarantors' => $guarantors,
                'loans' => $loans,
                'installments' => $installments,
                'payments' => $payments,
                'documents' => $documents,
            ],
            'totals' => [
                'customers' => $customers->count(),
                'guarantors' => $guarantors->count(),
                'loans' => $loans->count(),
                'installments' => $installments->count(),
                'payments' => $payments->count(),
                'documents' => $documents->count(),
            ],
        ]);
    }
}
