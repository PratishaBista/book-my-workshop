import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const imageSets = [
    {
        left: "https://i.pinimg.com/1200x/81/2c/c8/812cc890f5e7827e20deeaccdd3f8739.jpg",
        center: "https://i.pinimg.com/1200x/48/09/9c/48099c941b05bdd0f8118c8f37280757.jpg",
        right: "https://i.pinimg.com/1200x/a3/cf/d2/a3cfd250325e0d238171ce144cd31ab5.jpg"
    },
    {
        left: "https://i.pinimg.com/736x/ca/f4/8a/caf48a70080f113d7485f623dd3e8b81.jpg",
        center: "https://i.pinimg.com/1200x/c8/0a/9d/c80a9dd57ecaa06314d4f51454c4ffe9.jpg",
        right: "https://i.pinimg.com/736x/f9/96/78/f996780ee28b943873b3068a4cdbf2d4.jpg"
    },
    {
        left: "https://i.pinimg.com/736x/f9/96/78/f996780ee28b943873b3068a4cdbf2d4.jpg",
        center: "https://i.pinimg.com/736x/cc/ae/32/ccae32c4d5801a947b611cc659b9a027.jpg",
        right: "https://i.pinimg.com/736x/2b/6c/66/2b6c66264501ee78a76b3196c588ead3.jpg"
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
