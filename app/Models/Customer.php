<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    protected $appends = [
        'photo_url',
        'nid_front_url',
        'nid_back_url',
        'photo_preview',
        'nid_front_preview',
        'nid_back_preview',
        'has_photo',
        'has_documents',
    ];

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
        return $this->portalUsers()
            ->whereHas('roles', fn ($query) => $query->where('name', 'customer'))
            ->first();
    }

    public function getHasPhotoAttribute(): bool
    {
        return filled($this->photo_path);
    }

    public function getHasDocumentsAttribute(): bool
    {
        return filled($this->nid_front_path) || filled($this->nid_back_path);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->mediaUrl($this->photo_path);
    }

    public function getNidFrontUrlAttribute(): ?string
    {
        return $this->mediaUrl($this->nid_front_path);
    }

    public function getNidBackUrlAttribute(): ?string
    {
        return $this->mediaUrl($this->nid_back_path);
    }

    public function getPhotoPreviewAttribute(): array
    {
        return $this->mediaPreview($this->photo_path);
    }

    public function getNidFrontPreviewAttribute(): array
    {
        return $this->mediaPreview($this->nid_front_path);
    }

    public function getNidBackPreviewAttribute(): array
    {
        return $this->mediaPreview($this->nid_back_path);
    }

    protected function mediaUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (! Storage::disk('public')->exists($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    protected function mediaPreview(?string $path): array
    {
        $url = $this->mediaUrl($path);

        return [
            'path' => $path,
            'url' => $url,
            'name' => $path ? basename($path) : null,
            'extension' => $path ? Str::lower(pathinfo($path, PATHINFO_EXTENSION)) : null,
            'is_image' => $this->isImagePath($path),
            'is_pdf' => $this->isPdfPath($path),
            'exists' => $url !== null,
        ];
    }

    protected function isImagePath(?string $path): bool
    {
        if (blank($path)) {
            return false;
        }

        return in_array(
            Str::lower(pathinfo($path, PATHINFO_EXTENSION)),
            ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            true
        );
    }

    protected function isPdfPath(?string $path): bool
    {
        if (blank($path)) {
            return false;
        }

        return Str::lower(pathinfo($path, PATHINFO_EXTENSION)) === 'pdf';
    }
}