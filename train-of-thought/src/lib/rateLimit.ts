const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;      // per window — adjust as needed

export function rateLimit(ip: string): { limited: boolean } {
    const now = Date.now();
    const entry = requests.get(ip);

    if (!entry || now > entry.resetAt) {
        requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { limited: false };
    }

    if (entry.count >= MAX_REQUESTS) {
        return { limited: true };
    }

    entry.count++;
    return { limited: false };
}