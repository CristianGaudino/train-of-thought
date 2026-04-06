'use client';

import { forwardRef } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { ButtonProps, BUTTON_SIZES, BUTTON_VARIANTS, DashedButtonProps, ToggleButtonProps, SubtleButtonProps } from '@/lib/definitions';

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

export function ToggleButton({
    active,
    icon,
    iconRight,
    children,
    className = '',
    activeClassName   = 'bg-zinc-900 text-white hover:bg-zinc-700',
    inactiveClassName = 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200',
    ...props
}: ToggleButtonProps) {
    return (
        <button
            className={`
                inline-flex items-center justify-center gap-1.5 rounded-lg
                text-xs font-medium font-primary transition-colors duration-150 cursor-pointer
                ${active ? activeClassName : inactiveClassName}
                ${className || 'px-3 py-1.5'}
            `}
            {...props}
        >
            {icon}
            {children}
            {iconRight}
        </button>
    );
}

export function SubtleButton({ icon, children, active, destructive, className = '', ...props }: SubtleButtonProps) {
    return (
        <button
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-medium font-primary text-zinc-600 transition-colors cursor-pointer
                ${active ? 'bg-black/12' : 'bg-black/7 hover:bg-black/12'}
                ${destructive ? 'hover:bg-red-50 hover:text-red-500' : ''}
                ${className}
            `}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}

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
