import { PropsWithChildren, useState } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { AppToast } from '@/components/feedback/app-toast';

export default function AppLayout({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <AppToast />
            <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="flex min-h-screen">
                <AppSidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <AppTopbar onMenuClick={() => setMobileOpen(true)} />
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
