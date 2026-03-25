'use client';

import { forwardRef } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { ButtonProps, BUTTON_SIZES, BUTTON_VARIANTS, DashedButtonProps } from '@/lib/definitions';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant  = 'primary',
    size     = 'md',
    loading  = false,
    icon,
    iconRight,
    children,
    className = '',
    disabled,
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-1.5
                font-semibold font-primary transition-colors duration-150
                cursor-pointer disabled:cursor-not-allowed
                ${BUTTON_VARIANTS[variant]}
                ${BUTTON_SIZES[size]}
                ${className}
            `}
            {...props}
        >
            {loading
                ? <Loader2 size={13} className="animate-spin" />
                : icon
            }
            {children}
            {!loading && iconRight}
        </button>
    );
});

Button.displayName = 'Button';
export default Button;

export function DashedButton({ accent, icon, children, className = '', ...props }: DashedButtonProps) {
    return (
        <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-sm text-zinc-300 font-primary w-fit transition-all duration-150 cursor-pointer ${className}`}
            onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = accent;
                el.style.color       = accent;
                el.style.borderStyle = 'solid';
            }}
            onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = '';
                el.style.color       = '';
                el.style.borderStyle = 'dashed';
            }}
            {...props}
        >
            {icon ?? <Plus size={14} />}
            {children}
        </button>
    );
}
