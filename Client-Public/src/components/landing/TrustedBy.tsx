import React from 'react';
import { motion } from 'framer-motion';

const brands = [
    { name: "The Pottery Shed", font: "font-serif italic" },
    { name: "ARTLAB", font: "font-sans font-black tracking-tighter" },
    { name: "Craft & Co.", font: "font-serif font-bold" },
    { name: "Makers Space", font: "font-mono uppercase tracking-widest text-sm" },
    { name: "Studio Clay", font: "font-sans font-light" },
    { name: "KATHMANDU ART", font: "font-sans font-bold" },
    { name: "bamboo", font: "font-serif text-3xl lowercase" },
    { name: "Handmade Nepal", font: "font-sans uppercase font-medium" },
];

const TrustedBy: React.FC = () => {
    return (
        <section className="py-12 border-y border-deep-purple/5 bg-[#F9F9F5] overflow-hidden relative">

            <div className="max-w-7xl mx-auto px-6 relative flex items-center">

                <div className="hidden md:block w-48 text-deep-purple/40 text-xs font-bold uppercase tracking-[0.2em] border-r border-deep-purple/10 mr-12 pr-6 py-2">
                    Trusted by <br /> local studios
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F9F9F5] to-transparent z-10 md:hidden"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F9F9F5] to-transparent z-10"></div>
                <div className="absolute left-[200px] top-0 bottom-0 w-24 bg-gradient-to-r from-[#F9F9F5] to-transparent z-10 hidden md:block"></div>

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
                                className={`text-2xl md:text-3xl text-deep-purple/30 ${brand.font} select-none`}
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

export default TrustedBy;
