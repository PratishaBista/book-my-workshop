import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const response = await fetch(API_ENDPOINTS.contact, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong. Please try again.');
            }

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send message.');
        }
    };

    return (
        <div className="bg-[#FDFCF8] min-h-screen selection:bg-black selection:text-white">
            <Navbar />
            
            <main className="pt-48 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto font-mono text-black">
                    
                    {/* Header Section */}
                    <div className="mb-16">
                        <div className="flex items-baseline justify-between border-b-4 border-black pb-2">
                            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter flex items-center gap-4">
                                CONTACT
                                <span className="hidden md:inline-block">
                                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 10L110 50M110 10L10 50" stroke="black" strokeWidth="3"/>
                                        <rect x="30" y="10" width="60" height="40" stroke="black" strokeWidth="2" fill="white" />
                                        <path d="M30 15L60 35L90 15" stroke="black" strokeWidth="2" />
                                    </svg>
                                </span>
                            </h1>
                        </div>
                        <p className="mt-4 text-xs font-bold tracking-widest uppercase">
                            Reach out for inquiries, collaborations, or technical support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
                        {/* Information Column */}
                        <div className="space-y-12">
                            <div className="border-l-4 border-black pl-8 py-2">
                                <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter">Office / Lab</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} />
                                        <span>Sanepa, Lalitpur 44600</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-4 h-4 rounded-full bg-black"></span>
                                        <span>Kathmandu, Nepal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-l-4 border-black pl-8 py-2">
                                <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter">Support</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} />
                                        <a href="mailto:bookmyworkshop.platform@com" className="hover:underline">bookmyworkshop.platform@gmail.com</a>
                                    </div>
                                    <p className="text-xs text-black/60 italic">We typically respond within 12-24 labor hours.</p>
                                </div>
                            </div>

                            <div className="pt-12">
                                <div className="w-full aspect-square border-4 border-black bg-gray-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center p-8 overflow-hidden grayscale contrast-125">
                                    <img 
                                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop" 
                                        alt="Connection"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="h-full border-4 border-black bg-[#FDFCF8] p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center space-y-6"
                                    >
                                        <CheckCircle2 size={64} className="text-black" />
                                        <h2 className="text-3xl font-bold tracking-tighter uppercase italic">Sent</h2>
                                        <p className="text-sm border-t-2 border-black pt-4">Your message has been received by our team. Expect a response shortly.</p>
                                        <button 
                                            onClick={() => setStatus('idle')}
                                            className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors"
                                        >
                                            Send Another
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-4 border-black bg-white p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        <form onSubmit={handleSubmit} className="space-y-10">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest block">Subject Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="NAME SURNAME" 
                                                    className="w-full bg-transparent border-b-2 border-black py-2 placeholder:text-black/20 focus:outline-none focus:border-black transition-colors text-lg"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest block">Email Address</label>
                                                <input 
                                                    required
                                                    type="email" 
                                                    placeholder="EMAIL@DOMAIN.COM" 
                                                    className="w-full bg-transparent border-b-2 border-black py-2 placeholder:text-black/20 focus:outline-none focus:border-black transition-colors text-lg"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest block">Message</label>
                                                <textarea 
                                                    required
                                                    rows={4}
                                                    placeholder="ENTER MESSAGE BODY HERE..." 
                                                    className="w-full bg-transparent border-2 border-black p-4 placeholder:text-black/20 focus:outline-none transition-colors text-lg"
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                />
                                            </div>

                                            {status === 'error' && (
                                                <p className="text-xs text-red-600 font-bold uppercase tracking-tighter">
                                                    ! ERROR: {errorMessage}
                                                </p>
                                            )}

                                            <button 
                                                disabled={status === 'submitting'}
                                                type="submit" 
                                                className="w-full group relative flex items-center justify-between px-8 py-5 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all overflow-hidden"
                                            >
                                                <span className="text-sm font-bold uppercase tracking-[0.2em]">
                                                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                                </span>
                                                {status === 'submitting' ? (
                                                    <Loader2 size={20} className="animate-spin" />
                                                ) : (
                                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
