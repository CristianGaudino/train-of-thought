export function formatDate(str: string | null): string | null {
    if (!str) return null;
    return new Date(str).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
    });
}