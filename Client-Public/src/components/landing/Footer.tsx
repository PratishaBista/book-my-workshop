import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-deep-purple text-cream-base pt-24 px-6 md:px-12 pb-6 overflow-hidden relative">

            <div className="absolute top-0 left-0 w-full h-8 text-primary-orange/20 overflow-hidden">
                <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full fill-none stroke-current stroke-[3]">
                    <path d="M0,20 C150,40 300,0 450,20 C600,40 750,0 900,20 C1050,40 1200,0 1350,20" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>

            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-24 mb-16 relative z-10">

                <div className="md:w-5/12 pt-8">
                    <h2 className="font-serif text-5xl md:text-7xl leading-none mb-6 text-cream-base">
                        Craft something <br />
                        <span className="text-primary-orange italic">unforgettable.</span>
                    </h2>
                    <p className="font-sans text-xl text-cream-base/60 max-w-md leading-relaxed mb-10">
                        We are a community of makers, teachers, and learners.
                        Subscribe for newsletter, exclusive discounts, and more.
                    </p>

                    <div className="mt-8 max-w-sm">
                        <div className="relative border-b border-cream-base/30 focus-within:border-primary-orange transition-colors">
                            <input
                                type="email"
                                placeholder="(Enter your email)"
                                className="w-full bg-transparent py-4 text-cream-base placeholder:text-cream-base/20 focus:outline-none"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-primary-orange font-serif italic text-lg transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="md:w-6/12 flex gap-12 md:gap-24 items-start pt-4">
                    <div>
                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary-orange mb-6">Explore</h4>
                        <ul className="space-y-3 font-serif text-2xl md:text-3xl text-cream-base/80">
                            {['Workshops', 'Gift Cards', 'Stories', 'Calendar'].map(item => (
                                <li key={item}>
                                    <Link to="#" className="transition-all">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary-orange mb-6">Company</h4>
                        <ul className="space-y-3 font-sans text-lg text-cream-base/60">
                            <li><Link to="/about" className="transition-colors hover:text-white">About Us</Link></li>
                            <li><Link to="/host-workshop" className="transition-colors hover:text-white">Become a Host</Link></li>
                            <li><Link to="/careers" className="transition-colors hover:text-white">Careers</Link></li>
                            <li><Link to="/sitemap" className="transition-colors hover:text-white">Sitemap</Link></li>
                        </ul>
                        <div className="mt-12">
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary-orange mb-4">(Connect with us)</h4>
                            <div className="flex gap-6">
                                <a href="#" className="text-cream-base/60 transition-all duration-300">
                                    <Instagram size={24} strokeWidth={1.5} />
                                </a>
                                <a href="#" className="text-cream-base/60 transition-all duration-300">
                                    <Facebook size={24} strokeWidth={1.5} />
                                </a>
                                <a href="#" className="text-cream-base/60 transition-all duration-300">
                                    <Youtube size={24} strokeWidth={1.5} />
                                </a>
                                <a href="#" className="text-cream-base/60 transition-all duration-300">
                                    <Twitter size={24} strokeWidth={1.5} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="border-t border-cream-base/20 mt-12 pt-12 pb-8">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8 relative z-10 px-6 md:px-0">

                    <div className="flex items-center gap-6 border border-cream-base/50 bg-transparent px-6 py-3">
                        <span className="font-serif text-5xl text-cream-base leading-none">
                            ©{new Date().getFullYear()}
                        </span>
                        <div className="flex flex-col justify-center border-l border-cream-base/20 pl-6 h-full">
                            <span className="text-cream-base font-sans text-sm font-medium leading-tight block">
                                Book My Workshop
                            </span>
                            <span className="text-cream-base/60 text-xs block mt-0.5">
                                All rights reserved.
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 text-xs font-mono text-cream-base/60 uppercase tracking-widest pb-2">
                        <Link to="#" className='transition-colors'>Terms</Link>
                        <Link to="#" className='transition-colors'>Privacy</Link>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
