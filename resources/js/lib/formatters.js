export function formatMoney(value, locale = 'en') {
    const resolved = locale === 'bn' ? 'bn-BD' : 'en-US';
    return new Intl.NumberFormat(resolved, {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

export function formatDate(value, locale = 'en') {
    if (!value) return '-';
    const resolved = locale === 'bn' ? 'bn-BD' : 'en-CA';
    return new Intl.DateTimeFormat(resolved, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(new Date(value));
}

export function formatNumber(value, locale = 'en') {
    const resolved = locale === 'bn' ? 'bn-BD' : 'en-US';
    return new Intl.NumberFormat(resolved).format(Number(value || 0));
}
