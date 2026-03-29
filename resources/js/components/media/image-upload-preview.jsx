import { useEffect, useMemo, useState } from 'react';

export default function ImageUploadPreview({
    label, name, currentUrl = null, file = null, onChange, remove, onToggleRemove, helper,
}) {
    const [localUrl, setLocalUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setLocalUrl(null);
            return undefined;
        }
        const objectUrl = URL.createObjectURL(file);
        setLocalUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const previewUrl = useMemo(() => localUrl || currentUrl, [currentUrl, localUrl]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                    {helper ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p> : null}
                </div>
                {currentUrl ? (
                    <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <input type="checkbox" checked={remove} onChange={(e) => onToggleRemove(e.target.checked)} />
                        Remove current file
                    </label>
                ) : null}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                {previewUrl ? <img src={previewUrl} alt={label} className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center bg-slate-50 text-sm text-slate-400 dark:bg-slate-950 dark:text-slate-500">No image selected</div>}
            </div>
            <input className="mt-4 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" name={name} onChange={(e) => onChange(e.target.files?.[0] || null)} />
        </div>
    );
}
