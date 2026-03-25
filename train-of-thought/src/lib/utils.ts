export function formatDate(str: string | null): string | null {
    if (!str) return null;
    return new Date(str).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
    });
}

export function timeAgo(date: Date): string {
    const now   = Date.now();
    const diff  = now - date.getTime(); // ms
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);

    if (diff < 60_000)   return 'just now';
    if (mins  < 60)      return `${mins}m ago`;
    if (hours < 24)      return `${hours}h ago`;
    if (days  === 1)     return 'yesterday';
    if (days  < 7)       return `${days} days ago`;

    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString('en-GB', {
        day:   'numeric',
        month: 'short',
        ...(sameYear ? {} : { year: 'numeric' }),
    });
}