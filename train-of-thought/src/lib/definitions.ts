import { LucideIcon } from "lucide-react";

// Constants
export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
    primary:     'bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50',
    secondary:   'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50',
    destructive: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
    ghost:       'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-40',
};

export const SIZES: Record<Size, string> = {
    sm:  'px-3 py-1.5 text-[12px] rounded-lg',
    md:  'px-4 py-2 text-[13px] rounded-xl',
    lg:  'px-5 py-2.5 text-[13px] rounded-xl',
};

export const SELECT_VARIANTS: Record<SelectVariant, string> = {
    default: 'px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-[14px] focus:border-zinc-400 focus:bg-white',
    pill:    'px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[12px] hover:border-zinc-300',
};

// Types
export type Mode = 'idle' | 'explore';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

export type Size = 'sm' | 'md' | 'lg';

export type SelectVariant = 'default' | 'pill';

// Interfaces

export interface Segment<T extends string> {
    value: T;
    label: string;
}

// Props

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:  ButtonVariant;
    size?:     Size;
    loading?:  boolean;
    icon?:     React.ReactNode;
    iconRight?: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    variant?: SelectVariant;
}

export interface SegmentedControlProps<T extends string> {
    segments:  Segment<T>[];
    value:     T;
    onChange:  (value: T) => void;
    className?: string;
}

export interface SkeletonProps {
    height?:    string; // e.g. 'h-4', 'h-14', 'h-48'
    width?:     string; // e.g. 'w-full', 'w-64', 'w-3/4'
    rounded?:   string; // e.g. 'rounded-lg', 'rounded-2xl'
    className?: string;
}

export interface ConfirmModalProps {
    title:       string;
    message:     string;
    confirmLabel?: string;
    cancelLabel?:  string;
    destructive?:  boolean;
    loading?:      boolean;
    onConfirm:   () => void;
    onCancel:    () => void;
}

export interface EmptyStateProps {
    icon?:        LucideIcon;
    title:        string;
    description?: string;
    action?:      {
        label:   string;
        onClick: () => void;
        icon?:   React.ReactNode;
    };
    className?: string;
}