import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted", formData);
        alert("Thanks for reaching out! We'll get back to you soon.");
    };

    return (
        <div className="bg-cream-base min-h-screen">
            <Navbar />
            
            <main className="pt-48 pb-24 px-8">
                <section className="max-w-7xl mx-auto mb-32 grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                    
                    <div className="lg:col-span-12">
                         <span className="font-mono text-xs uppercase tracking-[0.3em] text-deep-purple/40 mb-6 block">Stay connected</span>
                         <h1 className="font-serif text-6xl md:text-8xl lg:text-[7.5rem] leading-[0.85] text-deep-purple mb-12">
                            Let’s craft <br />
                            <span className="italic text-primary-orange">something</span> <br />
                            together.
                        </h1>
                    </div>

                    {/* Contact Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 space-y-16"
                    >
                        <div>
                             <h3 className="font-serif text-3xl text-deep-purple mb-8">Get in touch</h3>
                             <div className="space-y-6">
                                 <div className="flex items-center gap-6 group">
                                     <div className="w-12 h-12 rounded-full bg-deep-purple text-cream-base flex items-center justify-center group-hover:bg-primary-orange transition-colors duration-300">
                                         <Mail size={20} />
                                     </div>
                                     <span className="font-sans text-xl text-deep-purple/70">hello@bookmyworkshop.com</span>
                                 </div>
                                 <div className="flex items-center gap-6 group">
                                     <div className="w-12 h-12 rounded-full bg-deep-purple text-cream-base flex items-center justify-center group-hover:bg-primary-orange transition-colors duration-300">
                                         <MapPin size={20} />
                                     </div>
                                     <span className="font-sans text-xl text-deep-purple/70">Kathmandu, Nepal</span>
                                 </div>
                             </div>
                        </div>

                        <div>
                             <h3 className="font-serif text-3xl text-deep-purple mb-8">Follow our journey</h3>
                             <div className="flex gap-4">
                                 {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                                     <a key={idx} href="#" className="w-14 h-14 rounded-full border border-deep-purple/10 flex items-center justify-center text-deep-purple hover:bg-deep-purple hover:text-white transition-all duration-300">
                                         <Icon size={24} />
                                     </a>
                                 ))}
                             </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7 bg-white/50 backdrop-blur-lg rounded-[3rem] p-12 md:p-24 border border-deep-purple/5"
                    >
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="relative border-b border-deep-purple/10 focus-within:border-primary-orange transition-colors">
                                <label className="font-mono text-xs uppercase tracking-widest text-deep-purple/40 block mb-2">Subject Your Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your name" 
                                    className="w-full bg-transparent py-4 text-2xl font-serif text-deep-purple placeholder:text-deep-purple/10 focus:outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="relative border-b border-deep-purple/10 focus-within:border-primary-orange transition-colors">
                                <label className="font-mono text-xs uppercase tracking-widest text-deep-purple/40 block mb-2">Your Email</label>
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="w-full bg-transparent py-4 text-2xl font-serif text-deep-purple placeholder:text-deep-purple/10 focus:outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="relative border-b border-deep-purple/10 focus-within:border-primary-orange transition-colors">
                                <label className="font-mono text-xs uppercase tracking-widest text-deep-purple/40 block mb-2">Message</label>
                                <textarea 
                                    rows={1}
                                    placeholder="Tell us about your project/interest" 
                                    className="w-full bg-transparent py-4 text-2xl font-serif text-deep-purple placeholder:text-deep-purple/10 focus:outline-none resize-none overflow-hidden"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            
                            <button type="submit" className="px-12 py-5 bg-deep-purple text-cream-base font-sans font-bold text-xl rounded-full hover:bg-primary-orange transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                Send Message
                            </button>
                        </form>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
