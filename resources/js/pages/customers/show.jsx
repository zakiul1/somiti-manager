import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { AppCard } from '@/components/ui/app-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { useLocale } from '@/hooks/use-locale';

function SectionTitle({ title, subtitle = null, actions = null }) {
    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </h2>
                {subtitle ? (
                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
    );
}

function DetailItem({ label, value, className = '' }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 ${className}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">
                {value || '-'}
            </p>
        </div>
    );
}

function SummaryStat({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}

function PreviewModal({ open, media, onClose, tr, isBangla }) {
    if (!open || !media?.url) {
        return null;
    }

    const isPdf = media?.is_pdf || media?.url?.toLowerCase().endsWith('.pdf');
    const isImage = media?.is_image || !isPdf;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
            <div className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl dark:bg-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {media.title}
                        </h3>
                        {media.name ? (
                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                                {media.name}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={media.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                            {tr('common.download', 'Download', 'ডাউনলোড')}
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            {tr('common.close', 'Close', 'বন্ধ করুন')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-900">
                    <div className="flex min-h-full items-center justify-center">
                        {isPdf ? (
                            <iframe
                                src={media.url}
                                title={media.title}
                                className="h-[78vh] w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800"
                            />
                        ) : isImage ? (
                            <img
                                src={media.url}
                                alt={media.title}
                                className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-xl"
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                {isBangla
                                    ? 'এই ফাইলটি প্রিভিউ করা যাচ্ছে না।'
                                    : 'This file cannot be previewed here.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MediaPreviewCard({
    title,
    preview,
    fallbackUrl = null,
    emptyLabel,
    pdfLabel,
    imageLabel,
    onOpen,
}) {
    const url = preview?.url || fallbackUrl || null;
    const isPdf = preview?.is_pdf || url?.toLowerCase().endsWith('.pdf');
    const isImage = preview?.is_image || (!!url && !isPdf);

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </p>
            </div>

            <div className="p-5">
                {url ? (
                    isPdf ? (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={onOpen}
                                className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                <div className="mb-3 text-4xl">📄</div>
                                <span className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                    {pdfLabel}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={onOpen}
                                className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {pdfLabel}
                            </button>
                        </div>
                    ) : isImage ? (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={onOpen}
                                className="block w-full"
                            >
                                <img
                                    src={url}
                                    alt={title}
                                    className="h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={onOpen}
                                className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {imageLabel}
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            {emptyLabel}
                        </div>
                    )
                ) : (
                    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </div>
    );
}


function HeaderProfile({ customer, tr, actions = null }) {
    const profilePhoto = customer.photo_preview?.url || customer.photo_url || null;

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        {profilePhoto ? (
                            <img
                                src={profilePhoto}
                                alt={customer.name}
                                className="h-24 w-24 shrink-0 rounded-3xl object-cover ring-2 ring-slate-200 dark:ring-slate-800"
                            />
                        ) : (
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-slate-200 text-3xl font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {(customer.name || 'C').charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="break-words text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                    {customer.name}
                                </h1>

                                <AppBadge variant={customer.status === 'active' ? 'success' : 'warning'}>
                                    {customer.status === 'active'
                                        ? tr('customers.active', 'Active', 'সক্রিয়')
                                        : tr('customers.inactive', 'Inactive', 'নিষ্ক্রিয়')}
                                </AppBadge>

                                {customer.portal_account ? (
                                    <AppBadge variant="default">
                                        {tr('portal.customerPortal', 'Customer Portal', 'কাস্টমার পোর্টাল')}
                                    </AppBadge>
                                ) : null}
                            </div>

                            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                {customer.customer_code}
                            </p>

                            <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {tr(
                                    'customers.recordSummarySubtitle',
                                    'Review customer information, document readiness, portal status, and linked records in one place.',
                                    'গ্রাহকের তথ্য, ডকুমেন্ট প্রস্তুতি, পোর্টাল স্ট্যাটাস এবং সংযুক্ত রেকর্ড এক জায়গায় দেখুন।'
                                )}
                            </p>
                        </div>
                    </div>

                    {actions ? <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">{actions}</div> : null}
                </div>
            </div>
        </div>
    );
}

export default function CustomerShow({ customer }) {
    const { t, locale } = useLocale();
    const { props } = usePage();
    const [showDelete, setShowDelete] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);
    const isBangla = locale === 'bn';

    const formatMoney = (value) => new Intl.NumberFormat(isBangla ? 'bn-BD' : 'en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

    const formatDate = (value) => {
        if (!value) return tr('customers.noNextDueDate', 'No upcoming due date', 'পরবর্তী কোনো দাবি নেই');
        return new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(value));
    };

    const tr = useMemo(
        () => (key, en, bn) => {
            const value = t(key);
            if (!value || value === key) {
                return isBangla ? bn : en;
            }
            return value;
        },
        [t, isBangla]
    );

    const openMedia = (title, preview, fallbackUrl = null) => {
        const media = {
            title,
            url: preview?.url || fallbackUrl || null,
            name: preview?.name || null,
            is_pdf: preview?.is_pdf || false,
            is_image: preview?.is_image ?? true,
        };

        if (media.url) {
            setPreviewMedia(media);
        }
    };

    return (
        <>
            <Head title={customer.name} />

            <AppLayout>
                <PageContainer>
                    <div className="space-y-6">
                        <HeaderProfile
                            customer={customer}
                            tr={tr}
                            actions={
                                <>
                                    <Link href={`/documents/create?entity_type=customer&customer_id=${customer.id}`} className="inline-flex">
                                        <AppButton variant="secondary">
                                            {tr('documents.addDocument', 'Add Document', 'ডকুমেন্ট যোগ করুন')}
                                        </AppButton>
                                    </Link>

                                    {customer.portal_account ? (
                                        <Link href={`/customers/${customer.id}/portal-account/edit`} className="inline-flex">
                                            <AppButton variant="secondary">
                                                {tr('portal.managePortalAccess', 'Manage Portal Access', 'পোর্টাল ম্যানেজ করুন')}
                                            </AppButton>
                                        </Link>
                                    ) : (
                                        <Link href={`/customers/${customer.id}/portal-account/create`} className="inline-flex">
                                            <AppButton variant="secondary">
                                                {tr('portal.createPortalAccount', 'Create Portal Account', 'পোর্টাল অ্যাকাউন্ট তৈরি করুন')}
                                            </AppButton>
                                        </Link>
                                    )}

                                    <Link href="/customers/login" className="inline-flex">
                                        <AppButton variant="outline">
                                            {tr('portal.customerLoginTitle', 'Customer Login', 'গ্রাহক লগইন')}
                                        </AppButton>
                                    </Link>

                                    <Link href={`/customers/${customer.id}/edit`} className="inline-flex">
                                        <AppButton variant="outline">
                                            {tr('customers.editCustomer', 'Edit ', 'সম্পাদনা করুন')}
                                        </AppButton>
                                    </Link>

                                    <AppButton
                                        variant="outline"
                                        onClick={() =>
                                            router.patch(`/customers/${customer.id}/archive`, {}, { preserveScroll: true })
                                        }
                                    >
                                        {customer.status === 'active'
                                            ? tr('customers.archiveCustomer', 'Archive Customer', 'আর্কাইভ করুন')
                                            : tr('customers.activateCustomer', 'Activate Customer', 'সক্রিয় করুন')}
                                    </AppButton>

                                    <AppButton variant="danger" onClick={() => setShowDelete(true)}>
                                        {tr('customers.deleteCustomer', 'Delete Customer', 'গ্রাহক মুছুন')}
                                    </AppButton>
                                </>
                            }
                        />

                        {props.flash?.success ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                                {props.flash.success}
                            </div>
                        ) : null}

                        {props.flash?.error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                {props.flash.error}
                            </div>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SummaryStat
                                label={tr('customers.activeLoanCount', 'Active Loans', 'সক্রিয় লোন')}
                                value={customer.financial_summary?.active_loan_count ?? 0}
                            />
                            <SummaryStat
                                label={tr('customers.totalPaid', 'Total Paid', 'মোট পরিশোধ')}
                                value={formatMoney(customer.financial_summary?.total_paid)}
                            />
                            <SummaryStat
                                label={tr('customers.totalOutstanding', 'Remaining Balance', 'মোট বকেয়া')}
                                value={formatMoney(customer.financial_summary?.remaining_balance)}
                            />
                            <SummaryStat
                                label={tr('customers.overdueAmount', 'Overdue Amount', 'ওভারডিউ বকেয়া')}
                                value={formatMoney(customer.financial_summary?.overdue_amount)}
                            />
                            <SummaryStat
                                label={tr('customers.dueTodayAmount', 'Due Today', 'আজকের দাবি')}
                                value={formatMoney(customer.financial_summary?.due_today_amount)}
                            />
                            <SummaryStat
                                label={tr('customers.nextDueDate', 'Next Due Date', 'পরবর্তী কিস্তির তারিখ')}
                                value={formatDate(customer.financial_summary?.next_due_date)}
                            />
                            <SummaryStat
                                label={tr('customers.openInstallments', 'Open Installments', 'খোলা কিস্তি')}
                                value={customer.financial_summary?.open_installments ?? 0}
                            />
                            <SummaryStat
                                label={tr('portal.portalAccess', 'Portal Access', 'পোর্টাল অ্যাক্সেস')}
                                value={customer.portal_account ? (isBangla ? 'চালু' : 'Enabled') : (isBangla ? 'বন্ধ' : 'Off')}
                            />
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                            <AppCard>
                                <SectionTitle
                                    title={tr('customers.financialSummary', 'Financial Summary', 'আর্থিক সারসংক্ষেপ')}
                                    subtitle={tr('customers.financialSummarySubtitle', "Understand the customer's overall exposure, dues, and repayment position at a glance.", 'এই কাস্টমারের মোট দায়, পরিশোধ এবং বকেয়া এক নজরে বুঝুন।')}
                                />

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <DetailItem label={tr('customers.totalPrincipal', 'Total Principal', 'মোট মূলধন')} value={formatMoney(customer.financial_summary?.total_principal)} />
                                    <DetailItem label={tr('customers.totalPayable', 'Total Payable', 'মোট পরিশোধযোগ্য')} value={formatMoney(customer.financial_summary?.total_payable)} />
                                    <DetailItem label={tr('customers.totalPaid', 'Total Paid', 'মোট পরিশোধ')} value={formatMoney(customer.financial_summary?.total_paid)} />
                                    <DetailItem label={tr('customers.totalOutstanding', 'Remaining Balance', 'মোট বকেয়া')} value={formatMoney(customer.financial_summary?.remaining_balance)} />
                                    <DetailItem label={tr('customers.overdueAmount', 'Overdue Amount', 'ওভারডিউ বকেয়া')} value={formatMoney(customer.financial_summary?.overdue_amount)} />
                                    <DetailItem label={tr('customers.nextDueDate', 'Next Due Date', 'পরবর্তী কিস্তির তারিখ')} value={formatDate(customer.financial_summary?.next_due_date)} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <SectionTitle
                                    title={tr('customers.recentPayments', 'Recent Payments', 'সাম্প্রতিক পেমেন্ট')}
                                    subtitle={tr('customers.recentPaymentsSubtitle', 'Latest collections recorded for this customer.', 'এই কাস্টমারের সর্বশেষ সংগ্রহ করা পেমেন্টগুলো।')}
                                />

                                {customer.recent_payments?.length ? (
                                    <div className="space-y-3">
                                        {customer.recent_payments.map((payment) => (
                                            <div key={payment.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            {payment.payment_code || payment.loan_code}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            {payment.loan_code || '-'} · {formatDate(payment.payment_date)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <AppBadge variant={payment.payment_type === 'full_settlement' ? 'warning' : 'success'}>
                                                            {payment.payment_type === 'full_settlement' ? tr('payments.fullSettlement', 'Full Settlement', 'সম্পূর্ণ পরিশোধ') : tr('payments.regularCollection', 'Regular Collection', 'নিয়মিত সংগ্রহ')}
                                                        </AppBadge>
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoney(payment.amount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={tr('customers.recentPayments', 'Recent Payments', 'সাম্প্রতিক পেমেন্ট')}
                                        description={tr('customers.noPaymentsYet', 'No payment has been recorded for this customer yet.', 'এই কাস্টমারের জন্য এখনো কোনো পেমেন্ট রেকর্ড হয়নি।')}
                                    />
                                )}
                            </AppCard>
                        </div>

                        <AppCard>
                            <SectionTitle title={tr('customers.basicInfo', 'Basic Information', 'মৌলিক তথ্য')} />
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <DetailItem label={tr('customers.name', 'Name', 'নাম')} value={customer.name} />
                                <DetailItem label={tr('customers.phone', 'Phone', 'মোবাইল নম্বর')} value={customer.phone} />
                                <DetailItem label={tr('customers.email', 'Email', 'ইমেইল')} value={customer.email} />
                                <DetailItem label={tr('customers.nidNumber', 'NID Number', 'এনআইডি নম্বর')} value={customer.nid_number} />
                                <DetailItem label={tr('customers.dateOfBirth', 'Date of Birth', 'জন্ম তারিখ')} value={customer.date_of_birth} />
                                <DetailItem
                                    label={tr('customers.gender', 'Gender', 'লিঙ্গ')}
                                    value={customer.gender ? tr(`customers.${customer.gender}`, customer.gender, customer.gender) : '-'}
                                />
                                <DetailItem label={tr('customers.fatherName', 'Father Name', 'পিতার নাম')} value={customer.father_name} />
                                <DetailItem label={tr('customers.motherName', 'Mother Name', 'মাতার নাম')} value={customer.mother_name} />
                                <DetailItem label={tr('customers.spouseName', 'Spouse Name', 'স্বামী/স্ত্রীর নাম')} value={customer.spouse_name} />
                                <DetailItem label={tr('customers.occupation', 'Occupation', 'পেশা')} value={customer.occupation} />
                                <DetailItem
                                    label={tr('common.assignedStaff', 'Assigned Staff', 'দায়িত্বপ্রাপ্ত কর্মকর্তা')}
                                    value={customer.assigned_staff?.name}
                                />
                                <DetailItem
                                    label={tr('customers.status', 'Status', 'স্ট্যাটাস')}
                                    value={customer.status === 'active'
                                        ? tr('customers.active', 'Active', 'সক্রিয়')
                                        : tr('customers.inactive', 'Inactive', 'নিষ্ক্রিয়')}
                                />
                                <DetailItem
                                    label={tr('customers.presentAddress', 'Present Address', 'বর্তমান ঠিকানা')}
                                    value={customer.present_address}
                                    className="xl:col-span-2"
                                />
                                <DetailItem
                                    label={tr('customers.permanentAddress', 'Permanent Address', 'স্থায়ী ঠিকানা')}
                                    value={customer.permanent_address}
                                    className="xl:col-span-2"
                                />
                                <DetailItem
                                    label={tr('customers.notes', 'Notes', 'নোট')}
                                    value={customer.notes}
                                    className="xl:col-span-3"
                                />
                            </div>
                        </AppCard>

                        <AppCard>
                            <SectionTitle
                                title={tr('customers.identityMedia', 'Identity Media', 'ছবি ও পরিচয়পত্র')}
                                subtitle={tr(
                                    'customers.identityMediaSubtitle',
                                    'Upload customer photo and NID front/back with preview and download support.',
                                    'গ্রাহকের ছবি ও এনআইডি সামনের/পেছনের অংশ প্রিভিউ ও ডাউনলোডসহ দেখুন।'
                                )}
                            />

                            <div className="grid gap-5 md:grid-cols-3">
                                <MediaPreviewCard
                                    title={tr('customers.photo', 'Photo', 'ছবি')}
                                    preview={customer.photo_preview}
                                    fallbackUrl={customer.photo_url}
                                    emptyLabel={isBangla ? 'কোনো ছবি আপলোড করা হয়নি' : 'No photo uploaded'}
                                    pdfLabel={isBangla ? 'PDF দেখুন' : 'View PDF'}
                                    imageLabel={isBangla ? 'পূর্ণস্ক্রিন দেখুন' : 'Fullscreen Preview'}
                                    onOpen={() =>
                                        openMedia(
                                            tr('customers.photo', 'Photo', 'ছবি'),
                                            customer.photo_preview,
                                            customer.photo_url
                                        )
                                    }
                                />

                                <MediaPreviewCard
                                    title={tr('customers.nidFront', 'NID Front', 'এনআইডি সামনের অংশ')}
                                    preview={customer.nid_front_preview}
                                    fallbackUrl={customer.nid_front_url}
                                    emptyLabel={isBangla ? 'কোনো এনআইডি ফ্রন্ট আপলোড করা হয়নি' : 'No NID front uploaded'}
                                    pdfLabel={isBangla ? 'PDF দেখুন' : 'View PDF'}
                                    imageLabel={isBangla ? 'পূর্ণস্ক্রিন দেখুন' : 'Fullscreen Preview'}
                                    onOpen={() =>
                                        openMedia(
                                            tr('customers.nidFront', 'NID Front', 'এনআইডি সামনের অংশ'),
                                            customer.nid_front_preview,
                                            customer.nid_front_url
                                        )
                                    }
                                />

                                <MediaPreviewCard
                                    title={tr('customers.nidBack', 'NID Back', 'এনআইডি পেছনের অংশ')}
                                    preview={customer.nid_back_preview}
                                    fallbackUrl={customer.nid_back_url}
                                    emptyLabel={isBangla ? 'কোনো এনআইডি ব্যাক আপলোড করা হয়নি' : 'No NID back uploaded'}
                                    pdfLabel={isBangla ? 'PDF দেখুন' : 'View PDF'}
                                    imageLabel={isBangla ? 'পূর্ণস্ক্রিন দেখুন' : 'Fullscreen Preview'}
                                    onOpen={() =>
                                        openMedia(
                                            tr('customers.nidBack', 'NID Back', 'এনআইডি পেছনের অংশ'),
                                            customer.nid_back_preview,
                                            customer.nid_back_url
                                        )
                                    }
                                />
                            </div>
                        </AppCard>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <AppCard>
                                <SectionTitle
                                    title={tr('portal.portalAccess', 'Portal Access', 'পোর্টাল অ্যাক্সেস')}
                                />

                                {customer.portal_account ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <DetailItem label={tr('portal.loginEmail', 'Login Email', 'লগইন ইমেইল')} value={customer.portal_account.email} />
                                        <DetailItem label={tr('adminUsers.username', 'Username', 'ইউজারনেম')} value={customer.portal_account.username} />
                                        <DetailItem label={tr('customers.phone', 'Phone', 'মোবাইল নম্বর')} value={customer.portal_account.login_phone} />
                                        <DetailItem
                                            label={tr('portal.portalAccessEnabled', 'Portal Status', 'পোর্টাল স্ট্যাটাস')}
                                            value={
                                                customer.portal_account.portal_access_enabled
                                                    ? (isBangla ? 'সক্রিয়' : 'Enabled')
                                                    : (isBangla ? 'নিষ্ক্রিয়' : 'Disabled')
                                            }
                                        />
                                        <DetailItem
                                            label={tr('portal.lastLoginAt', 'Last Login', 'সর্বশেষ লগইন')}
                                            value={customer.portal_account.last_login_at}
                                            className="md:col-span-2"
                                        />
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={tr('portal.noPortalAccount', 'No portal account', 'পোর্টাল অ্যাকাউন্ট নেই')}
                                        description={
                                            isBangla
                                                ? 'এই গ্রাহকের জন্য এখনো কোনো পোর্টাল অ্যাকাউন্ট তৈরি করা হয়নি।'
                                                : 'No portal account has been created for this customer yet.'
                                        }
                                    />
                                )}
                            </AppCard>

                            <AppCard>
                                <SectionTitle
                                    title={tr('customers.recordSummary', 'Record Summary', 'রেকর্ড সারাংশ')}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <DetailItem label={tr('customers.customerCode', 'Customer Code', 'গ্রাহক কোড')} value={customer.customer_code} />
                                    <DetailItem label={tr('customers.createdAt', 'Created At', 'তৈরির সময়')} value={customer.created_at} />
                                    <DetailItem label={tr('customers.updatedAt', 'Updated At', 'সর্বশেষ হালনাগাদ')} value={customer.updated_at} />
                                </div>
                            </AppCard>
                        </div>

                        <AppCard>
                            <SectionTitle
                                title={tr('documents.title', 'Documents', 'ডকুমেন্ট')}
                                subtitle={tr('documents.listSubtitle', 'Attached document list', 'সংযুক্ত ডকুমেন্ট তালিকা')}
                                actions={
                                    <Link href={`/documents/create?entity_type=customer&customer_id=${customer.id}`}>
                                        <AppButton variant="outline">
                                            {tr('documents.addDocument', 'Add Document', 'ডকুমেন্ট যোগ করুন')}
                                        </AppButton>
                                    </Link>
                                }
                            />

                            {customer.documents?.length ? (
                                <div className="space-y-3">
                                    {customer.documents.map((document) => (
                                        <div
                                            key={document.id}
                                            className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {document.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {document.document_code} · {document.document_type}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/documents/${document.id}`}
                                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
                                            >
                                                {tr('documents.viewDocument', 'View Document', 'ডকুমেন্ট দেখুন')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title={tr('documents.emptyTitle', 'No documents found', 'কোনো ডকুমেন্ট নেই')}
                                    description={tr(
                                        'documents.emptyDescription',
                                        'No documents have been added for this customer yet.',
                                        'এই গ্রাহকের জন্য এখনো কোনো ডকুমেন্ট যোগ করা হয়নি।'
                                    )}
                                />
                            )}
                        </AppCard>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <AppCard>
                                <SectionTitle
                                    title={tr('customers.loanPreparation', 'Loan Information', 'ঋণের তথ্য')}
                                    subtitle={tr(
                                        'customers.loanPreparationSubtitle',
                                        'View all loans linked to this customer.',
                                        'এই গ্রাহকের সাথে সম্পর্কিত সব ঋণ দেখুন।'
                                    )}
                                    actions={
                                        <>
                                            <Link href={route('customers.ledger', customer.id)}>
                                                <AppButton variant="outline" size="sm">
                                                    {tr('customers.viewLedger', 'Customer Ledger', 'কাস্টমার লেজার')}
                                                </AppButton>
                                            </Link>
                                            <Link href={`/loans/create?customer_id=${customer.id}`}>
                                                <AppButton size="sm">
                                                    {tr('customers.addLoan', 'Add Loan', 'ঋণ যোগ করুন')}
                                                </AppButton>
                                            </Link>
                                        </>
                                    }
                                />

                                {customer.loans?.length ? (
                                    <div className="space-y-3">
                                        {customer.loans.map((loan) => (
                                            <div key={loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {loan.loan_code}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            {formatDate(loan.start_date)}
                                                        </p>
                                                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                            <DetailItem label={tr('customers.totalPayable', 'Total Payable', 'মোট পরিশোধযোগ্য')} value={formatMoney(loan.total_payable)} />
                                                            <DetailItem label={tr('customers.loanPaid', 'Paid', 'পরিশোধিত')} value={formatMoney(loan.financial_summary?.total_paid)} />
                                                            <DetailItem label={tr('customers.loanOutstanding', 'Outstanding', 'বকেয়া')} value={formatMoney(loan.financial_summary?.remaining_balance)} />
                                                            <DetailItem label={tr('customers.loanNextDue', 'Next Due', 'পরবর্তী দাবি')} value={loan.financial_summary?.next_due_date ? `${formatDate(loan.financial_summary?.next_due_date)} · ${formatMoney(loan.financial_summary?.next_due_amount)}` : tr('customers.noLoanNextDue', 'No unpaid installment left', 'আর কোনো অপরিশোধিত কিস্তি নেই')} />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <AppBadge
                                                            variant={
                                                                loan.status === 'active'
                                                                    ? 'success'
                                                                    : loan.status === 'closed'
                                                                      ? 'default'
                                                                      : 'warning'
                                                            }
                                                        >
                                                            {tr(`loans.${loan.status}`, loan.status, loan.status)}
                                                        </AppBadge>

                                                        <AppBadge variant="default">
                                                            {loan.installment_summary?.open ?? 0} {tr('customers.openInstallments', 'Open Installments', 'খোলা কিস্তি')}
                                                        </AppBadge>

                                                        {loan.status !== 'closed' ? (
                                                            <Link href={`/payments/create?loan_id=${loan.id}&payment_mode=${loan.financial_summary?.next_due_amount > 0 ? 'full_settlement' : 'regular'}`}>
                                                                <AppButton variant="secondary" size="sm">
                                                                    {tr('customers.collectFromLoan', 'Collect Payment', 'পেমেন্ট সংগ্রহ')}
                                                                </AppButton>
                                                            </Link>
                                                        ) : null}

                                                        <Link href={`/loans/${loan.id}`}>
                                                            <AppButton variant="outline" size="sm">
                                                                {tr('customers.viewLoan', 'View Loan', 'ঋণ দেখুন')}
                                                            </AppButton>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={tr('customers.noLoanLinked', 'No linked loan', 'কোনো ঋণ যুক্ত নেই')}
                                        description={tr(
                                            'customers.loanPreparationSubtitle',
                                            'No loan has been created for this customer yet.',
                                            'এই গ্রাহকের জন্য এখনো কোনো ঋণ খোলা হয়নি।'
                                        )}
                                    />
                                )}
                            </AppCard>

                            <AppCard>
                                <SectionTitle
                                    title={tr('customers.guarantorPreparation', 'Guarantor Information', 'জামিনদারের তথ্য')}
                                    subtitle={tr(
                                        'customers.guarantorPreparationSubtitle',
                                        'List of guarantors linked to this customer.',
                                        'গ্রাহকের সাথে যুক্ত জামিনদারদের তালিকা।'
                                    )}
                                    actions={
                                        <Link href={`/guarantors/create?customer_id=${customer.id}`} className="inline-flex">
                                            <AppButton size="sm" className="px-4">
                                                {tr('customers.addGuarantor', 'Add Guarantor', 'জামিনদার যোগ করুন')}
                                            </AppButton>
                                        </Link>
                                    }
                                />

                                {customer.guarantors?.length ? (
                                    <div className="space-y-3">
                                        {customer.guarantors.map((guarantor) => (
                                            <div key={guarantor.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {guarantor.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {guarantor.guarantor_code} • {guarantor.phone}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            {guarantor.relationship || '-'}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>
                                                            {guarantor.status === 'active'
                                                                ? tr('customers.active', 'Active', 'সক্রিয়')
                                                                : tr('customers.inactive', 'Inactive', 'নিষ্ক্রিয়')}
                                                        </AppBadge>

                                                        <Link href={`/guarantors/${guarantor.id}`}>
                                                            <AppButton variant="outline" size="sm">
                                                                {tr('customers.viewGuarantor', 'View Guarantor', 'জামিনদার দেখুন')}
                                                            </AppButton>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={tr('customers.noGuarantorLinked', 'No linked guarantor', 'কোনো জামিনদার যুক্ত নেই')}
                                        description={
                                            customer.guarantor_summary?.note ||
                                            tr(
                                                'customers.guarantorPreparationSubtitle',
                                                'List of guarantors linked to this customer.',
                                                'গ্রাহকের সাথে যুক্ত জামিনদারদের তালিকা।'
                                            )
                                        }
                                    />
                                )}
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>

            <PreviewModal
                open={!!previewMedia}
                media={previewMedia}
                onClose={() => setPreviewMedia(null)}
                tr={tr}
                isBangla={isBangla}
            />

            <ConfirmDeleteModal
                show={showDelete}
                title={tr('customers.deleteCustomer', 'Delete Customer', 'গ্রাহক মুছুন')}
                description={tr(
                    'customers.deleteConfirm',
                    'Are you sure? This action cannot be undone later.',
                    'আপনি কি নিশ্চিত? এই কাজটি পরে ফিরিয়ে আনা যাবে না।'
                )}
                confirmLabel={tr('common.delete', 'Delete', 'মুছুন')}
                onClose={() => setShowDelete(false)}
                onConfirm={() =>
                    router.delete(`/customers/${customer.id}`, {
                        preserveScroll: true,
                        onSuccess: () => setShowDelete(false),
                    })
                }
            />
        </>
    );
}