import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20, // Slight slide up
        filter: 'blur(10px)', // Luxe blur effect on enter
        scale: 0.98 // Subtle scale up
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for "cinematic" ease
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -20, // Slide up and out
        filter: 'blur(10px)',
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
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
