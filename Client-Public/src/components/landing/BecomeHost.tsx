import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BecomeHost: React.FC = () => {
    return (
        <section className="relative py-24 px-6 overflow-hidden bg-[#Fdfbf7]">
            <div className="absolute inset-0 z-0 opacity-40">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="terrazzo" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="12" fill="#E8D4C5" />
                            <path d="M50 50 L70 80 L30 80 Z" fill="#D4E2D4" transform="rotate(20 50 65)" />
                            <rect x="120" y="40" width="20" height="30" fill="#E6D2D2" transform="rotate(-15 130 55)" />
                            <circle cx="160" cy="140" r="8" fill="#F0E6D2" />
                            <path d="M80 150 Q100 120 120 150 T160 150" stroke="#C8D6C9" strokeWidth="4" fill="none" />
                            <circle cx="100" cy="100" r="4" fill="#6B4C3E" fillOpacity="0.1" />
                            <rect x="10" y="160" width="40" height="40" rx="10" fill="#D6C8D6" transform="rotate(45 30 180)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#terrazzo)" />
                </svg>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                <motion.div
                    initial={{ y: 40, opacity: 0, rotate: 1 }}
                    whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
                >
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />

                    <div className="md:w-5/12 relative h-64 md:h-auto bg-[#F5F5F0]">
                        <img
                            src="https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Host teaching"
                            className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
                        />
                        <div className="absolute inset-0 bg-primary-orange/10 mix-blend-overlay"></div>

                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#E6D2D2]/80 rotate-2 shadow-sm backdrop-blur-sm"></div>
                    </div>

                    <div className="md:w-7/12 p-10 md:p-16 flex flex-col justify-center text-left relative">

                        <div className="absolute top-8 right-8 hidden md:block opacity-20 rotate-12">
                            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-deep-purple">
                                <circle cx="50" cy="50" r="40" strokeWidth="2" strokeDasharray="4 4" />
                                <text x="50" y="55" fontSize="14" textAnchor="middle" fontFamily="serif" fill="currentColor">EST 2024</text>
                            </svg>
                        </div>

                        <h2 className="font-serif text-4xl md:text-5xl text-deep-purple mb-6 leading-tight">
                            Do you host <br className="hidden md:block" />
                            <span className="italic text-primary-orange">creative</span> experiences?
                        </h2>

                        <p className="font-sans text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
                            Join a community of artisans, makers, and mentors. We handle the booking logistics so you can focus on sharing your craft.
                        </p>

                        <div className="flex gap-4 items-center">
                            <Link to="/host-workshop" className="px-8 py-4 bg-deep-purple text-white font-medium rounded-full hover:bg-[#2A1B3D] transition-all shadow-lg">
                                Learn more
                            </Link>
                        </div>
                    </div>

                </motion.div>

                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary-orange rounded-full opacity-10 blur-2xl"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-deep-purple rounded-full opacity-5 blur-3xl"></div>

            </div>
        </section>
    );
};

export default BecomeHost;
