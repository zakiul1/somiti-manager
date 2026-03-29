export function TableEmptyRow({ colSpan, title = 'No data found.' }: { colSpan: number; title?: string }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {title}
            </td>
        </tr>
    );
}
