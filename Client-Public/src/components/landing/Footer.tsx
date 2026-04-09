import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../../config/api';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) return;
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.newsletter.subscribe, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Subscription error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-[#FAF8E7] text-deep-purple pt-8 px-6 md:px-12 pb-6 overflow-hidden relative border-t border-deep-purple/10">
            <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row justify-between items-start gap-24 mb-24 relative z-10">

                <div className="flex-1 w-full xl:pr-12">
                    <div className="max-w-lg mb-16">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg"
                            alt="Flag of Nepal"
                            className="h-14 w-auto mb-8 drop-shadow-sm mix-blend-multiply"
                        />
                        <div className="space-y-5 font-sans text-base text-deep-purple/80 leading-[1.8] font-medium">
                            <p>
                                We proudly operate from Nepal, drawing inspiration from its rich, enduring heritage of craftsmanship and communal living.
                            </p>
                            <p>
                                Our platform is deeply committed to promoting holistic well-being through community learning. We honor the diverse cultures across the nation and continually strive to empower local makers and teachers to cultivate a thriving, interconnected creative economy.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-deep-purple/40 mb-4 block font-bold">
                            Stay Updated
                        </span>

                        {isSubscribed ? (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="py-4 border-b border-primary-orange/30"
                            >
                                <span className="text-primary-orange font-serif italic text-2xl">
                                    You're subscribed.
                                </span>
                            </motion.div>
                        ) : (
                            <div className="relative border-b border-deep-purple/20 focus-within:border-primary-orange transition-colors">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="(Enter your email)"
                                    className="w-full bg-transparent py-4 text-deep-purple placeholder:text-deep-purple/30 focus:outline-none font-medium text-lg"
                                />
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={loading}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-primary-orange font-serif italic text-xl hover:text-deep-purple transition-colors disabled:opacity-50"
                                    >
                                        {loading ? '...' : 'Subscribe'}
                                    </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:w-6/12 w-full flex flex-col md:flex-row gap-16 md:gap-24 items-start pt-4">
                    <div className="flex-1">
                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-deep-purple/40 mb-8 font-bold">(Explore)</h4>
                        <ul className="space-y-6 font-serif text-4xl md:text-5xl text-deep-purple tracking-tight">
                            {['Workshops', 'Gift Cards', 'Stories', 'Calendar'].map(item => (
                                <li key={item}>
                                    <Link to="#" className="hover:text-primary-orange hover:italic transition-all duration-300 transform origin-left inline-block">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1">
                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-deep-purple/40 mb-8 font-bold">(Company)</h4>
                        <ul className="space-y-6 font-serif text-4xl md:text-5xl text-deep-purple tracking-tight">
                            <li><Link to="/about" className="hover:text-primary-orange hover:italic transition-all duration-300 transform origin-left inline-block">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-orange hover:italic transition-all duration-300 transform origin-left inline-block">Contact Us</Link></li>
                            <li><Link to="/host-workshop" className="hover:text-primary-orange hover:italic transition-all duration-300 transform origin-left inline-block">Become a Host</Link></li>
                        </ul>

                        <div className="mt-20">
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-deep-purple/40 mb-8 font-bold">(Connect with us)</h4>
                            <div className="flex gap-8">
                                <a href="#" className="text-deep-purple/60 hover:text-primary-orange transition-all duration-300 hover:scale-110">
                                    <Instagram size={36} strokeWidth={1} />
                                </a>
                                <a href="#" className="text-deep-purple/60 hover:text-primary-orange transition-all duration-300 hover:scale-110">
                                    <Facebook size={36} strokeWidth={1} />
                                </a>
                                <a href="#" className="text-deep-purple/60 hover:text-primary-orange transition-all duration-300 hover:scale-110">
                                    <Youtube size={36} strokeWidth={1} />
                                </a>
                                <a href="#" className="text-deep-purple/60 hover:text-primary-orange transition-all duration-300 hover:scale-110">
                                    <Twitter size={36} strokeWidth={1} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="border-t border-deep-purple/10 mt-16 pt-6 pb-4">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">

                    <div className="flex items-center gap-6 bg-transparent px-2">
                        <span className="font-serif text-4xl text-deep-purple leading-none">
                            ©{new Date().getFullYear()}
                        </span>
                        <div className="flex flex-col justify-center border-l border-deep-purple/20 pl-6 h-full">
                            <span className="text-deep-purple font-sans text-sm font-bold uppercase tracking-[0.2em] leading-tight block">
                                Book My Workshop
                            </span>
                            <span className="text-deep-purple/40 text-xs font-mono block mt-1 uppercase tracking-widest">
                                All rights reserved.
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-8 text-[11px] font-mono text-deep-purple/40 font-bold uppercase tracking-[0.2em] pb-2">
                        <Link to="#" className='hover:text-primary-orange transition-colors'>Terms</Link>
                        <Link to="#" className='hover:text-primary-orange transition-colors'>Privacy</Link>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
