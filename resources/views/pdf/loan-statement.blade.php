@extends('pdf.layout')
@section('content')
<div class="header">
    <table class="header-table">
        <tr>
            <td>
                <h1>{{ __('pdf.loan_statement') }}</h1>
                <p class="muted">{{ __('pdf.loan_statement_subtitle') }}</p>
            </td>
            <td class="text-right small">
                <div><strong>{{ $loan['loan_code'] }}</strong></div>
                <div class="muted">{{ __('pdf.loan_status') }}: {{ $loan['status_label'] }}</div>
                <div class="muted">{{ __('pdf.generated_at') }}: {{ $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="25%"><div class="label">{{ __('pdf.customer') }}</div><div class="value">{{ $loan['customer']['name'] ?? __('pdf.n_a') }}</div><div class="small muted">{{ $loan['customer']['customer_code'] ?? __('pdf.n_a') }}</div></td>
        <td class="card" width="25%"><div class="label">{{ __('pdf.principal_amount') }}</div><div class="value">{{ $loan['principal_amount_money'] }}</div></td>
        <td class="card" width="25%"><div class="label">{{ __('pdf.interest_amount') }}</div><div class="value">{{ $loan['interest_amount_money'] }}</div><div class="small muted">{{ __('pdf.interest_rate') }}: {{ $loan['interest_rate_label'] }}</div></td>
        <td class="card" width="25%"><div class="label">{{ __('pdf.total_payable') }}</div><div class="value">{{ $loan['total_payable_money'] }}</div></td>
    </tr>
</table>

<div class="section">
    <table class="table">
        <tr><th>{{ __('pdf.duration') }}</th><td>{{ $loan['duration_label'] }}</td><th>{{ __('pdf.collection_frequency') }}</th><td>{{ $loan['collection_frequency_label'] }}</td></tr>
        <tr><th>{{ __('pdf.start_date') }}</th><td>{{ $loan['start_date'] }}</td><th>{{ __('pdf.first_collection_date') }}</th><td>{{ $loan['first_collection_date'] }}</td></tr>
    </table>
</div>

<div class="section">
    <h2>{{ __('pdf.guarantor_coverage') }}</h2>
    <table class="table" style="margin-top: 8px;">
        <thead>
            <tr><th>{{ __('pdf.customer') }}</th><th>{{ __('pdf.phone') }}</th><th>{{ __('pdf.relationship') }}</th><th>{{ __('pdf.status') }}</th></tr>
        </thead>
        <tbody>
            @forelse($loan['guarantors'] as $guarantor)
                <tr>
                    <td>{{ $guarantor['name'] }}</td>
                    <td>{{ $guarantor['phone'] ?: __('pdf.n_a') }}</td>
                    <td>{{ $guarantor['relationship'] ?: __('pdf.n_a') }}</td>
                    <td>{{ $guarantor['status_label'] }}</td>
                </tr>
            @empty
                <tr><td colspan="4">{{ __('pdf.no_guarantors') }}</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="section">
    <h2>{{ __('pdf.installments') }}</h2>
    <table class="table" style="margin-top: 8px;">
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
