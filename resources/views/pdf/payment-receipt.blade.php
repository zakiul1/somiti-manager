@extends('pdf.layout')
@section('content')
@php($metrics = $payment['receipt_metrics'] ?? [])
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
                <div class="muted">{{ __('pdf.generated_at') }}: {{ $meta['generated_at'] ?? $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="50%">
            <div class="label">{{ __('pdf.customer') }}</div>
            <div class="value">{{ $payment['customer']['name'] ?? __('pdf.n_a') }}</div>
            <div class="small muted" style="margin-top:6px;">{{ __('pdf.customer_code') }}: {{ $payment['customer']['customer_code'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.phone') }}: {{ $payment['customer']['phone'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.loan_code') }}: {{ $payment['loan']['loan_code'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.installment_no') }}: {{ $payment['installment']['installment_no_label'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.due_date') }}: {{ $payment['installment']['due_date'] ?? __('pdf.n_a') }}</div>
        </td>
        <td class="card" width="50%">
            <div class="label">{{ __('pdf.summary') }}</div>
            <div class="value">{{ $payment['amount_money'] }}</div>
            <div class="small muted" style="margin-top:6px;">{{ __('pdf.payment_method') }}: {{ $payment['payment_method_label'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.payment_type') }}: {{ $payment['payment_type_label'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.reference_no') }}: {{ $payment['reference_no'] ?: __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.collector') }}: {{ $payment['collector']['name'] ?? $meta['prepared_by'] ?? __('pdf.n_a') }}</div>
            <div class="small muted">{{ __('pdf.status') }}: {{ $payment['installment']['status_label'] ?? __('pdf.n_a') }}</div>
        </td>
    </tr>
</table>

<div class="section">
    <h3 style="margin-bottom:8px;">{{ __('pdf.payment_breakdown') }}</h3>
    <table class="table">
        <tr>
            <th width="42%">{{ __('pdf.field') }}</th>
            <th>{{ __('pdf.value') }}</th>
        </tr>
        <tr><td>{{ __('pdf.amount') }}</td><td class="text-right">{{ $payment['amount_money'] }}</td></tr>
        <tr><td>{{ __('pdf.installment_amount') }}</td><td class="text-right">{{ $payment['installment']['installment_amount_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.paid_amount') }}</td><td class="text-right">{{ $payment['installment']['paid_amount_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.paid_for_installment') }}</td><td>{{ $payment['installment']['installment_no_label'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.payment_date') }}</td><td>{{ $payment['payment_date'] ?: __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.notes') }}</td><td>{{ $payment['notes'] ?: __('pdf.n_a') }}</td></tr>
    </table>
</div>

<div class="section">
    <h3 style="margin-bottom:8px;">{{ __('pdf.installment_progress') }}</h3>
    <table class="table">
        <tr>
            <th>{{ __('pdf.total_installments') }}</th>
            <th>{{ __('pdf.completed_installments') }}</th>
            <th>{{ __('pdf.due_installments_left') }}</th>
            <th>{{ __('pdf.overdue_installments') }}</th>
        </tr>
        <tr>
            <td class="text-center">{{ $metrics['total_installments_label'] ?? '0' }}</td>
            <td class="text-center">{{ $metrics['completed_installments_label'] ?? '0' }}</td>
            <td class="text-center">{{ $metrics['due_installments_left_label'] ?? '0' }}</td>
            <td class="text-center">{{ $metrics['overdue_installments_label'] ?? '0' }}</td>
        </tr>
        <tr>
            <th>{{ __('pdf.completed_installment_numbers') }}</th>
            <td colspan="3">{{ $metrics['completed_installment_numbers'] ?? __('pdf.n_a') }}</td>
        </tr>
        <tr>
            <th>{{ __('pdf.due_installment_numbers') }}</th>
            <td colspan="3">{{ $metrics['due_installment_numbers'] ?? __('pdf.n_a') }}</td>
        </tr>
        <tr>
            <th>{{ __('pdf.total_due_open_installments') }}</th>
            <td colspan="3" class="text-right">{{ $metrics['total_due_open_installments_money'] ?? __('pdf.n_a') }}</td>
        </tr>
    </table>
</div>

<div class="section">
    <h3 style="margin-bottom:8px;">{{ __('pdf.loan_position_after_payment') }}</h3>
    <table class="table">
        <tr>
            <th width="42%">{{ __('pdf.field') }}</th>
            <th>{{ __('pdf.value') }}</th>
        </tr>
        <tr><td>{{ __('pdf.total_loan_amount') }}</td><td class="text-right">{{ $metrics['total_loan_amount_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.total_paid_before_payment') }}</td><td class="text-right">{{ $metrics['total_paid_before_payment_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.total_paid_after_payment') }}</td><td class="text-right">{{ $metrics['total_paid_after_payment_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.total_due_after_payment') }}</td><td class="text-right">{{ $metrics['total_due_after_payment_money'] ?? __('pdf.n_a') }}</td></tr>
        <tr><td>{{ __('pdf.overdue_amount') }}</td><td class="text-right">{{ $metrics['overdue_amount_money'] ?? __('pdf.n_a') }}</td></tr>
    </table>
</div>

<div class="section">
    <h3 style="margin-bottom:8px;">{{ __('pdf.next_installment_information') }}</h3>
    <table class="table">
        <tr>
            <th>{{ __('pdf.next_installment_no') }}</th>
            <th>{{ __('pdf.due_date') }}</th>
            <th>{{ __('pdf.amount') }}</th>
            <th>{{ __('pdf.status') }}</th>
        </tr>
        @if(!empty($metrics['has_next_installment']))
            <tr>
                <td class="text-center">{{ $metrics['next_installment_no_label'] }}</td>
                <td class="text-center">{{ $metrics['next_installment_due_date'] }}</td>
                <td class="text-right">{{ $metrics['next_installment_amount_money'] }}</td>
                <td class="text-center">{{ __('pdf.pending') }}</td>
            </tr>
        @else
            <tr>
                <td colspan="4" class="text-center">{{ __('pdf.no_next_installment') }}</td>
            </tr>
        @endif
    </table>
</div>
@endsection
