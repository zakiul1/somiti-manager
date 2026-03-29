import type { NavItem } from './common';

export type SidebarNavItem = NavItem & {
    roles?: string[];
};
