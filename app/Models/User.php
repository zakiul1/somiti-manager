<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;
    use HasRoles;

    protected $fillable = [
        'customer_id',
        'name',
        'username',
        'email',
        'password',
        'phone',
        'designation',
        'address',
        'photo_path',
        'nid_front_path',
        'nid_back_path',
        'is_active',
        'portal_access_enabled',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'photo_url',
        'nid_front_url',
        'nid_back_url',
        'display_name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'portal_access_enabled' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'collected_by');
    }

    public function assignedCustomers(): HasMany
    {
        return $this->hasMany(Customer::class, 'assigned_staff_id');
    }

    public function assignedLoans(): HasMany
    {
        return $this->hasMany(Loan::class, 'assigned_staff_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'actor_id');
    }

    public function contributionPayments(): HasMany
    {
        return $this->hasMany(ContributionPayment::class, 'user_id');
    }

    public function receivedContributionPayments(): HasMany
    {
        return $this->hasMany(ContributionPayment::class, 'received_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isCustomerPortalUser(): bool
    {
        return $this->hasRole('customer');
    }

    public function isAdminUser(): bool
    {
        return $this->hasAnyRole(['super-admin', 'admin']);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?: $this->email ?: $this->username ?: 'User';
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (blank($this->photo_path)) {
            return null;
        }

        return Storage::disk('public')->url($this->photo_path);
    }

    public function getNidFrontUrlAttribute(): ?string
    {
        if (blank($this->nid_front_path)) {
            return null;
        }

        return Storage::disk('public')->url($this->nid_front_path);
    }

    public function getNidBackUrlAttribute(): ?string
    {
        if (blank($this->nid_back_path)) {
            return null;
        }

        return Storage::disk('public')->url($this->nid_back_path);
    }
}