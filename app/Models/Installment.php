<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Installment extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'updated_by',
        'loan_id',
        'customer_id',
        'installment_no',
        'due_date',
        'principal_component',
        'interest_component',
        'installment_amount',
        'paid_amount',
        'status',
        'paid_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'paid_at' => 'date',
            'principal_component' => 'decimal:2',
            'interest_component' => 'decimal:2',
            'installment_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
        ];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'partial']);
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['pending', 'partial', 'overdue']);
    }

    public function scopeOverdue($query)
    {
        return $query
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereDate('due_date', '<', now()->toDateString());
    }

    public function scopeDueToday($query)
    {
        return $query
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereDate('due_date', now()->toDateString());
    }

    public function scopeUpcoming($query, int $days = 7)
    {
        return $query
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereDate('due_date', '>', now()->toDateString())
            ->whereDate('due_date', '<=', now()->addDays($days)->toDateString());
    }
}
