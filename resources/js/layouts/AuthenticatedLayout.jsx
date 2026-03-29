import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';

export default function AuthenticatedLayout({ header, children }) {
    return (
        <AppLayout>
            <PageContainer>
                {typeof header === 'string' ? <PageHeader title={header} /> : null}
                {typeof header !== 'string' && header ? <div className="mb-6">{header}</div> : null}
                {children}
            </PageContainer>
        </AppLayout>
    );
}
