@extends('pdf.layout')
@section('content')
<div class="header">
    <table class="header-table">
        <tr>
            <td>
                <h1>Member Contribution Statement</h1>
                <p class="muted">Yearly member-wise monthly contribution summary</p>
            </td>
            <td class="text-right small">
                <div><strong>{{ $member['name'] }}</strong></div>
                <div class="muted">Generated at: {{ $generatedAt }}</div>
                <div class="muted">Year: {{ $year }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="card-grid">
    <tr>
        <td class="card" width="33%"><div class="label">Expected Total</div><div class="value">{{ $member['expected_total_money'] }}</div></td>
        <td class="card" width="33%"><div class="label">Paid Total</div><div class="value">{{ $member['paid_total_money'] }}</div></td>
        <td class="card" width="33%"><div class="label">Due Total</div><div class="value">{{ $member['due_total_money'] }}</div></td>
    </tr>
</table>

<div class="section">
    <h2>Monthly History</h2>
    <table class="table" style="margin-top: 8px;">
        <thead>
            <tr>
                <th>Month</th>
                <th>Expected</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Payment Details</th>
            </tr>
        </thead>
        <tbody>
            @forelse($history as $row)
                <tr>
                    <td>{{ $row['month_label'] }}</td>
                    <td class="text-right">{{ $row['expected_money'] }}</td>
                    <td class="text-right">{{ $row['paid_money'] }}</td>
                    <td class="text-right">{{ $row['due_money'] }}</td>
                    <td>{{ $row['status'] }}</td>
                    <td>
                        @if(count($row['payments']))
                            @foreach($row['payments'] as $payment)
                                <div>{{ $payment['paid_at'] }} · {{ $payment['amount_money'] }} · {{ $payment['method'] }} @if($payment['reference_no']) · {{ $payment['reference_no'] }} @endif</div>
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
