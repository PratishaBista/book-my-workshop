import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const MissionPage: React.FC = () => {
    const values = [
        {
            title: "Skills as Microservices",
            description: "We turn talent into flexible, low-commitment income streams. For makers, it's about monetizing what they love without the friction of a formal business.",
            image: "mission_hero_craft_1774454553641.png"
        },
        {
            title: "Empowering Local Entrepreneurs",
            description: "Built for the Nepalese context, we enable small-scale entrepreneurs to flourish by providing a sophisticated platform that honors their craft.",
            image: "mission_local_biz_icon_1774455153011.png"
        },
        {
            title: "Reviving Forgotten Crafts",
            description: "From traditional weaving to pottery, we aim to put forgotten or under-valued skills back on the map, making them relevant for the modern world.",
            image: "mission_reviving_crafts_icon_1774455536526.png"
        },
        {
            title: "Human Interaction, Offline",
            description: "In a world of digital noise, we prioritize real-world experience. Our platform is a bridge to authentic, in-person human connections.",
            image: "learner_attending_icon_1774454670737.png"
        }
    ];

    return (
        <div className="bg-cream-base min-h-screen">
            <Navbar />
            
            <main className="pt-48 pb-24 px-8">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto mb-32">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
                    >
                        <div className="lg:col-span-12">
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-deep-purple/40 mb-6 block">Our story & vision</span>
                            <h1 className="font-serif text-6xl md:text-8xl lg:text-[7.5rem] leading-[0.85] text-deep-purple mb-12">
                                Reinventing <br />
                                <span className="italic text-primary-orange">skills</span> with <br />
                                passion.
                            </h1>
                        </div>
                        
                        <div className="lg:col-span-8">
                            <p className="font-sans text-xl md:text-2xl text-deep-purple/70 leading-relaxed max-w-4xl">
                                We're on a mission to flip the script on how skills are shared. 
                                In the Nepali context, talent is everywhere but often remains under-valued. 
                                We turn everyday mastery into bookable, real-world experiences—enabling 
                                local entrepreneurs to build flexible income streams through what they do best.
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* Values Section */}
                <section className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-20 border-b border-deep-purple/10 pb-8">
                        <h2 className="font-serif text-5xl text-deep-purple">Our values</h2>
                        <span className="font-mono text-xs text-deep-purple/40 uppercase tracking-widest hidden md:block">01 — Purpose driven</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                        {values.map((v, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="group cursor-default"
                            >
                                <div className="aspect-[4/3] overflow-hidden rounded-3xl mb-10 bg-deep-purple/5 relative">
                                    <img 
                                        src={`/${v.image}`} 
                                        alt={v.title} 
                                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-deep-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-serif text-3xl text-deep-purple mb-4 group-hover:text-primary-orange transition-colors">{v.title}</h3>
                                <p className="font-sans text-lg text-deep-purple/60 leading-relaxed max-w-lg">
                                    {v.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final CTA/Vision Statement */}
                <section className="max-w-7xl mx-auto mt-48 py-32 border-y border-deep-purple/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-orange/5 rounded-full blur-[120px]" />
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-serif text-4xl md:text-6xl text-deep-purple max-w-4xl mx-auto mb-10">
                            We believe that every <br />
                            <span className="italic text-primary-orange">skill</span> is a microservice.
                        </h2>
                        <p className="font-sans text-lg text-deep-purple/60 max-w-xl mx-auto">
                            Join us in building a future where talent is recognized, valued, and shared in the real world.
                        </p>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default MissionPage;
