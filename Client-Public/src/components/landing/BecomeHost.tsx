import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedHoverText } from '../ui/AnimatedHoverText';

const BecomeHost: React.FC = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start end", "end start"]
    });

    const leftImageY = useTransform(scrollYProgress, [0, 1], [100, -150]);
    const rightImageY = useTransform(scrollYProgress, [0, 1], [200, -250]);
    
    // Line finishes drawing by the time the section is halfway up the screen
    const pathLength = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

    return (
        <div className="w-full bg-white relative z-10">
            <section ref={heroRef} className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden py-32 bg-[#FCFBF7] border-y border-deep-purple/10 shadow-[0_10px_60px_rgba(0,0,0,0.03)]">

                {/* Parallax Images */}
                <motion.img
                    style={{ y: leftImageY }}
                    src="https://i.pinimg.com/1200x/12/3a/0d/123a0d01d45b4a3a02c041270eda496e.jpg"
                    alt="Pottery Workshop"
                    className="absolute left-[-15%] md:left-[-5%] top-[10%] w-[55vw] md:w-[32vw] max-w-[450px] aspect-[4/5] object-cover rounded-[2.5rem] shadow-2xl rotate-[10deg] z-0"
                />

                <motion.img
                    style={{ y: rightImageY }}
                    src="https://i.pinimg.com/1200x/ce/b0/dd/ceb0dda95c0ec0cff06b33648bcc7b96.jpg"
                    alt="Culinary Workshop"
                    className="absolute right-[-15%] md:right-[-5%] top-[40%] w-[50vw] md:w-[28vw] max-w-[400px] aspect-[3/4] object-cover rounded-[2.5rem] shadow-2xl rotate-[-12deg] z-0"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-6 mix-blend-multiply">
                    <h1 className="font-serif text-[10vw] sm:text-6xl md:text-7xl xl:text-[7rem] leading-[1.1] text-[#1A1A1A] font-bold tracking-tighter uppercase mb-0">
                        Do you host creative <br />
                    </h1>
                    <div className="relative inline-block mb-10">
                        <h1 className="font-serif text-[10vw] sm:text-6xl md:text-7xl xl:text-[7rem] leading-[1] text-[#1A1A1A] font-bold tracking-tighter uppercase relative z-10 block">
                            workshops?
                        </h1>
                        {/* Layered Brush Underline */}
                        <svg className="absolute w-[110%] h-[60px] left-[-5%] bottom-[-15px] pointer-events-none overflow-visible z-[-1] opacity-90" viewBox="0 0 400 60" preserveAspectRatio="none">
                            <motion.path
                                d="M 10 50 Q 150 15, 250 40 T 390 25"
                                fill="none"
                                stroke="#7E57C2" 
                                strokeWidth="18"
                                strokeLinecap="round"
                                opacity="0.9"
                                style={{ pathLength }}
                            />
                            <motion.path
                                d="M 5 42 Q 140 5, 240 32 T 395 18"
                                fill="none"
                                stroke="#7E57C2" 
                                strokeWidth="6"
                                strokeLinecap="round"
                                opacity="0.5"
                                style={{ pathLength }}
                            />
                            <motion.path
                                d="M 15 58 Q 160 25, 260 48 T 385 32"
                                fill="none"
                                stroke="#7E57C2" 
                                strokeWidth="8"
                                strokeLinecap="round"
                                opacity="0.4"
                                style={{ pathLength }}
                            />
                        </svg>
                    </div>

                    <p className="font-sans text-lg md:text-xl font-medium text-deep-purple/80 max-w-lg mb-10 leading-relaxed">
                        Join a community of artisans, makers, and mentors. We handle the booking logistics so you can focus on sharing your craft.
                    </p>

                    <Link
                        to="/host-workshop"
                        className="group px-12 py-5 bg-primary-orange text-[#1A1A1A] font-bold text-lg uppercase tracking-widest rounded-full transition-all duration-400 flex items-center gap-3 overflow-hidden"
                    >
                        <AnimatedHoverText text="Learn More" />
                        <span className="text-2xl font-light transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default BecomeHost;
