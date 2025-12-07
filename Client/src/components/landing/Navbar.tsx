import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
            {/* Logo Area */}
            <Link to="/" className="z-50">
                <motion.img
                    layoutId="brand-logo"
                    src="/Badge.svg"
                    alt="Book My Workshop"
                    className="h-28 w-auto object-contain"
                />
            </Link>

            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center space-x-12">
                {['Explore', 'Teach', 'Stories'].map((item, index) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="group flex items-center space-x-1 font-sans text-sm font-medium text-deep-purple/80 hover:text-primary-orange transition-colors"
                    >
                        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1">
                            (0{index + 1})
                        </span>
                        <span>{item}</span>
                    </a>
                ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
                <Link
                    to="/login"
                    className="relative overflow-hidden rounded-full bg-deep-purple px-6 py-2.5 font-sans text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
                >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 z-0 bg-primary-orange opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Link>
            </div>

            {/* Mobile Menu Toggle (Placeholder) */}
            <div className="md:hidden">
                <button className="text-deep-purple">Menu</button>
            </div>
        </nav>
    );
};

export default Navbar;
