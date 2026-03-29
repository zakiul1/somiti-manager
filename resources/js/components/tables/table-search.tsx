import { Search } from 'lucide-react';
import { AppInput } from '@/components/ui/app-input';

export function TableSearch({ value, onChange, placeholder = 'Search...' }: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <AppInput
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="pl-9"
            />
        </div>
    );
}
