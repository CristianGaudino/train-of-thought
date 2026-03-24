import { INPUT_VARIANTS, InputProps, SELECT_VARIANTS, SelectProps, TextareaProps } from '@/lib/definitions';
import { forwardRef } from 'react';

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
                    text-[14px] font-primary text-zinc-800
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
                <p className="text-[12px] text-red-400 font-primary mt-1">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    variant = 'default',
    className = '',
    children,
    ...props
}, ref) => {
    return (
        <select
            ref={ref}
            className={`
                font-primary text-zinc-700 outline-none
                transition-colors duration-150 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${SELECT_VARIANTS[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </select>
    );
});

Select.displayName = 'Select';
