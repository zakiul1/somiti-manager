<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'updated_by',
        'assigned_staff_id',
        'loan_code',
        'customer_id',
        'principal_amount',
        'interest_rate',
        'interest_amount',
        'total_payable',
        'duration_value',
        'duration_unit',
        'collection_frequency',
        'start_date',
        'first_collection_date',
        'approved_at',
        'approved_by',
        'approval_notes',
        'disbursement_amount',
        'disbursed_at',
        'disbursed_by',
        'disbursement_method',
        'disbursement_reference',
        'disbursement_notes',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'principal_amount' => 'decimal:2',
            'interest_rate' => 'decimal:2',
            'interest_amount' => 'decimal:2',
            'total_payable' => 'decimal:2',
            'disbursement_amount' => 'decimal:2',
            'start_date' => 'date',
            'first_collection_date' => 'date',
            'approved_at' => 'datetime',
            'disbursed_at' => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function guarantors(): BelongsToMany
    {
        return $this->belongsToMany(Guarantor::class)->withTimestamps();
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

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function disburser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disbursed_by');
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
