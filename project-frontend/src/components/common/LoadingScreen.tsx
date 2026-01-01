import React from 'react';
import { motion } from 'framer-motion';
import Plasma from '../ui/Plasma';
import { useThemeStore } from '../../store/themeStore';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Syncing with Archives..." }) => {
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-700">
            {/* Ambient Background - Disabled on mobile for performance */}
            <div className="absolute inset-0 pointer-events-none opacity-40 hidden md:block">
                <Plasma
                    color={isDark ? '#ffffff' : '#000000'}
                    speed={0.4}
                    direction="forward"
                    scale={1.5}
                    opacity={isDark ? 0.2 : 0.15}
                    mouseInteractive={false}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Minimalist Aura Star Animation */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 180, 270, 360],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-12 h-12 bg-stone-900 dark:bg-white [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]"
                    />
                    {/* Shadow/Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-stone-900 dark:bg-white blur-xl -z-10"
                    />
                </div>

                {/* Typography */}
                <div className="flex flex-col items-center space-y-3">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-900 dark:text-white"
                    >
                        Aura
                    </motion.span>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.5, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        className="text-[8px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500"
                    >
                        {message}
                    </motion.p>
                </div>
            </div>

            {/* Progress line at the bottom */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-stone-100 dark:bg-neutral-900 overflow-hidden">
                <motion.div
                    animate={{
                        x: ['-100%', '100%']
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-1/3 h-full bg-gradient-to-r from-transparent via-stone-400 dark:via-stone-500 to-transparent"
                />
            </div>
        </div>
    );
};

export default LoadingScreen;
