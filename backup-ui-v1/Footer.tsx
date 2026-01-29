import { Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="bg-white dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand & Newsletter */}
                    <div className="space-y-6 lg:col-span-1">
                        <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => {
                                if (window.location.pathname === '/') {
                                    window.location.reload();
                                } else {
                                    navigate('/');
                                }
                            }}
                        >
                            <div className="relative w-4.5 h-4.5 
                bg-black dark:bg-white 
                [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)] group-hover:scale-110 transition-transform">
                            </div>
                            <span className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">
                                Aura
                            </span>
                        </div>
                        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-xs">
                            Elevating your everyday wardrobe with timeless pieces designed for the modern individual.
                        </p>

                        {/* Socials */}
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Instagram, label: 'Instagram' },
                                { icon: Twitter, label: 'Twitter' },
                                { icon: Facebook, label: 'Facebook' },
                                { icon: Youtube, label: 'Youtube' },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    className="p-2 -ml-2 rounded-full text-stone-400 hover:text-black dark:text-stone-500 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-neutral-800 transition-all font-medium"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="relative">
                        {/* Vertical Architect Line */}
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: '100%' }}
                            transition={{ duration: 1.5 }}
                            className="absolute -left-4 top-0 w-[1px] bg-stone-100 dark:bg-neutral-800 hidden lg:block"
                        />
                        <h3 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em] mb-8">
                            Shop
                        </h3>
                        <ul className="space-y-4">
                            {['New Arrivals', 'Best Sellers', 'Clothing', 'Accessories', 'Sale'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em] mb-8">
                            Support
                        </h3>
                        <ul className="space-y-4">
                            {['Contact Us', 'Shipping & Returns', 'Size Guide', 'FAQ', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-1">
                        <h3 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em] mb-8">
                            Stay in the loop
                        </h3>
                        <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-6 uppercase tracking-widest leading-relaxed">
                            Subscribe to receive exclusive offers, new arrival updates, and styling tips.
                        </p>
                        <form className="relative" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="ENTER EMAIL"
                                className="w-full pl-4 pr-12 py-3.5 bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-700 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all text-black dark:text-white placeholder-stone-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-all"
                                aria-label="Subscribe"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-24 pt-8 border-t border-stone-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 2 }}
                        className="absolute top-0 left-0 h-[1px] bg-black dark:bg-white"
                    />
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center md:text-left">
                        &copy; {new Date().getFullYear()} Aura Project. Engineered for Excellence.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[9px] font-black text-stone-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">Privacy</a>
                        <a href="#" className="text-[9px] font-black text-stone-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">Terms</a>
                        <a href="#" className="text-[9px] font-black text-stone-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
