<?php

namespace App\Http\Controllers;

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
            'cash_count' => Payment::where('payment_method', 'cash')->count(),
        ],
    ]);
}


public function export(Request $request)
    {
        $search = trim((string) $request->string('search'));
        $method = (string) $request->string('payment_method', $request->string('method', 'all'));
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
            ->when($collectorId, fn ($builder) => $builder->where('collected_by', $collectorId))
            ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('payment_date', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($builder) => $builder->whereDate('payment_date', '<=', $dateTo))
            ->latest('payment_date')
            ->latest('id')
            ->get()
            ->map(fn (Payment $payment) => [
                $payment->payment_code,
                $payment->payment_date?->format('Y-m-d'),
                $payment->loan?->loan_code,
                $payment->customer?->customer_code,
                $payment->customer?->name,
                $payment->installment?->installment_no,
                $payment->amount,
                $payment->payment_method,
                $payment->reference_no,
                $payment->collector?->name,
                $payment->created_at?->format('Y-m-d H:i:s'),
            ]);

        return CsvExportService::download('payments-' . now()->format('Y-m-d-His') . '.csv', ['Payment Code', 'Payment Date', 'Loan Code', 'Customer Code', 'Customer Name', 'Installment No', 'Amount', 'Payment Method', 'Reference No', 'Collector', 'Created At'], $rows);
    }

    public function create(Request $request): Response
    {
        $selectedInstallment = null;
        $installmentId = $request->integer('installment_id');

        if ($installmentId) {
            $installment = Installment::query()->with(['loan:id,loan_code', 'customer:id,name,customer_code'])->find($installmentId);
            if ($installment) {
                $selectedInstallment = $this->installmentOption($installment);
            }
        }

        return Inertia::render('payments/create', [
            'paymentCode' => $this->generatePaymentCode(),
            'selectedInstallment' => $selectedInstallment,
            'admins' => User::query()->role(['super-admin', 'admin'])->orderBy('name')->get(['id', 'name', 'email'])->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
            ])->values(),
            'installments' => Installment::query()
                ->with(['loan:id,loan_code', 'customer:id,name,customer_code'])
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->orderBy('due_date')
                ->get()
                ->map(fn (Installment $installment) => $this->installmentOption($installment))
                ->values(),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $installment = Installment::query()->with('loan')->findOrFail($validated['installment_id']);

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
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $this->applyInstallmentPayment($installment->fresh(), (float) $validated['amount'], Carbon::parse($validated['payment_date']), $request->user()?->id);

            return $payment;
        });

        AuditLogService::log('payment', 'collected', 'Payment collected.', $payment, $request->user()?->id, $payment->payment_code, [
            'loan_id' => $payment->loan_id,
            'customer_id' => $payment->customer_id,
            'amount' => (float) $payment->amount,
        ]);

        return Redirect::route('payments.show', $payment)->with('success', 'Payment collected successfully.');
    }

    public function show(Payment $payment): Response
    {
        $payment->load([
            'loan:id,loan_code,status',
            'customer:id,name,customer_code,phone',
            'installment:id,installment_no,due_date,installment_amount,paid_amount,status',
            'collector:id,name,email',
        ]);

        return Inertia::render('payments/show', [
            'payment' => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->format('Y-m-d'),
                'payment_method' => $payment->payment_method,
                'reference_no' => $payment->reference_no,
                'notes' => $payment->notes,
                'loan' => $payment->loan ? [
                    'id' => $payment->loan->id,
                    'loan_code' => $payment->loan->loan_code,
                    'status' => $payment->loan->status,
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
            ] : null,
            'customer' => $installment->customer ? [
                'id' => $installment->customer->id,
                'name' => $installment->customer->name,
                'customer_code' => $installment->customer->customer_code,
            ] : null,
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
        }

        $installment->update([
            'paid_amount' => $newPaidAmount,
            'status' => $status,
            'paid_at' => $paidAt,
            'updated_by' => $actorId,
        ]);

        $loan = Loan::query()->with('installments:id,loan_id,status')->find($installment->loan_id);
        if (! $loan) {
            return;
        }

        $statuses = $loan->installments->pluck('status');
        if ($statuses->isNotEmpty() && $statuses->every(fn ($value) => $value === 'paid')) {
            $loan->update(['status' => 'closed', 'updated_by' => $actorId]);
        } elseif (in_array($loan->status, ['draft', 'closed'], true)) {
            $loan->update(['status' => 'active', 'updated_by' => $actorId]);
        }
    }

    protected function generatePaymentCode(): string
    {
        $latestId = (int) Payment::max('id') + 1;
        return 'PAY-' . str_pad((string) $latestId, 5, '0', STR_PAD_LEFT);
    }
}
