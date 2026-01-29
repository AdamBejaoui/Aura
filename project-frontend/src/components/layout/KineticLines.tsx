import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function KineticLines() {
    const { scrollYProgress } = useScroll();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 1000]);
    const y2 = useTransform(scrollYProgress, [0, 1], [1000, 0]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.05] dark:opacity-[0.03]">
            <svg className="w-full h-full">
                <motion.line
                    x1="10%" y1={y1} x2="90%" y2={y1}
                    stroke="currentColor" strokeWidth="1"
                    className="text-black dark:text-white"
                />
                <motion.line
                    x1="20%" y1={y2} x2="80%" y2={y2}
                    stroke="currentColor" strokeWidth="1"
                    className="text-black dark:text-white"
                />
                <motion.circle
                    cx="50%" cy={y1} r="200"
                    fill="none" stroke="currentColor" strokeWidth="1"
                    className="text-black dark:text-white"
                />
            </svg>
        </div>
    );
}
