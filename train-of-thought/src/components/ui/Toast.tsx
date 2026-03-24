'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
    type ReactNode,
} from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id:       string;
    type:     ToastType;
    title:    string;
    message?: string;
    duration?: number; // ms, default 3500
}

interface ToastContextValue {
    toast:   (options: Omit<Toast, 'id'>) => void;
    success: (title: string, message?: string) => void;
    error:   (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info:    (title: string, message?: string) => void;
    dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Config ───────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, {
    icon:      React.ComponentType<{ size?: number; className?: string }>;
    iconClass: string;
    barClass:  string;
}> = {
    success: {
        icon:      CheckCircle,
        iconClass: 'text-emerald-500',
        barClass:  'bg-emerald-500',
    },
    error: {
        icon:      XCircle,
        iconClass: 'text-red-500',
        barClass:  'bg-red-500',
    },
    warning: {
        icon:      AlertTriangle,
        iconClass: 'text-amber-500',
        barClass:  'bg-amber-500',
    },
    info: {
        icon:      Info,
        iconClass: 'text-blue-500',
        barClass:  'bg-blue-500',
    },
};

// ─── Individual Toast item ────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [visible, setVisible] = useState(false);
    const cfg      = TOAST_CONFIG[toast.type];
    const Icon     = cfg.icon;
    const duration = toast.duration ?? 3500;

    // Animate in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    // Auto dismiss
    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, duration);
        return () => clearTimeout(t);
    }, [duration, toast.id, onDismiss]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className="relative w-80 bg-white rounded-2xl shadow-lg border border-zinc-100 overflow-hidden transition-all duration-300"
            style={{
                opacity:   visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
            }}
        >
            {/* Progress bar */}
            <div
                className={`absolute top-0 left-0 h-0.5 ${cfg.barClass}`}
                style={{
                    width:      '100%',
                    animation:  `toastProgress ${duration}ms linear forwards`,
                }}
            />

            <div className="flex items-start gap-3 px-4 py-3.5">
                <Icon size={18} className={`${cfg.iconClass} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 font-primary leading-snug">
                        {toast.title}
                    </p>
                    {toast.message && (
                        <p className="text-xs text-zinc-400 font-primary mt-0.5 leading-relaxed">
                            {toast.message}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counter             = useRef(0);

    const dismiss = useCallback((id: string) => {
        setToasts(ts => ts.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((options: Omit<Toast, 'id'>) => {
        const id = `toast-${++counter.current}`;
        setToasts(ts => [...ts, { ...options, id }]);
    }, []);

    const success = useCallback((title: string, message?: string) => {
        toast({ type: 'success', title, message });
    }, [toast]);

    const error = useCallback((title: string, message?: string) => {
        toast({ type: 'error', title, message, duration: 5000 });
    }, [toast]);

    const warning = useCallback((title: string, message?: string) => {
        toast({ type: 'warning', title, message });
    }, [toast]);

    const info = useCallback((title: string, message?: string) => {
        toast({ type: 'info', title, message });
    }, [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
            {children}

            {/* Toast container — bottom right */}
            <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-2 items-end pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes toastProgress {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}
