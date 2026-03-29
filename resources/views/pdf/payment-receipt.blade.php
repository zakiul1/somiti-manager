@extends('pdf.layout')
@section('content')
<div class="header">
    <table class="header-table">
        <tr>
            <td>
                <h1>{{ __('pdf.receipt') }}</h1>
                <p class="muted">{{ __('pdf.receipt_subtitle') }}</p>
            </td>
            <td class="text-right small">
                <div><strong>{{ $payment['payment_code'] }}</strong></div>
                <div class="muted">{{ $payment['payment_date'] }}</div>
                <div class="muted">{{ __('pdf.generated_at') }}: {{ $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="50%">
            <div class="label">{{ __('pdf.customer') }}</div>
            <div class="value">{{ $payment['customer']['name'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.customer_code') }}: {{ $payment['customer']['customer_code'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.phone') }}: {{ $payment['customer']['phone'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.loan_code') }}: {{ $payment['loan']['loan_code'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.installment_no') }}: {{ $payment['installment']['installment_no'] ?? __('pdf.n_a') }}</div>
        </td>
        <td class="card" width="50%">
            <div class="label">{{ __('pdf.summary') }}</div>
            <div class="value">{{ $payment['amount_money'] }}</div>
            <div class="small muted">{{ __('pdf.payment_method') }}: {{ $payment['payment_method_label'] }}</div>
            <div class="small muted">{{ __('pdf.reference_no') }}: {{ $payment['reference_no'] ?: __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.collector') }}: {{ $payment['collector']['name'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.status') }}: {{ $payment['installment']['status_label'] ?? __('pdf.n_a') }}</div>
        </td>
    </tr>
</table>

<div class="section">
    <table class="table">
        <tr><th>{{ __('pdf.amount') }}</th><td class="text-right">{{ $payment['amount_money'] }}</td></tr>
        <tr><th>{{ __('pdf.installment_amount') }}</th><td class="text-right">{{ $payment['installment']['installment_amount_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><th>{{ __('pdf.paid_amount') }}</th><td class="text-right">{{ $payment['installment']['paid_amount_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><th>{{ __('pdf.notes') }}</th><td>{{ $payment['notes'] ?: __('pdf.n_a') }}</td></tr>
    </table>
</div>
@endsection
