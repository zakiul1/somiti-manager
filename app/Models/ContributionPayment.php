<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_month_id',
        'user_id',
        'amount',
        'paid_at',
        'payment_method',
        'reference_no',
        'notes',
        'received_by',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function month(): BelongsTo
    {
        return $this->belongsTo(ContributionMonth::class, 'contribution_month_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
