@extends('pdf.layout')
@section('content')
<div class="header">
    <table class="header-table">
        <tr>
            <td>
                <h1>{{ __('pdf.installment_schedule') }}</h1>
                <p class="muted">{{ __('pdf.installment_schedule_subtitle') }}</p>
            </td>
            <td class="text-right small">
                <div><strong>{{ $loan['loan_code'] }}</strong></div>
                <div class="muted">{{ $loan['customer']['name'] ?? __('pdf.n_a') }}</div>
                <div class="muted">{{ __('pdf.generated_at') }}: {{ $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="33%"><div class="label">{{ __('pdf.total_payable') }}</div><div class="value">{{ $loan['total_payable_money'] }}</div></td>
        <td class="card" width="33%"><div class="label">{{ __('pdf.collection_frequency') }}</div><div class="value">{{ $loan['collection_frequency_label'] }}</div></td>
        <td class="card" width="33%"><div class="label">{{ __('pdf.installments') }}</div><div class="value">{{ $loan['installment_count_label'] }}</div></td>
    </tr>
</table>

<div class="section">
    <table class="table">
        <thead>
            <tr>
                <th>{{ __('pdf.installment_no') }}</th>
                <th>{{ __('pdf.due_date') }}</th>
                <th class="text-right">{{ __('pdf.principal_component') }}</th>
                <th class="text-right">{{ __('pdf.interest_component') }}</th>
                <th class="text-right">{{ __('pdf.installment_amount') }}</th>
                <th class="text-right">{{ __('pdf.paid_amount') }}</th>
                <th>{{ __('pdf.status') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($loan['installments'] as $installment)
                <tr>
                    <td>{{ $installment['installment_no_label'] }}</td>
                    <td>{{ $installment['due_date'] }}</td>
                    <td class="text-right">{{ $installment['principal_component_money'] }}</td>
                    <td class="text-right">{{ $installment['interest_component_money'] }}</td>
                    <td class="text-right">{{ $installment['installment_amount_money'] }}</td>
                    <td class="text-right">{{ $installment['paid_amount_money'] }}</td>
                    <td>{{ $installment['status_label'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
