import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { FormError } from '@/components/forms/form-error';
import { FormGrid } from '@/components/forms/form-grid';
import { FormSection } from '@/components/forms/form-section';
import { useLocale } from '@/hooks/use-locale';

const defaults = { customer_id:'', name:'', phone:'', email:'', nid_number:'', date_of_birth:'', gender:'', relationship:'', occupation:'', address:'', status:'active', notes:'', photo:null, nid_front:null, nid_back:null, remove_photo:false, remove_nid_front:false, remove_nid_back:false };

function PreviewCard({ label, file, currentUrl, remove, setRemove, setFile, accept='image/*,.pdf' }) {
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const previewUrl = objectUrl || currentUrl || null;
  const isPdf = previewUrl?.toLowerCase().endsWith('.pdf') || file?.type === 'application/pdf';
  return <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>{currentUrl ? <label className="text-xs"><input type="checkbox" checked={remove} onChange={(e)=>setRemove(e.target.checked)} /> Remove</label> : null}</div><div className="mt-4">{previewUrl ? (isPdf ? <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400">Open current PDF</a> : <img src={previewUrl} alt={label} className="h-40 w-full rounded-xl object-cover" />) : <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No file selected</div>}</div><input className="mt-4 block w-full text-sm" type="file" accept={accept} onChange={(e)=>setFile(e.target.files?.[0] ?? null)} /></div>;
}

export default function GuarantorForm({ mode='create', action, method='post', guarantorCode='Auto generated', guarantor=null, customers=[], selectedCustomer=null }) {
 const { t } = useLocale();
 const form = useForm({ ...defaults, ...guarantor, customer_id: guarantor?.customer_id ?? selectedCustomer?.id ?? '' });
 const submit = (e) => { e.preventDefault(); if (method === 'put' || method === 'patch') { form.transform((data) => ({ ...data, _method: method })).post(action, { forceFormData:true, preserveScroll:true, onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }); return; } form.post(action, { forceFormData:true, preserveScroll:true, onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }); };
 return <form onSubmit={submit} className="space-y-6">
   <FormSection title={t('guarantors.basicInfo')} description={t('guarantors.requiredHint')}>
     <div><AppLabel htmlFor="guarantor_code">{t('guarantors.guarantorCode')}</AppLabel><AppInput id="guarantor_code" value={guarantor?.guarantor_code ?? guarantorCode} disabled /></div>
     <FormGrid>
       <div><AppLabel htmlFor="customer_id">{t('guarantors.customer')}</AppLabel><AppSelect id="customer_id" value={form.data.customer_id} onChange={(e)=>form.setData('customer_id', e.target.value)}><option value="">{t('common.selectOption')}</option>{customers.map((customer)=><option key={customer.id} value={customer.id}>{customer.name} ({customer.customer_code})</option>)}</AppSelect><FormError>{form.errors.customer_id}</FormError></div>
       <div><AppLabel htmlFor="name">{t('guarantors.name')}</AppLabel><AppInput id="name" value={form.data.name} onChange={(e)=>form.setData('name', e.target.value)} /><FormError>{form.errors.name}</FormError></div>
       <div><AppLabel htmlFor="phone">{t('guarantors.phone')}</AppLabel><AppInput id="phone" value={form.data.phone} onChange={(e)=>form.setData('phone', e.target.value)} /><FormError>{form.errors.phone}</FormError></div>
       <div><AppLabel htmlFor="email">{t('guarantors.email')}</AppLabel><AppInput id="email" type="email" value={form.data.email ?? ''} onChange={(e)=>form.setData('email', e.target.value)} /><FormError>{form.errors.email}</FormError></div>
       <div><AppLabel htmlFor="nid_number">{t('guarantors.nidNumber')}</AppLabel><AppInput id="nid_number" value={form.data.nid_number ?? ''} onChange={(e)=>form.setData('nid_number', e.target.value)} /><FormError>{form.errors.nid_number}</FormError></div>
       <div><AppLabel htmlFor="date_of_birth">{t('guarantors.dateOfBirth')}</AppLabel><AppInput id="date_of_birth" type="date" value={form.data.date_of_birth ?? ''} onChange={(e)=>form.setData('date_of_birth', e.target.value)} /><FormError>{form.errors.date_of_birth}</FormError></div>
       <div><AppLabel htmlFor="gender">{t('guarantors.gender')}</AppLabel><AppSelect id="gender" value={form.data.gender ?? ''} onChange={(e)=>form.setData('gender', e.target.value)}><option value="">{t('common.selectOption')}</option><option value="male">{t('guarantors.male')}</option><option value="female">{t('guarantors.female')}</option><option value="other">{t('guarantors.other')}</option></AppSelect><FormError>{form.errors.gender}</FormError></div>
       <div><AppLabel htmlFor="relationship">{t('guarantors.relationship')}</AppLabel><AppInput id="relationship" value={form.data.relationship ?? ''} onChange={(e)=>form.setData('relationship', e.target.value)} /><FormError>{form.errors.relationship}</FormError></div>
       <div><AppLabel htmlFor="occupation">{t('guarantors.occupation')}</AppLabel><AppInput id="occupation" value={form.data.occupation ?? ''} onChange={(e)=>form.setData('occupation', e.target.value)} /><FormError>{form.errors.occupation}</FormError></div>
     </FormGrid>
   </FormSection>
   <FormSection title={t('guarantors.identityMedia')} description={t('guarantors.identityMediaSubtitle')}>
    <div className="grid gap-4 lg:grid-cols-3">
      <PreviewCard label={t('guarantors.photo')} file={form.data.photo} currentUrl={!form.data.remove_photo ? guarantor?.photo_url : null} remove={form.data.remove_photo} setRemove={(v)=>form.setData('remove_photo',v)} setFile={(v)=>form.setData('photo',v)} accept="image/jpeg,image/png" />
      <PreviewCard label={t('guarantors.nidFront')} file={form.data.nid_front} currentUrl={!form.data.remove_nid_front ? guarantor?.nid_front_url : null} remove={form.data.remove_nid_front} setRemove={(v)=>form.setData('remove_nid_front',v)} setFile={(v)=>form.setData('nid_front',v)} accept="image/jpeg,image/png,application/pdf" />
      <PreviewCard label={t('guarantors.nidBack')} file={form.data.nid_back} currentUrl={!form.data.remove_nid_back ? guarantor?.nid_back_url : null} remove={form.data.remove_nid_back} setRemove={(v)=>form.setData('remove_nid_back',v)} setFile={(v)=>form.setData('nid_back',v)} accept="image/jpeg,image/png,application/pdf" />
    </div>
   </FormSection>
   <FormSection title={t('guarantors.connectionInfo')} description={t('guarantors.connectionHint')}>
      <div><AppLabel htmlFor="address">{t('guarantors.address')}</AppLabel><AppTextarea id="address" value={form.data.address ?? ''} onChange={(e)=>form.setData('address', e.target.value)} /><FormError>{form.errors.address}</FormError></div>
      <div><AppLabel htmlFor="status">{t('guarantors.status')}</AppLabel><AppSelect id="status" value={form.data.status} onChange={(e)=>form.setData('status', e.target.value)}><option value="active">{t('guarantors.active')}</option><option value="inactive">{t('guarantors.inactive')}</option></AppSelect><FormError>{form.errors.status}</FormError></div>
      <div><AppLabel htmlFor="notes">{t('guarantors.notes')}</AppLabel><AppTextarea id="notes" value={form.data.notes ?? ''} onChange={(e)=>form.setData('notes', e.target.value)} /><FormError>{form.errors.notes}</FormError></div>
   </FormSection>
   <div className="flex items-center justify-end gap-3"><AppButton type="button" variant="outline" onClick={()=>window.history.back()}>{t('common.cancel')}</AppButton><AppButton type="submit" disabled={form.processing}>{mode === 'edit' ? t('guarantors.updateGuarantor') : t('guarantors.saveGuarantor')}</AppButton></div>
 </form>;
}
