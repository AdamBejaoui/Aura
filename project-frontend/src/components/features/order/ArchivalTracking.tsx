import { motion } from 'framer-motion';
import { Check, Package, ShieldCheck, Truck, Home } from 'lucide-react';

interface ArchivalTrackingProps {
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

const steps = [
    { id: 'pending', label: 'Archive Ready', icon: Package, description: 'Order confirmed' },
    { id: 'confirmed', label: 'Studio Prep', icon: ShieldCheck, description: 'Quality inspection' },
    { id: 'shipped', label: 'In Transit', icon: Truck, description: 'Dispatched from studio' },
    { id: 'delivered', label: 'Delivered', icon: Home, description: 'Arrived at destination' },
];

const ArchivalTracking = ({ status }: ArchivalTrackingProps) => {
    if (status === 'cancelled') {
        return (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
                <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] text-center">Acquisition Terminated</p>
            </div>
        );
    }

    // Map backend status to step index
    const getActiveIndex = () => {
        switch (status) {
            case 'pending': return 0;
            case 'confirmed': return 1;
            case 'shipped': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const activeIndex = getActiveIndex();

    return (
        <div className="mt-8 space-y-8">
            <div className="flex flex-col gap-1">
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.4em]">Archival Path</p>
                <div className="h-px w-full bg-stone-100 dark:bg-neutral-800" />
            </div>

            <div className="relative flex justify-between">
                {/* Progress Line Background */}
                <div className="absolute top-5 left-0 w-full h-[1px] bg-stone-100 dark:bg-neutral-800" />

                {/* Active Progress Line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="absolute top-5 left-0 h-[1px] bg-black dark:bg-white z-10"
                />

                {steps.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-20 flex flex-col items-center group">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                }}
                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 shadow-sm ${isCompleted || isActive
                                        ? 'bg-black border-black dark:bg-white dark:border-white'
                                        : 'bg-white border-stone-200 dark:bg-neutral-900 dark:border-neutral-800'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 text-white dark:text-black" />
                                ) : (
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-stone-300'}`} />
                                )}
                            </motion.div>

                            <div className="absolute top-12 flex flex-col items-center w-max">
                                <p className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-black dark:text-white' : 'text-stone-400'
                                    }`}>
                                    {step.label}
                                </p>
                                {isActive && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[6px] font-bold text-stone-500 uppercase tracking-[0.2em] mt-1"
                                    >
                                        {step.description}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Spacer for absolute positioned text */}
            <div className="h-10" />
        </div>
    );
};

export default ArchivalTracking;
