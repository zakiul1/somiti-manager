<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;
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
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
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
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'designation' => $user->designation,
                    'photo_url' => $user->photo_url,
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
                ['value' => 'super-admin', 'label' => 'Super Admin'],
                ['value' => 'admin', 'label' => 'Admin'],
            ],
        ]);
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        try {
            $user = User::create([
                'name' => $request->string('name')->toString(),
                'username' => $request->filled('username')
                    ? $request->string('username')->toString()
                    : $this->generateUniqueUsername($request->string('name')->toString()),
                'email' => $request->string('email')->toString(),
                'phone' => $request->input('phone'),
                'designation' => $request->input('designation'),
                'address' => $request->input('address'),
                'password' => $request->string('password')->toString(),
                'is_active' => $request->boolean('is_active', true),
                'portal_access_enabled' => false,
            ]);

            $this->syncAdminIdentityMedia($request, $user);
            $user->syncRoles([$request->string('role')->toString()]);

            return redirect()
                ->route('admin-users.index')
                ->with('success', 'Admin user created successfully.');
        } catch (Throwable $exception) {
            Log::error('Admin user create failed.', [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'email' => $request->input('email'),
                'user_id' => $request->user()?->id,
            ]);

            return back()
                ->withInput()
                ->with('error', 'Admin user creation failed. Please check the form and try again.');
        }
    }

    public function show(Request $request, User $user): Response
    {
        abort_unless($request->user()?->hasRole('super-admin'), 403);

        return Inertia::render('admin-users/show', [
            'userRecord' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'designation' => $user->designation,
                'address' => $user->address,
                'photo_path' => $user->photo_path,
                'nid_front_path' => $user->nid_front_path,
                'nid_back_path' => $user->nid_back_path,
                'photo_url' => $user->photo_url,
                'nid_front_url' => $user->nid_front_url,
                'nid_back_url' => $user->nid_back_url,
                'is_active' => (bool) $user->is_active,
                'role' => $user->getRoleNames()->first() ?? 'admin',
                'roles' => $user->getRoleNames()->values(),
                'assigned_customers_count' => $user->assignedCustomers()->count(),
                'assigned_loans_count' => $user->assignedLoans()->count(),
                'payments_count' => $user->payments()->count(),
                'created_at' => optional($user->created_at)?->format('Y-m-d h:i A'),
                'updated_at' => optional($user->updated_at)?->format('Y-m-d h:i A'),
            ],
        ]);
    }

    public function edit(Request $request, User $user): Response
    {
        abort_unless($request->user()?->hasRole('super-admin'), 403);

        return Inertia::render('admin-users/edit', [
            'userRecord' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'designation' => $user->designation,
                'address' => $user->address,
                'photo_path' => $user->photo_path,
                'nid_front_path' => $user->nid_front_path,
                'nid_back_path' => $user->nid_back_path,
                'photo_url' => $user->photo_url,
                'nid_front_url' => $user->nid_front_url,
                'nid_back_url' => $user->nid_back_url,
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
        try {
            $payload = [
                'name' => $request->string('name')->toString(),
                'username' => $request->filled('username')
                    ? $request->string('username')->toString()
                    : $user->username,
                'email' => $request->string('email')->toString(),
                'phone' => $request->input('phone'),
                'designation' => $request->input('designation'),
                'address' => $request->input('address'),
                'is_active' => $request->boolean('is_active', true),
            ];

            if ($request->filled('password')) {
                $payload['password'] = $request->string('password')->toString();
            }

            $user->update($payload);
            $this->syncAdminIdentityMedia($request, $user);
            $user->syncRoles([$request->string('role')->toString()]);

            return redirect()
                ->route('admin-users.index')
                ->with('success', 'Admin user updated successfully.');
        } catch (Throwable $exception) {
            Log::error('Admin user update failed.', [
                'target_user_id' => $user->id,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => $request->user()?->id,
            ]);

            return back()
                ->withInput()
                ->with('error', 'Admin user update failed. Please check the form and try again.');
        }
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

        return back()->with(
            'success',
            $user->is_active ? 'User activated successfully.' : 'User deactivated successfully.'
        );
    }

    protected function syncAdminIdentityMedia(Request $request, User $user): void
    {
        $updates = [];
        $base = "users/{$user->id}/identity";

        if ($request->boolean('remove_photo')) {
            $this->deleteStoredFile($user->photo_path);
            $updates['photo_path'] = null;
        }

        if ($request->hasFile('photo')) {
            $this->deleteStoredFile($user->photo_path);
            $updates['photo_path'] = $request->file('photo')->store($base, 'public');
        }

        if ($request->boolean('remove_nid_front')) {
            $this->deleteStoredFile($user->nid_front_path);
            $updates['nid_front_path'] = null;
        }

        if ($request->hasFile('nid_front')) {
            $this->deleteStoredFile($user->nid_front_path);
            $updates['nid_front_path'] = $request->file('nid_front')->store($base, 'public');
        }

        if ($request->boolean('remove_nid_back')) {
            $this->deleteStoredFile($user->nid_back_path);
            $updates['nid_back_path'] = null;
        }

        if ($request->hasFile('nid_back')) {
            $this->deleteStoredFile($user->nid_back_path);
            $updates['nid_back_path'] = $request->file('nid_back')->store($base, 'public');
        }

        if ($updates) {
            $user->forceFill($updates)->save();
        }
    }

    protected function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    protected function generateUniqueUsername(string $name): string
    {
        $base = Str::of($name)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', '')
            ->value();

        if (blank($base)) {
            $base = 'admin';
        }

        $base = substr($base, 0, 20);
        $candidate = $base;
        $counter = 1;

        while (User::where('username', $candidate)->exists()) {
            $candidate = substr($base, 0, 16) . str_pad((string) $counter, 4, '0', STR_PAD_LEFT);
            $counter++;
        }

        return $candidate;
    }
}