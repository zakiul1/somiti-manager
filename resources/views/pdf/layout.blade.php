<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 18px 22px; }
        body { font-family: 'Noto Sans Bengali', 'DejaVu Sans', sans-serif; font-size: 12px; color: #0f172a; }
        h1,h2,h3,p { margin: 0; }
        .org-header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 16px; }
        .header { border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px; }
        .header-table, .meta-table, .table, .signature-table { width: 100%; border-collapse: collapse; }
        .muted { color: #475569; }
        .section { margin-top: 18px; }
        .card-grid { width: 100%; border-collapse: separate; border-spacing: 10px 10px; margin: 8px -10px 0 -10px; }
        .card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px; vertical-align: top; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #475569; }
        .value { margin-top: 5px; font-size: 13px; font-weight: 600; color: #0f172a; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
        .table th { background: #f8fafc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .small { font-size: 11px; }
        .footer { margin-top: 24px; font-size: 11px; color: #475569; }
        .signature-cell { width: 50%; padding-top: 30px; }
        .signature-line { border-top: 1px solid #94a3b8; width: 220px; margin-top: 36px; padding-top: 8px; }
        .meta-strip { margin-top: 8px; font-size: 11px; color: #475569; }
        .document-chip { display: inline-block; margin-top: 6px; border: 1px solid #cbd5e1; border-radius: 999px; padding: 4px 10px; font-size: 10px; letter-spacing: .04em; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="org-header">
        <table class="header-table">
            <tr>
                <td>
                    <h1>{{ $organization['name'] ?? config('app.name') }}</h1>
                    @if(!empty($organization['address']))
                        <p class="muted small" style="margin-top:4px;">{{ $organization['address'] }}</p>
                    @endif
                    @if(!empty($organization['phone']) || !empty($organization['email']))
                        <p class="muted small" style="margin-top:4px;">
                            {{ $organization['phone'] ?? '' }}@if(!empty($organization['phone']) && !empty($organization['email'])) · @endif{{ $organization['email'] ?? '' }}
                        </p>
                    @endif
                    <div class="document-chip">{{ __('pdf.official_document') }}</div>
                </td>
                <td class="text-right small">
                    <div><strong>{{ __('pdf.generated_at') }}</strong></div>
                    <div class="muted">{{ $meta['generated_at'] ?? $generatedAt ?? '' }}</div>
                    @if(!empty($meta['prepared_by']))
                        <div class="meta-strip">{{ __('pdf.prepared_by') }}: {{ $meta['prepared_by'] }}</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    @yield('content')

    <div class="footer">
        @if(!empty($organization['footer_note']))
            <p>{{ $organization['footer_note'] }}</p>
        @endif
        <table class="signature-table" style="margin-top: 18px;">
            <tr>
                <td class="signature-cell">
                    <div class="signature-line">
                        <div><strong>{{ $meta['prepared_by'] ?? __('print.preparedBy') }}</strong></div>
                        <div class="muted small">{{ __('pdf.prepared_by') }}</div>
                    </div>
                </td>
                <td class="signature-cell text-right">
                    <div style="display:inline-block; text-align:left;">
                        <div class="signature-line">
                            <div><strong>{{ $organization['authority_name'] ?: __('print.signature') }}</strong></div>
                            <div class="muted small">{{ $organization['authority_title'] ?: __('print.approvedBy') }}</div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
