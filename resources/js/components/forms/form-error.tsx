export function FormError({ children }: { children?: React.ReactNode }) {
    if (!children) return null;
    return <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{children}</p>;
}
