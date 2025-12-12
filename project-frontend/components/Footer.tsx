import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand & Newsletter */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="relative w-4 h-4 
                bg-gray-900 dark:bg-white 
                [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]">
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Aura
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
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
                                    className="p-2 -ml-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-6">
                            Shop
                        </h3>
                        <ul className="space-y-4">
                            {['New Arrivals', 'Best Sellers', 'Clothing', 'Accessories', 'Sale'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-6">
                            Support
                        </h3>
                        <ul className="space-y-4">
                            {['Contact Us', 'Shipping & Returns', 'Size Guide', 'FAQ', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-6">
                            Stay in the loop
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Subscribe to receive exclusive offers, new arrival updates, and styling tips.
                        </p>
                        <form className="relative" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 dark:focus:ring-white/10 focus:border-stone-900 dark:focus:border-white transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-stone-800 dark:hover:bg-gray-200 transition-colors"
                                aria-label="Subscribe"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
                        &copy; {new Date().getFullYear()} Aura Store. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
