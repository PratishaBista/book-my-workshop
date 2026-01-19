import React from 'react';
import { motion } from 'framer-motion';

const brands = [
    { name: "Paint & Sip", font: "font-serif italic" },
    { name: "Pottery House", font: "font-sans font-black tracking-tighter" },
    { name: "Urban Sketchers", font: "font-serif font-bold" },
    { name: "Yoga Space", font: "font-mono uppercase tracking-widest text-sm" },
    { name: "Culinary Arts", font: "font-sans font-light" },
    { name: "Dance Lab", font: "font-sans font-bold" },
    { name: "Music Hub", font: "font-serif text-3xl lowercase" },
    { name: "Craft Circle", font: "font-sans uppercase font-medium" },
];

const HostTrustedBy: React.FC = () => {
    return (
        <section className="py-12 border-y border-gray-100 bg-white overflow-hidden relative" id="awards">
            <div className="max-w-7xl mx-auto px-6 relative flex items-center">

                <div className="hidden md:block w-48 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] border-r border-gray-100 mr-12 pr-6 py-2">
                    Join these <br /> amazing hosts
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 md:hidden"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
                <div className="absolute left-[200px] top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>

                <div className="flex-1 overflow-hidden mask-gradient-x">
                    <motion.div
                        className="flex items-center gap-16 md:gap-24 whitespace-nowrap"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30
                        }}
                    >
                        {[...brands, ...brands, ...brands].map((brand, i) => (
                            <span
                                key={i}
                                className={`text-2xl md:text-3xl text-gray-300 ${brand.font} select-none`}
                            >
                                {brand.name}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HostTrustedBy;
