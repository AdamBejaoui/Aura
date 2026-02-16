import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 30,
        filter: 'blur(15px)',
        scale: 0.95
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1], // Aura's signature cinematic ease
            staggerChildren: 0.15
        }
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        filter: 'blur(15px)',
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

const PageTransition = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
