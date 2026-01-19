import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    text: 'text-red-800',
                    icon: <AlertCircle className="text-red-500" size={20} />,
                    iconBg: 'bg-red-100'
                };
            case 'info':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    text: 'text-blue-800',
                    icon: <Info className="text-blue-500" size={20} />,
                    iconBg: 'bg-blue-100'
                };
            default: // success
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-100',
                    text: 'text-green-800',
                    icon: <CheckCircle className="text-green-500" size={20} />,
                    iconBg: 'bg-green-100'
                };
        }
    };

    const styles = getStyles();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-md"
                >
                    <div className={`${styles.bg} ${styles.border} border rounded-2xl p-4 shadow-xl flex items-center gap-4`}>
                        <div className={`${styles.iconBg} p-2 rounded-xl flex-shrink-0 animate-pulse`}>
                            {styles.icon}
                        </div>
                        <div className="flex-1">
                            <p className={`${styles.text} font-sans text-sm font-semibold leading-tight`}>
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-deep-purple/20 hover:text-deep-purple/40"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
