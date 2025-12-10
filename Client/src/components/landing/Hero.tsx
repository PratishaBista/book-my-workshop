import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FanCarousel from './FanCarousel';

const Hero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section ref={containerRef} className="relative min-h-screen pt-32 pb-20 px-8 flex flex-col justify-center overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary-orange/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-deep-purple/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

            <motion.div
                style={{ y, opacity }}
                className="container mx-auto max-w-6xl z-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Main Content */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] text-deep-purple mb-8">
                                Master a new <br />
                                <span className="italic text-primary-orange">craft</span> today.
                            </h1>
                            <p className="font-sans text-xl text-deep-purple/70 max-w-xl mb-10 leading-relaxed">
                                Join local artisans and expert mentors in hands-on workshops.
                                Discover the joy of making.
                            </p>
                        </motion.div>
                    </div>

                    {/* Fan Carousel (Right Side) */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <FanCarousel />
                    </div>
                </div>
            </motion.div>

            {/* Down Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-deep-purple/40 text-sm font-sans flex flex-col items-center gap-2"
            >
                <span>Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-deep-purple/20" />
            </motion.div>
        </section>
    );
};

export default Hero;
