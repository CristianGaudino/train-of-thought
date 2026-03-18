'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ConfirmModalProps } from '@/lib/definitions';

export default function ConfirmModal({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel  = 'Cancel',
    destructive  = false,
    loading      = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    // Focus confirm button on mount, handle Escape
    useEffect(() => {
        confirmRef.current?.focus();
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-5">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 pt-6 pb-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            {destructive && (
                                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle size={16} className="text-red-500" />
                                </div>
                            )}
                            <h2 className="text-[16px] font-semibold text-zinc-900 font-primary">
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer flex-shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Message */}
                    <p className="text-[13px] text-zinc-500 font-primary leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-6 pb-5">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-[13px] font-medium font-primary cursor-pointer hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            flex-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold
                            font-primary cursor-pointer transition-colors disabled:opacity-50
                            disabled:cursor-not-allowed
                            ${destructive
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-zinc-900 hover:bg-zinc-700'
                            }
                        `}
                    >
                        {loading ? 'Deleting…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
