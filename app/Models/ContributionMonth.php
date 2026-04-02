<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContributionMonth extends Model
{
    use HasFactory;

    protected $fillable = [
        'month_date',
        'expected_amount',
        'title',
        'notes',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'month_date' => 'date',
            'expected_amount' => 'decimal:2',
        ];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ContributionPayment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
