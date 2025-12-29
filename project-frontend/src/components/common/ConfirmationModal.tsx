import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Proceed',
    cancelText = 'Cease',
    isDestructive = false,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden border border-stone-100 dark:border-neutral-800"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Status Indicator */}
                        <div className={`h-1.5 w-full ${isDestructive ? "bg-rose-500" : "bg-stone-900 dark:bg-white"}`} />

                        <div className="p-8 md:p-10">
                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 ${isDestructive
                                    ? "bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/30"
                                    : "bg-stone-50 border-stone-100 text-stone-900 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    }`}>
                                    {isDestructive ? <AlertTriangle className="w-10 h-10" /> : <Info className="w-10 h-10" />}
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">
                                        {title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] leading-relaxed max-w-[240px]">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-10">
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`w-full h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl active:scale-95 ${isDestructive
                                        ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                                        : "bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:scale-[1.02] shadow-stone-900/20 dark:shadow-white/10"
                                        }`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-neutral-800 transition-all active:scale-95"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>

                        {/* Close Icon (Top Corner) */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all hover:scale-110 hover:rotate-90 duration-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
