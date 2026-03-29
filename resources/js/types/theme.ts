import type { AppTheme } from './common';

export type ThemeState = {
    theme: AppTheme;
    toggleTheme: () => void;
};
