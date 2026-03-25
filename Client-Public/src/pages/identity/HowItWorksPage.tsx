import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const HowItWorksPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'learner' | 'host'>('learner');

    const learnerSteps = [
        {
            title: "Find Your Craft",
            description: "Explore a curated world of local workshops. From pottery to programming, find a session that fits your schedule and location.",
            image: "mission_hero_craft_1774454553641.png"
        },
        {
            title: "Book & Pay Securely",
            description: "Secure your spot in seconds with our seamless booking system. No hidden fees, just simple, straightforward access to skill-sharing.",
            image: "host_workshop_icon_1774454650582.png"
        },
        {
            title: "Learn & Connect",
            description: "Show up at the session, meet like-minded people, and take home a new skill (and maybe a new masterpiece).",
            image: "learner_attending_icon_1774454670737.png"
        }
    ];

    const hostSteps = [
        {
            title: "List Your Session",
            description: "Turn your talent into a bookable microservice. List your craft, set your price, and reach a community of curious learners.",
            image: "mission_local_biz_icon_1774455153011.png"
        },
        {
            title: "Manage with Ease",
            description: "Our platform handles the logistics. Control your schedule, track your bookings, and view your earnings from one simple dashboard.",
            image: "mission_reviving_crafts_icon_1774455536526.png"
        },
        {
            title: "Shape the Future",
            description: "Build your brand as an expert while contributing to a culture of offline human interaction and shared knowledge.",
            image: "mission_hero_craft_1774454553641.png"
        }
    ];

    const steps = activeTab === 'learner' ? learnerSteps : hostSteps;

    return (
        <div className="bg-cream-base min-h-screen">
            <Navbar />
            
            <main className="pt-48 pb-24 px-8">
                <section className="max-w-7xl mx-auto mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="font-serif text-6xl md:text-[7rem] leading-none text-deep-purple mb-12">
                            How it <span className="italic text-primary-orange">works.</span>
                        </h1>
                        
                        {/* Tab Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-24">
                            <button 
                                onClick={() => setActiveTab('learner')}
                                className={`px-10 py-4 rounded-full font-sans font-bold text-lg transition-all ${activeTab === 'learner' ? 'bg-deep-purple text-cream-base' : 'bg-deep-purple/5 text-deep-purple hover:bg-deep-purple/10'}`}
                            >
                                For Learners
                            </button>
                            <button 
                                onClick={() => setActiveTab('host')}
                                className={`px-10 py-4 rounded-full font-sans font-bold text-lg transition-all ${activeTab === 'host' ? 'bg-deep-purple text-cream-base' : 'bg-deep-purple/5 text-deep-purple hover:bg-deep-purple/10'}`}
                            >
                                For Hosts
                            </button>
                        </div>
                    </motion.div>

                    {/* Steps Layout */}
                    <div className="space-y-32">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-32 lg:space-y-48"
                            >
                                {steps.map((step, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32`}
                                    >
                                        <div className="flex-1">
                                            <div className="aspect-[4/5] lg:aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-deep-purple/5 grayscale-[30%] hover:grayscale-0 transition-all duration-700">
                                                <img 
                                                    src={`/${step.image}`} 
                                                    alt={step.title} 
                                                    className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700" 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-mono text-sm text-primary-orange font-bold uppercase tracking-[0.4em] mb-6 block">Step 0{idx + 1}</span>
                                            <h2 className="font-serif text-5xl md:text-7xl text-deep-purple mb-8 leading-tight">{step.title}</h2>
                                            <p className="font-sans text-xl text-deep-purple/60 leading-relaxed max-w-lg">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Final Connect CTA */}
                <section className="max-w-7xl mx-auto mt-48 py-24 bg-deep-purple text-cream-base rounded-[3rem] px-12 md:px-24 relative overflow-hidden text-center md:text-left">
                     <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                         <svg viewBox="0 0 400 400" className="w-[800px] h-[800px] absolute -top-1/4 -right-1/4 animate-spin-slow">
                            <path d="M100 200a100 100 0 1 0 200 0 100 100 0 1 0-200 0" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 10" />
                            <path d="M50 200a150 150 0 1 0 300 0 150 150 0 1 0-300 0" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
                         </svg>
                     </div>

                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                         <div>
                            <h3 className="font-serif text-5xl md:text-6xl mb-6">Ready to start?</h3>
                            <p className="font-sans text-xl text-cream-base/60 max-w-md">Join over 500+ makers and learners building local communities through skill-sharing.</p>
                         </div>
                         <button className="px-12 py-5 bg-primary-orange text-white font-sans font-bold text-xl rounded-full hover:bg-primary-orange/90 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                             Explore Workshops
                         </button>
                     </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HowItWorksPage;
