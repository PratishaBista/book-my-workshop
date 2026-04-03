import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HostNavbar: React.FC = () => {
    const navItems = [
        { label: 'Overview', link: '#overview' },
        { label: 'Awards', link: '#awards' },
        { label: 'Testimonials', link: '#testimonials' },
        { label: 'Features', link: '#features' },
        { label: 'Mission', link: '#mission' },
        { label: 'Contact', link: '#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="px-8 py-4 flex items-center justify-between">
                <Link to="/" className="z-50 flex items-center gap-2">
                    <motion.img
                        layoutId="brand-logo"
                        src="/Badge.svg"
                        alt="Book My Workshop"
                        className="h-20 w-auto object-contain"
                    />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.link}
                            className="text-sm font-medium text-gray-600 hover:text-primary-orange transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default HostNavbar;
