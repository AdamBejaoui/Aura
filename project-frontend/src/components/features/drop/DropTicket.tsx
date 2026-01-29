import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { QrCode, Ticket, Check } from 'lucide-react';
import { toast } from 'sonner';

const DropTicket = () => {
    const [claimed, setClaimed] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Holographic Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    // Calculate time until next drop (Fixed date for demo + 3 days)
    useEffect(() => {
        const dropDate = new Date();
        dropDate.setDate(dropDate.getDate() + 3); // 3 days from now
        dropDate.setHours(20, 0, 0, 0); // 8 PM

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = dropDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        // Check local storage for claim status
        const isClaimed = localStorage.getItem('aura_drop_claimed');
        if (isClaimed) setClaimed(true);

        return () => clearInterval(timer);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = (mouseX / width - 0.5) * 200;
        const yPct = (mouseY / height - 0.5) * 200;
        x.set(xPct);
        y.set(yPct);
    };

    const handleClaim = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (claimed) return;

        setClaimed(true);
        localStorage.setItem('aura_drop_claimed', 'true');
        toast.success("Access Granted. You're on the list.");
    };

    return (
        <section className="py-24 px-4 overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-4 animate-pulse">Incoming Drop</span>
                    <h2 className="text-4xl md:text-6xl font-black text-center text-black dark:text-white uppercase tracking-tighter">
                        Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-400 to-stone-600">Onyx</span>
                    </h2>
                </div>

                <motion.div
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => { x.set(0); y.set(0); }}
                    className="relative group cursor-default perspective-1000"
                >
                    {/* Ticket Container */}
                    <div className="relative flex flex-col md:flex-row bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">

                        {/* Holographic Sheen Layer */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shine z-10" />

                        {/* LEFT: Main Ticket Info */}
                        <div className="flex-1 p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-dashed border-stone-300 dark:border-white/20">
                            {/* Decorative Cutouts */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-black rounded-full" />
                            <div className="absolute -right-3 md:-right-3 top-full md:top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-black rounded-full z-20" />

                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Event</span>
                                    <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">Early Access</h3>
                                </div>
                                <Ticket className="w-8 h-8 text-stone-300 dark:text-white/20" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 block mb-1">Date</span>
                                    <span className="text-sm font-bold text-black dark:text-white">Oct 24</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 block mb-1">Time</span>
                                    <span className="text-sm font-bold text-black dark:text-white">20:00 EST</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 block mb-1">Location</span>
                                    <span className="text-sm font-bold text-black dark:text-white">Aura Archive App</span>
                                </div>
                            </div>

                            {/* Countdown */}
                            <div className="flex gap-4">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="text-center">
                                        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 min-w-[60px] border border-black/5 dark:border-white/10">
                                            <span className="block text-xl font-black text-black dark:text-white font-mono">
                                                {String(value).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <span className="text-[8px] uppercase font-bold text-stone-400 mt-1 block">{unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Stub / Action */}
                        <div className="w-full md:w-64 bg-black/5 dark:bg-white/5 p-8 flex flex-col items-center justify-center relative">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-black rounded-full z-20 hidden md:block" />

                            <div className="mb-6 opacity-50">
                                <QrCode className="w-24 h-24 text-black dark:text-white" />
                            </div>

                            <button
                                onClick={handleClaim}
                                disabled={claimed}
                                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${claimed
                                    ? 'bg-green-500 text-black cursor-default'
                                    : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95'}`}
                            >
                                {claimed ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> Claimed
                                    </span>
                                ) : (
                                    'Claim Ticket'
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default DropTicket;
