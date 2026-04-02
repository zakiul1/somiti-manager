@extends('pdf.layout')
@section('content')
<div class="header">
    <table class="header-table">
        <tr>
            <td>
                <h1>{{ __('pdf.customer_ledger') }}</h1>
                <p class="muted">{{ __('pdf.customer_ledger_subtitle') }}</p>
            </td>
            <td class="text-right small">
                <div><strong>{{ $customer['customer_code'] }}</strong></div>
                <div class="muted">{{ __('pdf.generated_at') }}: {{ $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="25%"><div class="label">{{ __('pdf.customer') }}</div><div class="value">{{ $customer['name'] }}</div><div class="small muted">{{ $customer['phone'] ?: __('pdf.n_a') }}</div></td>
        <td class="card" width="25%"><div class="label">{{ __('pdf.total_payable') }}</div><div class="value">{{ $customer['total_payable_money'] }}</div></td>
        <td class="card" width="25%"><div class="label">{{ __('pdf.paid_amount') }}</div><div class="value">{{ $customer['total_paid_money'] }}</div></td>
        <td class="card" width="25%"><div class="label">{{ __('pdf.outstanding_amount') }}</div><div class="value">{{ $customer['remaining_balance_money'] }}</div></td>
    </tr>
</table>

<div class="section">
    <h2>{{ __('pdf.loan_statement') }}</h2>
    <table class="table" style="margin-top: 8px;">
        <thead><tr><th>{{ __('pdf.loan_code') }}</th><th>{{ __('pdf.status') }}</th><th>{{ __('pdf.total_payable') }}</th><th>{{ __('pdf.paid_amount') }}</th><th>{{ __('pdf.outstanding_amount') }}</th><th>{{ __('pdf.due_date') }}</th></tr></thead>
        <tbody>
            @forelse($customer['loans'] as $loan)
                <tr>
                    <td>{{ $loan['loan_code'] }}</td><td>{{ $loan['status_label'] }}</td><td class="text-right">{{ $loan['total_payable_money'] }}</td><td class="text-right">{{ $loan['total_paid_money'] }}</td><td class="text-right">{{ $loan['remaining_balance_money'] }}</td><td>{{ $loan['next_due_date'] }} @if($loan['next_due_date']) · {{ $loan['next_due_amount_money'] }} @endif</td>
                </tr>
            @empty
                <tr><td colspan="6">{{ __('pdf.n_a') }}</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="section">
    <h2>{{ __('pdf.receipt') }}</h2>
    <table class="table" style="margin-top: 8px;">
        <thead><tr><th>{{ __('pdf.payment_code') }}</th><th>{{ __('pdf.payment_date') }}</th><th>{{ __('pdf.loan_code') }}</th><th>{{ __('pdf.amount') }}</th><th>{{ __('pdf.payment_method') }}</th><th>{{ __('pdf.payment_type') }}</th></tr></thead>
        <tbody>
            @forelse($customer['payments'] as $payment)
                <tr>
                    <td>{{ $payment['payment_code'] }}</td><td>{{ $payment['payment_date'] }}</td><td>{{ $payment['loan_code'] }}</td><td class="text-right">{{ $payment['amount_money'] }}</td><td>{{ $payment['payment_method_label'] }}</td><td>{{ $payment['payment_type_label'] }}</td>
                </tr>
            @empty
                <tr><td colspan="6">{{ __('pdf.n_a') }}</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
