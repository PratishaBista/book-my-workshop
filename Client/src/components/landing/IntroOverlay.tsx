import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroOverlayProps {
    onComplete: () => void;
}

const images = [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format",
    "https://www.distinctdestinations.in/DistinctDestinationsBackEndImg/BlogImage/6-artisanal-skills-to-take-home-from-nepal-L-distinctdestinations.jpg", 
    "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800&auto=format",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format" 
];

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
    useEffect(() => {
        // Timer to trigger the transition to the main page
        const timer = setTimeout(() => {
            onComplete();
        }, 3500); // 3.5 seconds total intro
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-cream-base overflow-hidden"
            exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: 0.8 } }}
        >
            {/* Parallax Images Background (Slides in) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {images.map((img, index) => (
                    <motion.img
                        key={index}
                        src={img}
                        alt="intro"
                        initial={{ opacity: 0, y: 100, x: (index % 2 === 0 ? -50 : 50) }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            y: [100, -50, -100],
                            x: (index % 2 === 0 ? -20 : 20)
                        }}
                        transition={{
                            duration: 2.5,
                            times: [0, 0.2, 0.8, 1],
                            delay: 0.5 + (index * 0.2),
                            ease: "easeInOut"
                        }}
                        className={`absolute object-cover rounded-lg shadow-xl brightness-75
              ${index === 0 ? 'top-[10%] left-[10%] w-64 h-80' : ''}
              ${index === 1 ? 'bottom-[15%] right-[15%] w-72 h-96' : ''}
              ${index === 2 ? 'top-[20%] right-[20%] w-56 h-56' : ''}
              ${index === 3 ? 'bottom-[20%] left-[25%] w-64 h-64' : ''}
            `}
                    />
                ))}
            </div>

            {/* Main Brand Title */}
            <div className="relative z-10 text-center">
                <motion.h1
                    layoutId="brand-logo"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium text-deep-purple tracking-tight"
                >
                    Book My Workshop
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-4 font-sans text-lg text-deep-purple/60 tracking-widest uppercase text-[10px]"
                >
                    Discover • Learn • Create
                </motion.p>
            </div>
        </motion.div>
    );
};

export default IntroOverlay;
