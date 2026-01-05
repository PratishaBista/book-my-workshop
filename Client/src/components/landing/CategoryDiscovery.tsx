import React from 'react';
import { motion } from 'framer-motion';

const icons = {
    pottery: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-80">
            <path d="M19 11c0-4-3-8-7-8s-7 4-7 8v1.5a3 3 0 003 3h8a3 3 0 003-3V11z" />
            <path d="M9 3v8" />
            <path d="M15 3v8" />
            <path d="M5 11h14" />
            <path d="M12 3a9 9 0 019 9v1.5a3 3 0 01-3 3H6a3 3 0 01-3-3V12a9 9 0 019-9z" strokeOpacity="0.5" />
        </svg>
    ),
    painting: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-80">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 3 2.5 5.5 5.5 5.5C8.5 17.5 9 17 9 16c0-.5.5-1 1-1h1c2.2 0 4-1.8 4-4 0-.6.4-1 1-1s1 .4 1 1c0 2.2-1.8 4-4 4h-1.5c-2 0-3.5 1.5-3.5 3.5 0 1.1.9 2 2 2h2c4.4 0 8-3.6 8-8s-3.6-8-8-8z" />
            <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" fillOpacity="0.2" stroke="none" />
            <circle cx="11.5" cy="5.5" r="1.5" fill="currentColor" fillOpacity="0.2" stroke="none" />
            <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" fillOpacity="0.2" stroke="none" />
        </svg>
    ),
    cooking: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-80">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
            <line x1="6" y1="17" x2="18" y2="17" />
        </svg>
    ),
    fragrance: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-80">
            <rect x="7" y="9" width="10" height="12" rx="3" />
            <path d="M12 9V5" />
            <rect x="9" y="3" width="6" height="2" rx="1" />
            <path d="M12 14v2" opacity="0.5" />
            <path d="M10 14h4" opacity="0.5" />
        </svg>
    ),
    plants: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-80">
            <path d="M12 22v-9" />
            <path d="M12 13a6 6 0 0 0-6-6 4 4 0 1 1 5 1.5" />
            <path d="M12 13a6 6 0 0 1 6-6 4 4 0 0 0-5 1.5" />
            <path d="M12 13c0 3-2 5-2 8" opacity="0.5" />
            <path d="M12 13c0 3 2 5 2 8" opacity="0.5" />
        </svg>
    ),
    crafts: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-80">
            <path d="M4.5 9.5L9.5 4.5" />
            <path d="M14.5 4.5l5 5" />
            <path d="M19.5 14.5l-5 5" />
            <path d="M9.5 19.5l-5-5" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v20" opacity="0.2" />
            <path d="M22 12H2" opacity="0.2" />
        </svg>
    ),
};

const categories = [
    { id: 1, name: 'Pottery', icon: icons.pottery, color: '#E8A585', rotate: -2 }, // Warm Terracotta
    { id: 2, name: 'Paint & Sip', icon: icons.painting, color: '#A8D5BA', rotate: 1 }, // Rich Sage
    { id: 3, name: 'Cooking', icon: icons.cooking, color: '#F3CD7E', rotate: -1 }, // Vintage Mustard
    { id: 4, name: 'Fragrance', icon: icons.fragrance, color: '#E898AC', rotate: 2 }, // Deep Rose
    { id: 5, name: 'Plants', icon: icons.plants, color: '#9CC5A1', rotate: -2 }, // Basil Green
    { id: 6, name: 'Crafts', icon: icons.crafts, color: '#BFA6C7', rotate: 1 }, // Muted Lavender
];

const CategoryDiscovery: React.FC = () => {
    return (
        <section className="py-24 px-6 md:px-12 bg-[#F9F9F5] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center md:text-left"
                >
                    <h2 className="text-3xl text-center md:text-4xl font-serif font-medium text-deep-purple mb-4">
                        Find your craft
                    </h2>
                    {/* <p className="text-gray-500 font-sans max-w-md">
                        Explore curated hands-on experiences across Nepal.
                    </p> */}
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 50, rotate: 0 }}
                            whileInView={{ opacity: 1, y: 0, rotate: cat.rotate }}
                            viewport={{ once: true }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20,
                                delay: index * 0.1
                            }}
                            whileHover={{
                                y: -12,
                                rotate: 0,
                                scale: 1.05,
                                transition: { type: "spring", stiffness: 300, damping: 15 }
                            }}
                            className="cursor-pointer group relative"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-deep-purple/20 z-0"></div>

                            <div
                                className="h-48 rounded-lg flex flex-col items-center justify-center relative shadow-sm border border-black/5 overflow-hidden transition-shadow duration-300 group-hover:shadow-xl"
                                style={{ backgroundColor: cat.color }}
                            >
                                <div
                                    className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                />

                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-cream-base rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)] border border-white/50 z-10"></div>
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-black/10 z-10"></div>

                                <div className="relative z-10 flex flex-col items-center transform transition-transform duration-500 group-hover:scale-110">
                                    <div className="text-deep-purple/80 group-hover:text-deep-purple transition-colors">
                                        {cat.icon}
                                    </div>
                                    <span className="font-serif font-medium text-deep-purple tracking-wide text-lg">
                                        {cat.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryDiscovery;
