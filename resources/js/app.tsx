import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { AppPreferencesProvider } from '@/providers/app-preferences-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Pachbaria Swapnasiri Foundation';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.{jsx,tsx}');
        return resolvePageComponent(`./pages/${name}.jsx`, pages).catch(() =>
            resolvePageComponent(`./pages/${name}.tsx`, pages),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const appProps = props.initialPage?.props?.app ?? {};

        root.render(
            <AppPreferencesProvider
                initialLocale={appProps.locale ?? 'en'}
                initialTheme={appProps.theme ?? 'light'}
            >
                <App {...props} />
            </AppPreferencesProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});