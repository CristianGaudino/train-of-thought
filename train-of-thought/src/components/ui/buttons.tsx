'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ButtonProps, SIZES, BUTTON_VARIANTS } from '@/lib/definitions';

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
                ${SIZES[size]}
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
