import { INPUT_VARIANTS, InputProps, SelectProps, TextareaProps } from '@/lib/definitions';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    error,
    variant = 'default',
    className = '',
    ...props
}, ref) => {
    return (
        <div className={variant === 'default' ? 'w-full' : ''}>
            <input
                ref={ref}
                className={`
                    text-sm font-primary text-zinc-800
                    outline-none transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${INPUT_VARIANTS[variant]}
                    ${error && variant === 'default' ? 'border-red-300 focus:border-red-400' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && variant === 'default' && (
                <p className="text-xs text-red-400 font-primary mt-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            <textarea
                ref={ref}
                className={`
                    w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50
                    text-sm font-primary text-zinc-800
                    outline-none transition-colors duration-150 resize-none leading-relaxed
                    placeholder:text-zinc-400
                    focus:bg-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-zinc-200 focus:border-zinc-400'
                    }
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-400 font-primary mt-1">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export function Select({ value, onChange, options, disabled, className = '' }: SelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-primary text-zinc-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {selected?.icon}
                <span>{selected?.label ?? value}</span>
                <ChevronDown size={12} className={`text-zinc-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-0 min-w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-[300] overflow-hidden py-1">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-primary text-left transition-colors hover:bg-zinc-50 cursor-pointer"
                        >
                            {opt.icon}
                            <span className={`flex-1 ${opt.value === value ? 'text-zinc-900 font-medium' : 'text-zinc-600'}`}>
                                {opt.label}
                            </span>
                            {opt.value === value && <Check size={11} className="text-zinc-400 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
