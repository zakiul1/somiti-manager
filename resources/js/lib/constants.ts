import {
    Bell,
    ClipboardList,
    CreditCard,
    FolderKanban,
    Wallet,
    FileText,
    Handshake,
    Gauge,
    HandCoins,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
    UserCog,
} from 'lucide-react';
import type { NavItem } from '@/types/common';

export const APP_NAME = 'Pachbaria Swapnasiri Foundation';

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Guarantors',
        href: '/guarantors',
        icon: Handshake,
    },
    {
        title: 'Loans',
        href: '/loans',
        icon: HandCoins,
    },
    {
        title: 'Installments',
        href: '/installments',
        icon: CreditCard,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: Wallet,
    },
    {
        title: 'Documents',
        href: '/documents',
        icon: FileText,
    },
    {
        title: 'Contribution Fund',
        href: '/contribution-fund',
        icon: FolderKanban,
        children: [
            { title: 'Contribution Overview', href: '/contribution-fund' },
            { title: 'Monthly Collections', href: '/contribution-fund/months' },
            { title: 'Member Statements', href: '/contribution-fund/members' },
        ],
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Admin Users',
        href: '/admin-users',
        icon: Shield,
        roles: ['super-admin'],
    },
    {
        title: 'Staff Workflow',
        href: '/staff-workflow',
        icon: UserCog,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: Gauge,
    },
    {
        title: 'Audit Logs',
        href: '/audit-logs',
        icon: ClipboardList,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: ['super-admin', 'admin'],
    },
];