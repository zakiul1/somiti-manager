<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Loan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffWorkflowController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $role = (string) $request->string('role', 'all');

        $staff = User::query()
            ->with(['roles', 'assignedCustomers', 'assignedLoans', 'payments'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($role, ['super-admin', 'admin'], true), function ($builder) use ($role) {
                $builder->role($role);
            }, function ($builder) {
                $builder->where(function ($nested) {
                    $nested->role('super-admin')->orWhere(fn ($query) => $query->role('admin'));
                });
            })
            ->orderBy('name')
            ->get()
            ->map(function (User $user) {
                $todayPayments = $user->payments->filter(fn (Payment $payment) => $payment->payment_date?->isToday());
                $monthPayments = $user->payments->filter(fn (Payment $payment) => $payment->payment_date?->between(now()->startOfMonth(), now()->endOfMonth()));

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->values(),
                    'assigned_customers_count' => $user->assignedCustomers->count(),
                    'assigned_loans_count' => $user->assignedLoans->count(),
                    'collections_today_count' => $todayPayments->count(),
                    'collections_today_amount' => (float) $todayPayments->sum('amount'),
                    'collections_month_count' => $monthPayments->count(),
                    'collections_month_amount' => (float) $monthPayments->sum('amount'),
                ];
            })
            ->values();

        return Inertia::render('staff-workflow/index', [
            'staff' => $staff,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'stats' => [
                'staff_count' => User::role(['super-admin', 'admin'])->count(),
                'assigned_customers' => Customer::whereNotNull('assigned_staff_id')->count(),
                'assigned_loans' => Loan::whereNotNull('assigned_staff_id')->count(),
                'today_collection' => (float) Payment::whereDate('payment_date', today())->sum('amount'),
            ],
        ]);
    }
}
