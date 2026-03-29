<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'updated_by',
        'assigned_staff_id',
        'customer_code',
        'name',
        'phone',
        'email',
        'nid_number',
        'date_of_birth',
        'gender',
        'father_name',
        'mother_name',
        'spouse_name',
        'occupation',
        'present_address',
        'permanent_address',
        'status',
        'notes',
        'photo_path',
        'nid_front_path',
        'nid_back_path',
    ];

    protected $appends = ['photo_url', 'nid_front_url', 'nid_back_url'];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    public function guarantors(): HasMany
    {
        return $this->hasMany(Guarantor::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function portalUsers(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getPortalUserAttribute(): ?User
    {
        return $this->portalUsers()->whereHas('roles', fn ($query) => $query->where('name', 'customer'))->first();
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
    }

    public function getNidFrontUrlAttribute(): ?string
    {
        return $this->nid_front_path ? Storage::disk('public')->url($this->nid_front_path) : null;
    }

    public function getNidBackUrlAttribute(): ?string
    {
        return $this->nid_back_path ? Storage::disk('public')->url($this->nid_back_path) : null;
    }
}
