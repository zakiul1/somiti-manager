import { useMemo } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { FieldHint } from '@/components/forms/field-hint';
import { FormError } from '@/components/forms/form-error';
import { FormGrid } from '@/components/forms/form-grid';
import { FormSection } from '@/components/forms/form-section';
import { useLocale } from '@/hooks/use-locale';

export default function DocumentForm({ mode = 'create', action, documentCode, document = null, customers = [], loans = [], selectedEntity = null }) {
    const { t } = useLocale();

    const form = useForm({
        title: document?.title ?? '',
        document_type: document?.document_type ?? '',
        entity_type: document?.entity_type ?? selectedEntity?.entity_type ?? 'customer',
        customer_id: document?.customer_id ? String(document.customer_id) : selectedEntity?.customer_id ? String(selectedEntity.customer_id) : '',
        loan_id: document?.loan_id ? String(document.loan_id) : selectedEntity?.loan_id ? String(selectedEntity.loan_id) : '',
        issue_date: document?.issue_date ?? '',
        expiry_date: document?.expiry_date ?? '',
        file_reference: document?.file_reference ?? '',
        upload_file: null,
        remove_file: false,
        status: document?.status ?? 'draft',
        notes: document?.notes ?? '',
    });

    const filteredLoans = useMemo(() => {
        if (form.data.entity_type !== 'loan') {
            return [];
        }
        return loans;
    }, [loans, form.data.entity_type]);

    const submit = (event) => {
        event.preventDefault();

        if (mode === 'edit') {
            form.transform((data) => ({ ...data, _method: 'put' })).post(action, {
                forceFormData: true,
                preserveScroll: true,
            });
            return;
        }

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <AppCard>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('documents.documentCode')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{document?.document_code ?? documentCode}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('documents.scope')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{t(`documents.${form.data.entity_type}`)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('documents.storageStatus')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{document?.has_file ? t('documents.fileStored') : t('documents.noFileStored')}</p>
                    </div>
                </div>
            </AppCard>

            <FormSection title={t('documents.basicInfo')} description={t('documents.basicHint')}>
                <FormGrid>
                    <div>
                        <AppLabel htmlFor="title">{t('documents.titleLabel')}</AppLabel>
                        <AppInput id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        <FormError>{form.errors.title}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="document_type">{t('documents.documentType')}</AppLabel>
                        <AppInput id="document_type" value={form.data.document_type} onChange={(e) => form.setData('document_type', e.target.value)} />
                        <FormError>{form.errors.document_type}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="entity_type">{t('documents.linkWith')}</AppLabel>
                        <AppSelect id="entity_type" value={form.data.entity_type} onChange={(e) => form.setData((data) => ({ ...data, entity_type: e.target.value, customer_id: '', loan_id: '' }))}>
                            <option value="customer">{t('documents.customer')}</option>
                            <option value="loan">{t('documents.loan')}</option>
                        </AppSelect>
                        <FormError>{form.errors.entity_type}</FormError>
                    </div>

                    {form.data.entity_type === 'customer' ? (
                        <div>
                            <AppLabel htmlFor="customer_id">{t('documents.customer')}</AppLabel>
                            <AppSelect id="customer_id" value={form.data.customer_id} onChange={(e) => form.setData('customer_id', e.target.value)}>
                                <option value="">{t('documents.selectCustomer')}</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>{customer.name} ({customer.customer_code})</option>
                                ))}
                            </AppSelect>
                            <FormError>{form.errors.customer_id}</FormError>
                        </div>
                    ) : (
                        <div>
                            <AppLabel htmlFor="loan_id">{t('documents.loan')}</AppLabel>
                            <AppSelect id="loan_id" value={form.data.loan_id} onChange={(e) => form.setData('loan_id', e.target.value)}>
                                <option value="">{t('documents.selectLoan')}</option>
                                {filteredLoans.map((loan) => (
                                    <option key={loan.id} value={loan.id}>{loan.loan_code} {loan.customer_name ? `- ${loan.customer_name}` : ''}</option>
                                ))}
                            </AppSelect>
                            <FormError>{form.errors.loan_id}</FormError>
                        </div>
                    )}
                </FormGrid>
            </FormSection>

            <FormSection title={t('documents.lifecycle')} description={t('documents.lifecycleHint')}>
                <FormGrid>
                    <div>
                        <AppLabel htmlFor="issue_date">{t('documents.issueDate')}</AppLabel>
                        <AppInput id="issue_date" type="date" value={form.data.issue_date} onChange={(e) => form.setData('issue_date', e.target.value)} />
                        <FormError>{form.errors.issue_date}</FormError>
                    </div>
                    <div>
                        <AppLabel htmlFor="expiry_date">{t('documents.expiryDate')}</AppLabel>
                        <AppInput id="expiry_date" type="date" value={form.data.expiry_date} onChange={(e) => form.setData('expiry_date', e.target.value)} />
                        <FormError>{form.errors.expiry_date}</FormError>
                    </div>
                    <div>
                        <AppLabel htmlFor="status">{t('documents.status')}</AppLabel>
                        <AppSelect id="status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                            <option value="draft">{t('documents.draft')}</option>
                            <option value="active">{t('documents.active')}</option>
                            <option value="expired">{t('documents.expired')}</option>
                            <option value="archived">{t('documents.archived')}</option>
                        </AppSelect>
                        <FormError>{form.errors.status}</FormError>
                    </div>
                    <div>
                        <AppLabel htmlFor="file_reference">{t('documents.fileReference')}</AppLabel>
                        <AppInput id="file_reference" value={form.data.file_reference} onChange={(e) => form.setData('file_reference', e.target.value)} />
                        <FieldHint>{t('documents.fileReferenceHint')}</FieldHint>
                        <FormError>{form.errors.file_reference}</FormError>
                    </div>
                </FormGrid>
            </FormSection>

            <FormSection title={t('documents.fileUpload')} description={t('documents.fileUploadHint')}>
                <div className="space-y-4">
                    {document?.has_file ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{document.original_file_name ?? t('documents.fileStored')}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{document.mime_type ?? '-'} {document.readable_file_size ? `• ${document.readable_file_size}` : ''}</p>
                            {document.file_url ? (
                                <a href={document.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400">{t('documents.downloadFile')}</a>
                            ) : null}
                        </div>
                    ) : null}

                    <div>
                        <AppLabel htmlFor="upload_file">{t('documents.uploadFile')}</AppLabel>
                        <input
                            id="upload_file"
                            type="file"
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:file:bg-slate-800"
                            onChange={(e) => form.setData('upload_file', e.target.files?.[0] ?? null)}
                        />
                        <FieldHint>{t('documents.uploadAccepted')}</FieldHint>
                        <FormError>{form.errors.upload_file}</FormError>
                    </div>

                    {mode === 'edit' && document?.has_file ? (
                        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={form.data.remove_file}
                                onChange={(e) => form.setData('remove_file', e.target.checked)}
                            />
                            <span>{t('documents.removeExistingFile')}</span>
                        </label>
                    ) : null}
                </div>
            </FormSection>

            <FormSection title={t('documents.notesSection')} description={t('documents.notesHint')}>
                <div>
                    <AppLabel htmlFor="notes">{t('documents.notes')}</AppLabel>
                    <AppTextarea id="notes" rows={5} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                    <FormError>{form.errors.notes}</FormError>
                </div>
            </FormSection>

            <div className="flex flex-wrap items-center gap-3">
                <AppButton type="submit" disabled={form.processing}>
                    {mode === 'edit' ? t('documents.updateDocument') : t('documents.saveDocument')}
                </AppButton>
                <Link href="/documents">
                    <AppButton variant="ghost">{t('common.cancel')}</AppButton>
                </Link>
            </div>
        </form>
    );
}
