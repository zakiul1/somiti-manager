<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Installment;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\User;
use App\Services\CsvExportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function export(Request $request)
    {
        [$dateFrom, $dateTo] = $this->resolveDateRange($request);
        $customerId = $request->integer('customer_id') ?: null;
        $staffId = $request->integer('staff_id') ?: null;
        $loanStatus = $request->string('loan_status')->toString();
        $reportType = $request->string('report_type')->toString() ?: 'daily_collection';

        return match ($reportType) {
            'customer_summary' => $this->exportCustomerSummary($customerId, $staffId, $loanStatus),
            'loan_repayment' => $this->exportLoanRepayment($customerId, $staffId, $loanStatus),
            'staff_collection' => $this->exportStaffCollection($dateFrom, $dateTo, $staffId),
            'disbursement' => $this->exportDisbursements($dateFrom, $dateTo, $customerId, $staffId, $loanStatus),
            default => $this->exportDailyCollection($dateFrom, $dateTo, $customerId, $staffId, $loanStatus),
        };
    }

    public function index(Request $request): Response
    {
        [$dateFrom, $dateTo] = $this->resolveDateRange($request);
        $customerId = $request->integer('customer_id') ?: null;
        $staffId = $request->integer('staff_id') ?: null;
        $loanStatus = $request->string('loan_status')->toString();

        $customers = Customer::query()
            ->select(['id', 'customer_code', 'name'])
            ->orderBy('name')
            ->get()
            ->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'label' => trim(($customer->customer_code ? $customer->customer_code . ' - ' : '') . $customer->name),
            ])
            ->values();

        $staff = User::query()
            ->role(['super-admin', 'admin'])
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'label' => $user->name,
            ])
            ->values();

        $paymentsQuery = Payment::query()
            ->with([
                'customer:id,name,customer_code',
                'loan:id,loan_code,status,assigned_staff_id',
                'installment:id,installment_no',
                'collector:id,name',
            ])
            ->whereBetween('payment_date', [$dateFrom->toDateString(), $dateTo->toDateString()]);

        if ($customerId) {
            $paymentsQuery->where('customer_id', $customerId);
        }

        if ($staffId) {
            $paymentsQuery->where('collected_by', $staffId);
        }

        if ($loanStatus !== '') {
            $paymentsQuery->whereHas('loan', fn ($query) => $query->where('status', $loanStatus));
        }

        $recentPayments = (clone $paymentsQuery)
            ->latest('payment_date')
            ->latest('id')
            ->limit(12)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'payment_code' => $payment->payment_code,
                'amount' => (float) $payment->amount,
                'payment_date' => $payment->payment_date?->format('Y-m-d'),
                'customer' => $payment->customer ? [
                    'id' => $payment->customer->id,
                    'name' => $payment->customer->name,
                    'customer_code' => $payment->customer->customer_code,
                ] : null,
                'loan' => $payment->loan ? [
                    'id' => $payment->loan->id,
                    'loan_code' => $payment->loan->loan_code,
                    'status' => $payment->loan->status,
                ] : null,
                'installment' => $payment->installment ? [
                    'id' => $payment->installment->id,
                    'installment_no' => $payment->installment->installment_no,
                ] : null,
                'collector' => $payment->collector ? [
                    'id' => $payment->collector->id,
                    'name' => $payment->collector->name,
                ] : null,
                'payment_method' => $payment->payment_method,
                'payment_type' => $payment->payment_type ?: 'regular',
            ])
            ->values();

        $overdueInstallmentsQuery = Installment::query()
            ->with(['customer:id,name,customer_code', 'loan:id,loan_code,status,assigned_staff_id'])
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereDate('due_date', '<', today());

        if ($customerId) {
            $overdueInstallmentsQuery->where('customer_id', $customerId);
        }

        if ($staffId) {
            $overdueInstallmentsQuery->whereHas('loan', fn ($query) => $query->where('assigned_staff_id', $staffId));
        }

        if ($loanStatus !== '') {
            $overdueInstallmentsQuery->whereHas('loan', fn ($query) => $query->where('status', $loanStatus));
        }

        $overdueInstallments = (clone $overdueInstallmentsQuery)
            ->orderBy('due_date')
            ->limit(12)
            ->get()
            ->map(function (Installment $installment) {
                $outstanding = round((float) $installment->installment_amount - (float) $installment->paid_amount, 2);

                return [
                    'id' => $installment->id,
                    'installment_no' => $installment->installment_no,
                    'due_date' => $installment->due_date?->format('Y-m-d'),
                    'status' => $installment->status,
                    'installment_amount' => (float) $installment->installment_amount,
                    'paid_amount' => (float) $installment->paid_amount,
                    'outstanding_amount' => $outstanding,
                    'customer' => $installment->customer ? [
                        'id' => $installment->customer->id,
                        'name' => $installment->customer->name,
                        'customer_code' => $installment->customer->customer_code,
                    ] : null,
                    'loan' => $installment->loan ? [
                        'id' => $installment->loan->id,
                        'loan_code' => $installment->loan->loan_code,
                        'status' => $installment->loan->status,
                    ] : null,
                ];
            })
            ->values();

        $dueInRangeQuery = Installment::query()->whereBetween('due_date', [$dateFrom->toDateString(), $dateTo->toDateString()]);
        if ($customerId) {
            $dueInRangeQuery->where('customer_id', $customerId);
        }
        if ($staffId) {
            $dueInRangeQuery->whereHas('loan', fn ($query) => $query->where('assigned_staff_id', $staffId));
        }
        if ($loanStatus !== '') {
            $dueInRangeQuery->whereHas('loan', fn ($query) => $query->where('status', $loanStatus));
        }

        $collectedInRange = (float) (clone $paymentsQuery)->sum('amount');
        $dueInRange = (float) (clone $dueInRangeQuery)->sum('installment_amount');
        $paidAgainstRangeInstallments = (float) (clone $dueInRangeQuery)->sum('paid_amount');
        $outstandingOverall = (float) Installment::query()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->when($customerId, fn ($query) => $query->where('customer_id', $customerId))
            ->when($staffId, fn ($query) => $query->whereHas('loan', fn ($loanQuery) => $loanQuery->where('assigned_staff_id', $staffId)))
            ->when($loanStatus !== '', fn ($query) => $query->whereHas('loan', fn ($loanQuery) => $loanQuery->where('status', $loanStatus)))
            ->get()
            ->sum(fn (Installment $installment) => (float) $installment->installment_amount - (float) $installment->paid_amount);

        $dailyCollection = (clone $paymentsQuery)
            ->selectRaw('payment_date, SUM(amount) as total_amount, COUNT(*) as total_count')
            ->groupBy('payment_date')
            ->orderBy('payment_date')
            ->get()
            ->map(fn ($row) => [
                'date' => Carbon::parse($row->payment_date)->format('Y-m-d'),
                'amount' => round((float) $row->total_amount, 2),
                'count' => (int) $row->total_count,
            ])
            ->values();

        $customerLoanSummary = $this->buildCustomerLoanSummary($customerId, $staffId, $loanStatus);
        $loanRepaymentSummary = $this->buildLoanRepaymentSummary($customerId, $staffId, $loanStatus);
        $staffCollectionSummary = $this->buildStaffCollectionSummary($dateFrom, $dateTo, $staffId);
        $disbursementSummary = $this->buildDisbursementSummary($dateFrom, $dateTo, $customerId, $staffId, $loanStatus);

        return Inertia::render('reports/index', [
            'filters' => [
                'date_from' => $dateFrom->format('Y-m-d'),
                'date_to' => $dateTo->format('Y-m-d'),
                'customer_id' => $customerId,
                'staff_id' => $staffId,
                'loan_status' => $loanStatus,
            ],
            'customers' => $customers,
            'staff' => $staff,
            'summary' => [
                'collected_in_range' => round($collectedInRange, 2),
                'due_in_range' => round($dueInRange, 2),
                'paid_against_due_in_range' => round($paidAgainstRangeInstallments, 2),
                'overdue_count' => (clone $overdueInstallmentsQuery)->count(),
                'outstanding_overall' => round($outstandingOverall, 2),
                'payment_count_in_range' => (clone $paymentsQuery)->count(),
                'collection_rate_in_range' => $dueInRange > 0 ? round(($paidAgainstRangeInstallments / $dueInRange) * 100, 2) : 0,
                'disbursed_in_range' => $disbursementSummary['total_disbursed'],
                'disbursement_count_in_range' => $disbursementSummary['disbursement_count'],
            ],
            'dailyCollection' => $dailyCollection,
            'recentPayments' => $recentPayments,
            'overdueInstallments' => $overdueInstallments,
            'customerLoanSummary' => $customerLoanSummary,
            'loanRepaymentSummary' => $loanRepaymentSummary,
            'staffCollectionSummary' => $staffCollectionSummary,
            'disbursementSummary' => $disbursementSummary,
        ]);
    }

    private function resolveDateRange(Request $request): array
    {
        $dateFrom = $request->date('date_from')
            ? Carbon::parse((string) $request->input('date_from'))->startOfDay()
            : now()->startOfMonth()->startOfDay();
        $dateTo = $request->date('date_to')
            ? Carbon::parse((string) $request->input('date_to'))->endOfDay()
            : now()->endOfMonth()->endOfDay();

        if ($dateFrom->gt($dateTo)) {
            [$dateFrom, $dateTo] = [$dateTo->copy()->startOfDay(), $dateFrom->copy()->endOfDay()];
        }

        return [$dateFrom, $dateTo];
    }

    private function buildCustomerLoanSummary(?int $customerId, ?int $staffId, string $loanStatus): Collection
    {
        return Customer::query()
            ->with([
                'assignedStaff:id,name',
                'loans' => function ($query) use ($loanStatus) {
                    $query->with(['payments:id,loan_id,amount']);
                    if ($loanStatus !== '') {
                        $query->where('status', $loanStatus);
                    }
                },
            ])
            ->whereHas('loans', function ($query) use ($loanStatus) {
                if ($loanStatus !== '') {
                    $query->where('status', $loanStatus);
                }
            })
            ->when($customerId, fn ($query) => $query->where('id', $customerId))
            ->when($staffId, fn ($query) => $query->where('assigned_staff_id', $staffId))
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(function (Customer $customer) {
                $loans = $customer->loans;
                $principal = (float) $loans->sum('principal_amount');
                $totalPayable = (float) $loans->sum('total_payable');
                $collected = (float) $loans->flatMap->payments->sum('amount');
                $outstanding = max($totalPayable - $collected, 0);

                return [
                    'id' => $customer->id,
                    'customer_code' => $customer->customer_code,
                    'name' => $customer->name,
                    'staff' => $customer->assignedStaff?->name,
                    'loan_count' => $loans->count(),
                    'active_loan_count' => $loans->where('status', 'active')->count(),
                    'principal' => round($principal, 2),
                    'total_payable' => round($totalPayable, 2),
                    'collected' => round($collected, 2),
                    'outstanding' => round($outstanding, 2),
                ];
            })
            ->values();
    }

    private function buildLoanRepaymentSummary(?int $customerId, ?int $staffId, string $loanStatus): Collection
    {
        return Loan::query()
            ->with(['customer:id,name,customer_code', 'assignedStaff:id,name', 'payments:id,loan_id,amount', 'installments:id,loan_id'])
            ->when($customerId, fn ($query) => $query->where('customer_id', $customerId))
            ->when($staffId, fn ($query) => $query->where('assigned_staff_id', $staffId))
            ->when($loanStatus !== '', fn ($query) => $query->where('status', $loanStatus))
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(function (Loan $loan) {
                $collected = (float) $loan->payments->sum('amount');
                $totalPayable = (float) $loan->total_payable;
                $outstanding = max($totalPayable - $collected, 0);
                $progress = $totalPayable > 0 ? round(($collected / $totalPayable) * 100, 2) : 0;

                return [
                    'id' => $loan->id,
                    'loan_code' => $loan->loan_code,
                    'customer' => $loan->customer ? [
                        'id' => $loan->customer->id,
                        'name' => $loan->customer->name,
                        'customer_code' => $loan->customer->customer_code,
                    ] : null,
                    'staff' => $loan->assignedStaff?->name,
                    'status' => $loan->status,
                    'principal_amount' => (float) $loan->principal_amount,
                    'total_payable' => $totalPayable,
                    'collected' => round($collected, 2),
                    'outstanding' => round($outstanding, 2),
                    'progress' => $progress,
                    'installment_count' => $loan->installments->count(),
                ];
            })
            ->values();
    }

    private function buildStaffCollectionSummary(Carbon $dateFrom, Carbon $dateTo, ?int $staffId): Collection
    {
        $staffMembers = User::query()
            ->role(['super-admin', 'admin'])
            ->with([
                'assignedCustomers:id,assigned_staff_id',
                'assignedLoans:id,assigned_staff_id',
                'payments' => fn ($query) => $query
                    ->select(['id', 'collected_by', 'amount', 'payment_date'])
                    ->whereBetween('payment_date', [$dateFrom->toDateString(), $dateTo->toDateString()]),
            ])
            ->when($staffId, fn ($query) => $query->where('id', $staffId))
            ->orderBy('name')
            ->get();

        return $staffMembers->map(function (User $user) {
            $collections = (float) $user->payments->sum('amount');

            return [
                'id' => $user->id,
                'name' => $user->name,
                'assigned_customers' => $user->assignedCustomers->count(),
                'assigned_loans' => $user->assignedLoans->count(),
                'payment_count' => $user->payments->count(),
                'collected_amount' => round($collections, 2),
            ];
        })->values();
    }

    private function buildDisbursementSummary(Carbon $dateFrom, Carbon $dateTo, ?int $customerId, ?int $staffId, string $loanStatus): array
    {
        $query = Loan::query()
            ->with(['customer:id,name,customer_code', 'assignedStaff:id,name', 'disburser:id,name'])
            ->whereNotNull('disbursed_at')
            ->whereBetween('disbursed_at', [$dateFrom->toDateString(), $dateTo->toDateString()]);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($staffId) {
            $query->where('assigned_staff_id', $staffId);
        }

        if ($loanStatus !== '') {
            $query->where('status', $loanStatus);
        }

        $rows = $query->latest('disbursed_at')
            ->limit(20)
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'customer' => $loan->customer ? [
                    'id' => $loan->customer->id,
                    'name' => $loan->customer->name,
                    'customer_code' => $loan->customer->customer_code,
                ] : null,
                'staff' => $loan->assignedStaff?->name,
                'disburser' => $loan->disburser?->name,
                'status' => $loan->status,
                'disbursement_amount' => (float) ($loan->disbursement_amount ?? 0),
                'disbursed_at' => $loan->disbursed_at?->format('Y-m-d'),
                'method' => $loan->disbursement_method,
            ])
            ->values();

        return [
            'rows' => $rows,
            'total_disbursed' => round((float) $rows->sum('disbursement_amount'), 2),
            'disbursement_count' => $rows->count(),
        ];
    }

    private function exportDailyCollection(Carbon $dateFrom, Carbon $dateTo, ?int $customerId, ?int $staffId, string $loanStatus)
    {
        $query = Payment::query()->whereBetween('payment_date', [$dateFrom->toDateString(), $dateTo->toDateString()]);
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }
        if ($staffId) {
            $query->where('collected_by', $staffId);
        }
        if ($loanStatus !== '') {
            $query->whereHas('loan', fn ($loanQuery) => $loanQuery->where('status', $loanStatus));
        }

        $rows = $query
            ->selectRaw('payment_date, SUM(amount) as total_amount, COUNT(*) as total_count')
            ->groupBy('payment_date')
            ->orderBy('payment_date')
            ->get()
            ->map(fn ($row) => [
                Carbon::parse($row->payment_date)->format('Y-m-d'),
                (int) $row->total_count,
                round((float) $row->total_amount, 2),
            ]);

        return CsvExportService::download('daily-collection-' . now()->format('Y-m-d-His') . '.csv', ['Date', 'Payment Count', 'Collected Amount'], $rows);
    }

    private function exportCustomerSummary(?int $customerId, ?int $staffId, string $loanStatus)
    {
        $rows = $this->buildCustomerLoanSummary($customerId, $staffId, $loanStatus)
            ->map(fn (array $row) => [
                $row['customer_code'],
                $row['name'],
                $row['staff'] ?? '-',
                $row['loan_count'],
                $row['active_loan_count'],
                $row['principal'],
                $row['total_payable'],
                $row['collected'],
                $row['outstanding'],
            ]);

        return CsvExportService::download('customer-loan-summary-' . now()->format('Y-m-d-His') . '.csv', ['Customer Code', 'Customer', 'Assigned Staff', 'Loan Count', 'Active Loans', 'Principal', 'Total Payable', 'Collected', 'Outstanding'], $rows);
    }

    private function exportLoanRepayment(?int $customerId, ?int $staffId, string $loanStatus)
    {
        $rows = $this->buildLoanRepaymentSummary($customerId, $staffId, $loanStatus)
            ->map(fn (array $row) => [
                $row['loan_code'],
                $row['customer']['name'] ?? '-',
                $row['staff'] ?? '-',
                $row['status'],
                $row['principal_amount'],
                $row['total_payable'],
                $row['collected'],
                $row['outstanding'],
                $row['progress'],
                $row['installment_count'],
            ]);

        return CsvExportService::download('loan-repayment-summary-' . now()->format('Y-m-d-His') . '.csv', ['Loan Code', 'Customer', 'Assigned Staff', 'Status', 'Principal', 'Total Payable', 'Collected', 'Outstanding', 'Progress %', 'Installments'], $rows);
    }

    private function exportStaffCollection(Carbon $dateFrom, Carbon $dateTo, ?int $staffId)
    {
        $rows = $this->buildStaffCollectionSummary($dateFrom, $dateTo, $staffId)
            ->map(fn (array $row) => [
                $row['name'],
                $row['assigned_customers'],
                $row['assigned_loans'],
                $row['payment_count'],
                $row['collected_amount'],
            ]);

        return CsvExportService::download('staff-collection-summary-' . now()->format('Y-m-d-His') . '.csv', ['Staff', 'Assigned Customers', 'Assigned Loans', 'Payment Count', 'Collected Amount'], $rows);
    }

    private function exportDisbursements(Carbon $dateFrom, Carbon $dateTo, ?int $customerId, ?int $staffId, string $loanStatus)
    {
        $rows = collect($this->buildDisbursementSummary($dateFrom, $dateTo, $customerId, $staffId, $loanStatus)['rows'])
            ->map(fn (array $row) => [
                $row['loan_code'],
                $row['customer']['name'] ?? '-',
                $row['staff'] ?? '-',
                $row['disburser'] ?? '-',
                $row['status'],
                $row['disbursement_amount'],
                $row['disbursed_at'],
                $row['method'] ?? '-',
            ]);

        return CsvExportService::download('disbursement-summary-' . now()->format('Y-m-d-His') . '.csv', ['Loan Code', 'Customer', 'Assigned Staff', 'Disbursed By', 'Status', 'Disbursement Amount', 'Disbursed At', 'Method'], $rows);
    }
}
