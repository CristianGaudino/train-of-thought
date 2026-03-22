import { EmptyStateProps } from '@/lib/definitions';
import { Button } from './ui/buttons';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center h-48 text-center gap-3 ${className}`}>
            {Icon && <Icon size={36} className="text-zinc-200" />}
            <div className="flex flex-col gap-1">
                <p className="text-[14px] font-primary text-zinc-400">{title}</p>
                {description && (
                    <p className="text-[12px] font-primary text-zinc-300">{description}</p>
                )}
            </div>
            {action && (
                <Button
                    variant="primary"
                    size="md"
                    onClick={action.onClick}
                    icon={action.icon}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
