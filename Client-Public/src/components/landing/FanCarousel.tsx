import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const imageSets = [
    {
        left: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=600&auto=format",
        center: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format",
        right: "https://images.unsplash.com/photo-1579938202767-771be803237b?q=80&w=686&auto=format"
    },
    {
        left: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format",
        center: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=600&auto=format",
        right: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format"
    },
    {
        left: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=600&auto=format",
        center: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=687&auto=format",
        right: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format"
    }
];

const FanCarousel: React.FC = () => {
    const [currentSet, setCurrentSet] = useState(0);
    const [positionIndex, setPositionIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPositionIndex((prev) => {
                const next = prev + 1;
                if (next >= 3) {
                    setCurrentSet((prevSet) => (prevSet + 1) % imageSets.length);
                    return 0;
                }
                return next;
            });
        }, 4000); 

        return () => clearInterval(interval);
    }, []);

    const currentImages = imageSets[currentSet];

    const positions = [
        { left: currentImages.left, center: currentImages.center, right: currentImages.right },
        { left: currentImages.right, center: currentImages.left, right: currentImages.center },
        { left: currentImages.center, center: currentImages.right, right: currentImages.left }
    ];

    const displayImages = positions[positionIndex];

    return (
        <div className="relative w-full h-[600px] flex items-start justify-center pt-4">

            <div className="relative w-full flex items-start justify-center">

                <motion.div
                    key={`left-${positionIndex}`}
                    initial={{ opacity: 0, x: -100, rotate: -8 }}
                    animate={{ opacity: 1, x: 0, rotate: -6 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute -left-8 top-8 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-10"
                >
                    <img
                        src={displayImages.left}
                        alt="Workshop"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                <motion.div
                    key={`center-${positionIndex}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative w-72 h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-20"
                >
                    <img
                        src={displayImages.center}
                        alt="Workshop"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                <motion.div
                    key={`right-${positionIndex}`}
                    initial={{ opacity: 0, x: 100, rotate: 8 }}
                    animate={{ opacity: 1, x: 0, rotate: 6 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute -right-8 top-8 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-10"
                >
                    <img
                        src={displayImages.right}
                        alt="Workshop"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {imageSets.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSet(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSet
                                ? 'bg-primary-orange w-8'
                                : 'bg-deep-purple/30 hover:bg-deep-purple/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FanCarousel;
