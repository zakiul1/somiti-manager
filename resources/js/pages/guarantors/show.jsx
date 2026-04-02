import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppBadge } from '@/components/ui/app-badge';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { EmptyState } from '@/components/feedback/empty-state';
import { useLocale } from '@/hooks/use-locale';

function SectionTitle({ title, subtitle = null, actions = null }) {
    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </h2>
                {subtitle ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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

function MediaPreviewCard({ title, url, emptyLabel, pdfLabel }) {
    const isPdf = url?.toLowerCase().endsWith('.pdf');

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
                        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                            >
                                {pdfLabel}
                            </a>
                        </div>
                    ) : (
                        <img
                            src={url}
                            alt={title}
                            className="h-48 w-full rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                        />
                    )
                ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        {emptyLabel}
                    </div>
                )}
            </div>
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

function GuarantorProfileCard({ guarantor, t, isBangla }) {
    return (
        <AppCard>
            <div className="flex flex-col items-center text-center">
                {guarantor.photo_url ? (
                    <img
                        src={guarantor.photo_url}
                        alt={guarantor.name}
                        className="h-28 w-28 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-800"
                    />
                ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-3xl font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {(guarantor.name || 'G').charAt(0).toUpperCase()}
                    </div>
                )}

                <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {guarantor.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {guarantor.guarantor_code}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>
                        {guarantor.status === 'active'
                            ? (t('guarantors.active') || (isBangla ? 'সক্রিয়' : 'Active'))
                            : (t('guarantors.inactive') || (isBangla ? 'নিষ্ক্রিয়' : 'Inactive'))}
                    </AppBadge>

                    {guarantor.relationship ? (
                        <AppBadge variant="default">{guarantor.relationship}</AppBadge>
                    ) : null}
                </div>
            </div>
        </AppCard>
    );
}

export default function GuarantorsShow({ guarantor }) {
    const { t, locale } = useLocale();
    const { props } = usePage();
    const [showDelete, setShowDelete] = useState(false);
    const isBangla = locale === 'bn';

    return (
        <>
            <Head title={guarantor.name} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={guarantor.name}
                        description={
                            t('guarantors.recordSummarySubtitle') ||
                            (isBangla
                                ? 'জামিনদারের পূর্ণ প্রোফাইল, যুক্ত গ্রাহক, ডকুমেন্ট এবং ঋণ সংযোগ এক জায়গায় দেখুন।'
                                : 'View the full guarantor profile, linked customer, documents, and loan connections in one place.')
                        }
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>
                                    {guarantor.status === 'active'
                                        ? (t('guarantors.active') || (isBangla ? 'সক্রিয়' : 'Active'))
                                        : (t('guarantors.inactive') || (isBangla ? 'নিষ্ক্রিয়' : 'Inactive'))}
                                </AppBadge>

                                <Link href={`/guarantors/${guarantor.id}/edit`}>
                                    <AppButton variant="outline">
                                        {t('guarantors.editGuarantor') || (isBangla ? 'সম্পাদনা করুন' : 'Edit Guarantor')}
                                    </AppButton>
                                </Link>

                                <AppButton
                                    variant="secondary"
                                    onClick={() =>
                                        router.patch(`/guarantors/${guarantor.id}/archive`, {}, { preserveScroll: true })
                                    }
                                >
                                    {guarantor.status === 'active'
                                        ? (t('guarantors.archiveGuarantor') || (isBangla ? 'আর্কাইভ করুন' : 'Archive Guarantor'))
                                        : (t('guarantors.activateGuarantor') || (isBangla ? 'সক্রিয় করুন' : 'Activate Guarantor'))}
                                </AppButton>

                                <AppButton variant="danger" onClick={() => setShowDelete(true)}>
                                    {t('guarantors.deleteGuarantor') || (isBangla ? 'জামিনদার মুছুন' : 'Delete Guarantor')}
                                </AppButton>
                            </div>
                        }
                    />

                    {props.flash?.success ? (
                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {props.flash.success}
                        </div>
                    ) : null}

                    {props.flash?.error ? (
                        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                            {props.flash.error}
                        </div>
                    ) : null}

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <SummaryStat
                            label={t('guarantors.loanConnections') || (isBangla ? 'ঋণ সংযোগ' : 'Loan Links')}
                            value={guarantor.loans?.length ?? 0}
                        />
                        <SummaryStat
                            label={t('guarantors.customer') || (isBangla ? 'গ্রাহক' : 'Customer')}
                            value={guarantor.customer ? 1 : 0}
                        />
                        <SummaryStat
                            label={t('guarantors.photo') || (isBangla ? 'ছবি' : 'Photo')}
                            value={guarantor.photo_path ? (isBangla ? 'আছে' : 'Ready') : (isBangla ? 'নেই' : 'Missing')}
                        />
                        <SummaryStat
                            label={t('guarantors.status') || (isBangla ? 'স্ট্যাটাস' : 'Status')}
                            value={guarantor.status === 'active' ? (isBangla ? 'সক্রিয়' : 'Active') : (isBangla ? 'নিষ্ক্রিয়' : 'Inactive')}
                        />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <SectionTitle
                                    title={t('guarantors.basicInfo') || (isBangla ? 'মৌলিক তথ্য' : 'Basic Information')}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <DetailItem label={t('guarantors.name') || (isBangla ? 'নাম' : 'Name')} value={guarantor.name} />
                                    <DetailItem label={t('guarantors.phone') || (isBangla ? 'মোবাইল নম্বর' : 'Phone')} value={guarantor.phone} />
                                    <DetailItem label={t('guarantors.email') || (isBangla ? 'ইমেইল' : 'Email')} value={guarantor.email} />
                                    <DetailItem label={t('guarantors.nidNumber') || (isBangla ? 'এনআইডি নম্বর' : 'NID Number')} value={guarantor.nid_number} />
                                    <DetailItem label={t('guarantors.dateOfBirth') || (isBangla ? 'জন্ম তারিখ' : 'Date of Birth')} value={guarantor.date_of_birth} />
                                    <DetailItem
                                        label={t('guarantors.gender') || (isBangla ? 'লিঙ্গ' : 'Gender')}
                                        value={guarantor.gender ? (t(`guarantors.${guarantor.gender}`) || guarantor.gender) : '-'}
                                    />
                                    <DetailItem label={t('guarantors.occupation') || (isBangla ? 'পেশা' : 'Occupation')} value={guarantor.occupation} />
                                    <DetailItem
                                        label={t('guarantors.status') || (isBangla ? 'স্ট্যাটাস' : 'Status')}
                                        value={guarantor.status === 'active'
                                            ? (t('guarantors.active') || (isBangla ? 'সক্রিয়' : 'Active'))
                                            : (t('guarantors.inactive') || (isBangla ? 'নিষ্ক্রিয়' : 'Inactive'))}
                                    />
                                </div>
                            </AppCard>

                            <AppCard>
                                <SectionTitle
                                    title={t('guarantors.connectionInfo') || (isBangla ? 'সংযোগের তথ্য' : 'Connection Information')}
                                    subtitle={t('guarantors.connectionHint') || (isBangla
                                        ? 'গ্রাহকের সাথে সম্পর্ক, ঠিকানা এবং অন্যান্য নোট এখানে দেখানো হয়েছে।'
                                        : 'Customer relationship, address, and extra notes are shown here.')}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <DetailItem label={t('guarantors.relationship') || (isBangla ? 'সম্পর্ক' : 'Relationship')} value={guarantor.relationship} />
                                    <DetailItem
                                        label={t('guarantors.customer') || (isBangla ? 'গ্রাহক' : 'Customer')}
                                        value={guarantor.customer ? `${guarantor.customer.name} (${guarantor.customer.customer_code})` : '-'}
                                    />
                                    <DetailItem
                                        label={t('guarantors.address') || (isBangla ? 'ঠিকানা' : 'Address')}
                                        value={guarantor.address}
                                        className="md:col-span-2"
                                    />
                                    <DetailItem
                                        label={t('guarantors.notes') || (isBangla ? 'নোট' : 'Notes')}
                                        value={guarantor.notes}
                                        className="md:col-span-2"
                                    />
                                </div>
                            </AppCard>

                            <AppCard>
                                <SectionTitle
                                    title={t('guarantors.identityMedia') || (isBangla ? 'ছবি ও পরিচয়পত্র' : 'Photo & Identity Documents')}
                                    subtitle={t('guarantors.identityMediaSubtitle') || (isBangla
                                        ? 'জামিনদারের ছবি ও এনআইডি ডকুমেন্ট এখানে দেখা যাবে।'
                                        : 'Guarantor photo and identity documents are shown here.')}
                                />

                                <div className="grid gap-5 md:grid-cols-3">
                                    <MediaPreviewCard
                                        title={t('guarantors.photo') || (isBangla ? 'জামিনদারের ছবি' : 'Guarantor Photo')}
                                        url={guarantor.photo_url}
                                        emptyLabel={isBangla ? 'কোনো ছবি আপলোড করা হয়নি' : 'No photo uploaded'}
                                        pdfLabel={isBangla ? 'PDF খুলুন' : 'Open PDF'}
                                    />

                                    <MediaPreviewCard
                                        title={t('guarantors.nidFront') || (isBangla ? 'এনআইডি সামনের অংশ' : 'NID Front')}
                                        url={guarantor.nid_front_url}
                                        emptyLabel={isBangla ? 'কোনো এনআইডি ফ্রন্ট আপলোড করা হয়নি' : 'No NID front uploaded'}
                                        pdfLabel={isBangla ? 'PDF খুলুন' : 'Open PDF'}
                                    />

                                    <MediaPreviewCard
                                        title={t('guarantors.nidBack') || (isBangla ? 'এনআইডি পেছনের অংশ' : 'NID Back')}
                                        url={guarantor.nid_back_url}
                                        emptyLabel={isBangla ? 'কোনো এনআইডি ব্যাক আপলোড করা হয়নি' : 'No NID back uploaded'}
                                        pdfLabel={isBangla ? 'PDF খুলুন' : 'Open PDF'}
                                    />
                                </div>
                            </AppCard>

                            <AppCard>
                                <SectionTitle
                                    title={t('guarantors.loanConnections') || (isBangla ? 'ঋণ সংযোগ' : 'Loan Connections')}
                                    subtitle={t('guarantors.loanConnectionsSubtitle') || (isBangla
                                        ? 'যেসব ঋণের সাথে এই জামিনদার যুক্ত আছে, সেগুলো এখানে দেখা যাবে।'
                                        : 'Loans linked with this guarantor are shown here.')}
                                />

                                {guarantor.loans?.length ? (
                                    <div className="space-y-3">
                                        {guarantor.loans.map((loan) => (
                                            <div key={loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {loan.loan_code}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {loan.start_date} • {loan.principal_amount} / {loan.total_payable}
                                                        </p>
                                                    </div>

                                                    <Link href={`/loans/${loan.id}`}>
                                                        <AppButton variant="outline" size="sm">
                                                            {t('guarantors.viewLoan') || (isBangla ? 'ঋণ দেখুন' : 'View Loan')}
                                                        </AppButton>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={t('guarantors.noLoansLinked') || (isBangla ? 'কোনো ঋণ সংযুক্ত নেই' : 'No linked loans')}
                                        description={t('guarantors.loanConnectionsSubtitle') || (isBangla ? 'এই জামিনদারের সাথে এখনো কোনো ঋণ যুক্ত হয়নি।' : 'No loans are linked to this guarantor yet.')}
                                    />
                                )}
                            </AppCard>
                        </div>

                        <div className="space-y-6">
                            <GuarantorProfileCard guarantor={guarantor} t={t} isBangla={isBangla} />

                            <AppCard>
                                <SectionTitle
                                    title={t('guarantors.recordSummary') || (isBangla ? 'রেকর্ড সারাংশ' : 'Record Summary')}
                                />
                                <div className="space-y-4">
                                    <DetailItem label={t('guarantors.guarantorCode') || (isBangla ? 'জামিনদার কোড' : 'Guarantor Code')} value={guarantor.guarantor_code} />
                                    <DetailItem label={t('guarantors.createdAt') || (isBangla ? 'তৈরির সময়' : 'Created At')} value={guarantor.created_at} />
                                    <DetailItem label={t('guarantors.updatedAt') || (isBangla ? 'সর্বশেষ হালনাগাদ' : 'Updated At')} value={guarantor.updated_at} />

                                    {guarantor.customer ? (
                                        <Link href={`/customers/${guarantor.customer.id}`} className="inline-flex">
                                            <AppButton variant="outline">
                                                {t('guarantors.viewCustomer') || (isBangla ? 'গ্রাহক দেখুন' : 'View Customer')}
                                            </AppButton>
                                        </Link>
                                    ) : null}
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>

            <ConfirmDeleteModal
                show={showDelete}
                title={t('guarantors.deleteGuarantor') || (isBangla ? 'জামিনদার মুছুন' : 'Delete Guarantor')}
                description={t('guarantors.deleteConfirm') || (isBangla ? 'আপনি কি নিশ্চিত? এই কাজটি পরে ফিরিয়ে আনা যাবে না।' : 'Are you sure? This action cannot be undone later.')}
                confirmLabel={t('common.delete') || (isBangla ? 'মুছুন' : 'Delete')}
                onClose={() => setShowDelete(false)}
                onConfirm={() =>
                    router.delete(`/guarantors/${guarantor.id}`, {
                        preserveScroll: true,
                        onSuccess: () => setShowDelete(false),
                    })
                }
            />
        </>
    );
}