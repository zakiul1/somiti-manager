@extends('pdf.layout')
@section('content')
<div class="header">
    <table class="header-table">
        <tr>
            <td>
                <h1>Monthly Contribution Summary</h1>
                <p class="muted">Month-wise member collection register</p>
            </td>
            <td class="text-right small">
                <div><strong>{{ $month['label'] }}</strong></div>
                <div class="muted">Generated at: {{ $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="25%"><div class="label">Expected / Member</div><div class="value">{{ $month['expected_per_member_money'] }}</div></td>
        <td class="card" width="25%"><div class="label">Expected Total</div><div class="value">{{ $month['expected_total_money'] }}</div></td>
        <td class="card" width="25%"><div class="label">Collected Total</div><div class="value">{{ $month['collected_total_money'] }}</div></td>
        <td class="card" width="25%"><div class="label">Due Total</div><div class="value">{{ $month['due_total_money'] }}</div></td>
    </tr>
</table>

@if(!empty($month['title']) || !empty($month['notes']))
<div class="section">
    @if(!empty($month['title']))
        <h2>{{ $month['title'] }}</h2>
    @endif
    @if(!empty($month['notes']))
        <p class="muted" style="margin-top: 6px;">{{ $month['notes'] }}</p>
    @endif
</div>
@endif

<div class="section">
    <h2>Member Ledger</h2>
    <table class="table" style="margin-top: 8px;">
        <thead>
            <tr>
                <th>Member</th>
                <th>Expected</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Payment Details</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    <td>{{ $row['name'] }}<br><span class="muted small">{{ $row['role'] }}</span></td>
                    <td class="text-right">{{ $row['expected_money'] }}</td>
                    <td class="text-right">{{ $row['paid_money'] }}</td>
                    <td class="text-right">{{ $row['due_money'] }}</td>
                    <td>{{ $row['status'] }}</td>
                    <td>
                        @if(count($row['payments']))
                            @foreach($row['payments'] as $payment)
                                <div>
                                    {{ $payment['paid_at'] }} · {{ $payment['amount_money'] }} · {{ $payment['method'] }}
                                    @if($payment['reference_no']) · {{ $payment['reference_no'] }} @endif
                                    @if($payment['receiver']) · {{ $payment['receiver'] }} @endif
                                    @if($payment['notes'])<br><span class="muted">{{ $payment['notes'] }}</span>@endif
                                </div>
                            @endforeach
                        @else
                            <span>N/A</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="6">N/A</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
