<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Guarantor extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'updated_by',
        'guarantor_code',
        'customer_id',
        'name',
        'phone',
        'email',
        'nid_number',
        'date_of_birth',
        'gender',
        'relationship',
        'occupation',
        'address',
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function loans(): BelongsToMany
    {
        return $this->belongsToMany(Loan::class)->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
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
