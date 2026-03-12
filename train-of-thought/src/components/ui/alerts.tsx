import { Check, Info, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';

export function ErrorAlert({
    message, 
    dismissable,
    onClose
}: {
    message: string;
    dismissable: boolean;
    onClose?: () => void;
}) {
    const [visible, setVisible] = useState(true);

    const handleDismiss = () => {
        setVisible(false);
        onClose?.();
    };

    if (!visible) return null

    return (        
        <div className="bg-red-100 border-t-4 border-red-400 text-red-700 px-3 py-3 rounded flex items-center space-x-2" role="alert">
            <span className="sr-only">Error</span> 
            <TriangleAlert className='w-5 text-red-500'/> 
            <span className='items-left flex-1 font-medium text-sm'>{message}</span>
            {dismissable && (
                <button onClick={handleDismiss} className="text-red-500 hover:text-red-600">
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

export function InfoAlert({
    message, 
    dismissable,
    onClose
}: {
    message: string;
    dismissable: boolean;
    onClose?: () => void;
}) {
    const [visible, setVisible] = useState(true);

    const handleDismiss = () => {
        setVisible(false);
        onClose?.();
    };

    if (!visible) return null

    return (        
        <div className="bg-teal-100 border-t-4 border-teal-500 text-teal-800 px-3 py-3 rounded flex items-center space-x-2" role="alert">
            <span className="sr-only">Info</span> 
            <Info className='w-5 text-teal-600'/> 
            <span className='items-left flex-1 font-medium text-sm'>{message}</span>
            {dismissable && (
                <button onClick={handleDismiss} className="text-teal-600 hover:text-teal-700">
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

export function SuccessAlert({
    message, 
    dismissable,
    onClose
}: {
    message: string;
    dismissable: boolean;
    onClose?: () => void;
}) {
    const [visible, setVisible] = useState(true);

    const handleDismiss = () => {
        setVisible(false);
        onClose?.();
    };

    if (!visible) return null

    return (        
        <div className="bg-green-100 border-t-4 border-green-500 text-green-700 px-3 py-3 rounded flex items-center space-x-2" role="alert">
            <span className="sr-only">Success</span> 
            <Check className='w-5 text-green-600'/> 
            <span className='items-left flex-1 font-medium text-sm'>{message}</span>
            {dismissable && (
                <button onClick={handleDismiss} className="text-green-600 hover:text-green-700">
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
