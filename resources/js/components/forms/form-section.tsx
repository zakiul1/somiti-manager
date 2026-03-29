import { AppDivider } from '@/components/ui/app-divider';

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
            </div>
            <AppDivider />
            <div className="space-y-4">{children}</div>
        </section>
    );
}
