export type AppTheme = 'light' | 'dark';

export type AppLocale = 'en' | 'bn';

export type NavItem = {
    title: string;
    href: string;
    icon?: React.ElementType;
    roles?: string[];
    children?: NavItem[];
};
