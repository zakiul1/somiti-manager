<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'updated_by',
        'document_code',
        'title',
        'document_type',
        'entity_type',
        'customer_id',
        'loan_id',
        'issue_date',
        'expiry_date',
        'file_reference',
        'file_path',
        'original_file_name',
        'mime_type',
        'file_size_bytes',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'file_size_bytes' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

    public function getReadableFileSizeAttribute(): ?string
    {
        if (! $this->file_size_bytes) {
            return null;
        }

        $bytes = (float) $this->file_size_bytes;
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = min((int) floor(log(max($bytes, 1), 1024)), count($units) - 1);
        $value = $bytes / (1024 ** $power);

        return number_format($value, $power === 0 ? 0 : 2) . ' ' . $units[$power];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

}
