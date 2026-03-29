<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('super-admin'), 403);

        $search = trim((string) $request->string('search'));
        $role = (string) $request->string('role', 'all');
        $status = (string) $request->string('status', 'all');

        $users = User::query()
            ->with(['roles', 'assignedCustomers', 'assignedLoans', 'payments'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($nested) use ($search) {
                    $nested->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($role, ['super-admin', 'admin'], true), function ($builder) use ($role) {
                $builder->role($role);
            })
            ->when(in_array($status, ['active', 'inactive'], true), function ($builder) use ($status) {
                $builder->where('is_active', $status === 'active');
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_active' => (bool) $user->is_active,
                    'roles' => $user->getRoleNames()->values(),
                    'assigned_customers_count' => $user->assignedCustomers->count(),
                    'assigned_loans_count' => $user->assignedLoans->count(),
                    'payments_count' => $user->payments->count(),
                    'created_at' => optional($user->created_at)?->toDateString(),
                ];
            });

        return Inertia::render('admin-users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
            'stats' => [
                'total' => User::role(['super-admin', 'admin'])->count(),
                'active' => User::role(['super-admin', 'admin'])->where('is_active', true)->count(),
                'inactive' => User::role(['super-admin', 'admin'])->where('is_active', false)->count(),
                'admins' => User::role('admin')->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('super-admin'), 403);

        return Inertia::render('admin-users/create', [
            'roleOptions' => [
                ['value' => 'admin', 'label' => 'Admin'],
            ],
        ]);
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->syncRoles([$request->string('role')->toString()]);

        return redirect()->route('admin-users.index')->with('success', 'Admin user created successfully.');
    }

    public function edit(Request $request, User $user): Response
    {
        abort_unless($request->user()?->hasRole('super-admin'), 403);

        return Inertia::render('admin-users/edit', [
            'userRecord' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => (bool) $user->is_active,
                'role' => $user->getRoleNames()->first() ?? 'admin',
            ],
            'roleOptions' => [
                ['value' => 'super-admin', 'label' => 'Super Admin'],
                ['value' => 'admin', 'label' => 'Admin'],
            ],
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $user): RedirectResponse
    {
        $payload = [
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->filled('password')) {
            $payload['password'] = $request->string('password')->toString();
        }

        $user->update($payload);
        $user->syncRoles([$request->string('role')->toString()]);

        return redirect()->route('admin-users.index')->with('success', 'Admin user updated successfully.');
    }

    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('super-admin'), 403);

        if ($request->user()->is($user) && $user->is_active) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        return back()->with('success', $user->is_active ? 'User activated successfully.' : 'User deactivated successfully.');
    }
}
