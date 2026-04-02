<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StaffWorkflowController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $role = (string) $request->string('role', 'all');

        $baseQuery = User::query()
            ->select('users.*')
            ->with('roles')
            ->withCount([
                'assignedCustomers',
                'assignedLoans',
                'payments as collections_today_count' => fn ($query) => $query->whereDate('payment_date', today()),
                'payments as collections_month_count' => fn ($query) => $query->whereBetween('payment_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()]),
                'assignedLoans as active_assigned_loans_count' => fn ($query) => $query->where('status', 'active'),
            ])
            ->withSum([
                'payments as collections_today_amount' => fn ($query) => $query->whereDate('payment_date', today()),
            ], 'amount')
            ->withSum([
                'payments as collections_month_amount' => fn ($query) => $query->whereBetween('payment_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()]),
            ], 'amount')
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested->where('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%")
                        ->orWhere('users.phone', 'like', "%{$search}%");
                });
            })
            ->when(in_array($role, ['super-admin', 'admin'], true), function ($builder) use ($role) {
                $builder->role($role);
            }, function ($builder) {
                $builder->where(function ($nested) {
                    $nested->role('super-admin')->orWhere(fn ($query) => $query->role('admin'));
                });
            })
            ->orderBy('users.name');

        $staff = $baseQuery->get()->map(function (User $user) {
            $overdueAssignedLoansCount = Loan::query()
                ->where('assigned_staff_id', $user->id)
                ->whereHas('installments', function ($query) {
                    $query->whereIn('status', ['pending', 'partial', 'overdue'])
                        ->whereDate('due_date', '<', today());
                })
                ->count();

            $dueTodayAssignedAmount = (float) InstallmentSummary::forStaffToday($user->id);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'designation' => $user->designation,
                'is_active' => (bool) $user->is_active,
                'roles' => $user->getRoleNames()->values(),
                'assigned_customers_count' => (int) $user->assigned_customers_count,
                'assigned_loans_count' => (int) $user->assigned_loans_count,
                'active_assigned_loans_count' => (int) $user->active_assigned_loans_count,
                'collections_today_count' => (int) $user->collections_today_count,
                'collections_today_amount' => (float) ($user->collections_today_amount ?? 0),
                'collections_month_count' => (int) $user->collections_month_count,
                'collections_month_amount' => (float) ($user->collections_month_amount ?? 0),
                'overdue_assigned_loans_count' => $overdueAssignedLoansCount,
                'due_today_assigned_amount' => $dueTodayAssignedAmount,
            ];
        })->values();

        $stats = [
            'staff_count' => User::role(['super-admin', 'admin'])->count(),
            'active_staff_count' => User::role(['super-admin', 'admin'])->where('is_active', true)->count(),
            'assigned_customers' => Customer::whereNotNull('assigned_staff_id')->count(),
            'assigned_loans' => Loan::whereNotNull('assigned_staff_id')->count(),
            'active_assigned_loans' => Loan::whereNotNull('assigned_staff_id')->where('status', 'active')->count(),
            'today_collection' => (float) Payment::whereDate('payment_date', today())->sum('amount'),
            'month_collection' => (float) Payment::whereBetween('payment_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])->sum('amount'),
        ];

        return Inertia::render('staff-workflow/index', [
            'staff' => $staff,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'stats' => $stats,
        ]);
    }
}

class InstallmentSummary
{
    public static function forStaffToday(int $staffId): float
    {
        return (float) DB::table('installments')
            ->join('loans', 'loans.id', '=', 'installments.loan_id')
            ->where('loans.assigned_staff_id', $staffId)
            ->whereIn('installments.status', ['pending', 'partial', 'overdue'])
            ->whereDate('installments.due_date', today())
            ->sum(DB::raw('installments.installment_amount - installments.paid_amount'));
    }
}
