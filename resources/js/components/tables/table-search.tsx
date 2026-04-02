import { Search } from 'lucide-react';
import { AppInput } from '@/components/ui/app-input';
import { useLocale } from '@/hooks/use-locale';

export function TableSearch({ value, onChange, placeholder }: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}) {
    const { t } = useLocale();

    return (
        <div className="relative w-full max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <AppInput
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder ?? t('common.search')}
                className="pl-9"
            />
        </div>
    );
}
