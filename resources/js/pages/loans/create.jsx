import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import LoanForm from '@/pages/loans/partials/loan-form';
import { useLocale } from '@/hooks/use-locale';

function BackLink({ label }) {
    return (
        <Link
            href="/loans"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
            <span aria-hidden="true">←</span>
            <span>{label}</span>
        </Link>
    );
}

function PageHero({ title, description, loanCode, selectedCustomer, tr, formTypeLabel, formModeLabel }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white shadow-sm dark:border-slate-800">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-white" />
                        {title}
                    </div>

                    <h1 className="mt-4 break-words text-3xl font-bold tracking-tight">
                        {title}
                    </h1>

                    <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-white/85">
                        {description}
                    </p>

                    {selectedCustomer ? (
                        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                            <span className="font-semibold">
                                {tr('loans.customer', 'Customer', 'গ্রাহক')}:
                            </span>
                            <span className="truncate">
                                {selectedCustomer.name} ({selectedCustomer.customer_code})
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-wide text-white/70">
                            {tr('loans.loanCode', 'Loan Code', 'ঋণ কোড')}
                        </p>
                        <p className="mt-2 text-2xl font-bold">{loanCode}</p>
                    </div>

                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-wide text-white/70">
                            {formTypeLabel}
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                            {formModeLabel}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoansCreate({
    loanCode,
    selectedCustomer,
    customers = [],
    guarantors = [],
    staffOptions = [],
}) {
    const { t, locale } = useLocale();
    const isBangla = locale === 'bn';

    const tr = (key, en, bn) => {
        const value = t(key);
        if (!value || value === key) {
            return isBangla ? bn : en;
        }
        return value;
    };

    const pageTitle = tr('loans.createTitle', 'Add Loan', 'নতুন ঋণ');
    const pageDescription = selectedCustomer
        ? `${tr(
              'loans.createSubtitle',
              'Create a new flat-interest loan for the selected customer.',
              'নির্বাচিত গ্রাহকের জন্য নতুন ফ্ল্যাট-ইন্টারেস্ট ঋণ তৈরি করুন।'
          )} ${selectedCustomer.name} (${selectedCustomer.customer_code})`
        : tr(
              'loans.createSubtitle',
              'Create a new flat-interest loan by selecting customer, staff, terms, and guarantors.',
              'গ্রাহক, দায়িত্বপ্রাপ্ত কর্মকর্তা, শর্ত এবং জামিনদার নির্বাচন করে নতুন ফ্ল্যাট-ইন্টারেস্ট ঋণ তৈরি করুন।'
          );

    return (
        <>
            <Head title={pageTitle} />

            <AppLayout>
                <PageContainer>
                    <div className="space-y-6">
                        <BackLink label={t('common.back')} />

                        <PageHero
                            title={pageTitle}
                            description={pageDescription}
                            loanCode={loanCode}
                            selectedCustomer={selectedCustomer}
                            tr={tr}
                            formTypeLabel={tr('common.formType', 'Form Type', 'ফর্ম ধরন')}
                            formModeLabel={tr('loans.newLoanLabel', 'New Loan', 'নতুন ঋণ')}
                        />

                        <LoanForm
                            mode="create"
                            action="/loans"
                            method="post"
                            loanCode={loanCode}
                            selectedCustomer={selectedCustomer}
                            customers={customers}
                            guarantors={guarantors}
                            staffOptions={staffOptions}
                        />
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
