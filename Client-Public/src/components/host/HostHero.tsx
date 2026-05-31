import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Plus, X } from 'lucide-react';
import { AnimatedHoverText } from '../ui/AnimatedHoverText';
import { API_ENDPOINTS } from '../../config/api';
import Toast from '../ui/Toast';
import type { ToastType } from '../ui/Toast';

const HostHero: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showFloatingCta, setShowFloatingCta] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFloatingCta(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    // Password Strength
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        hasBusinessName: false,
        businessName: '',
        state: '',
        website: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralSource: ''
    });

    // Toast is handled by internal useEffect in Toast component
    const checkPasswordStrength = (pwd: string) => {
        setPasswordStrength({
            hasMinLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecial: /[@$!%*?&#]/.test(pwd)
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, hasBusinessName: e.target.checked }));
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName) return "Name is required.";
        if (!formData.state) return "Please select your state.";
        if (!formData.phone) return "Mobile phone number is required.";
        if (!formData.email) return "Email is required.";
        if (!formData.password) return "Password is required.";
        if (formData.password.length < 8) return "Password must be at least 8 characters.";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Client-side Validation
        const validationError = validateForm();
        if (validationError) {
            showToast(validationError, 'error');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                businessName: formData.hasBusinessName ? formData.businessName : `${formData.firstName} ${formData.lastName}'s Workshop`,
                contactPerson: `${formData.firstName} ${formData.lastName}`,
                phoneNumber: formData.phone,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                state: formData.state,
                website: formData.website,
                referralSource: formData.referralSource
            };

            console.log("Sending Provider Signup Payload:", payload);
            const response = await fetch(API_ENDPOINTS.auth.providerSignup, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                console.error("Provider Signup Failed:", data);
                if (typeof data === 'object' && data.errors) {
                    const messages = Object.values(data.errors).flat().join(' ');
                    showToast(messages || 'Validation failed.', 'error');
                } else if (Array.isArray(data)) {
                    const messages = data.map((err: any) => err.description || err.code).join(', ');
                    showToast(messages || 'Registration failed.', 'error');
                } else if (typeof data === 'object' && data.message) {
                    showToast(data.message, 'error');
                } else if (typeof data === 'string') {
                    showToast(data, 'error');
                } else {
                    showToast('Registration failed. Please check your inputs.', 'error');
                }
                setLoading(false);
                return;
            }

            // Success - Email sent with verification link
            showToast('Registration successful! Please verify your email.', 'success');

            localStorage.removeItem('token');
            localStorage.removeItem('isApproved');

            setTimeout(() => {
                window.location.href = 'http://localhost:5174/login';
            }, 2000);

        } catch (err) {
            console.error(err);
            showToast('Network error. Is the server running?', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-[#FCFBF7] relative">

            <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden border-b border-deep-purple/5">
                <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-xl"
                    >
                        <h1 className="text-4xl md:text-[3.5rem] font-serif font-medium text-[#1A1A1A] leading-[1.1] tracking-tight mb-6">
                            Host Creative Workshops in Your Space
                        </h1>
                        <p className="text-lg md:text-xl text-deep-purple/80 font-sans mb-10 leading-relaxed font-medium">
                            Share your craft. We bring the participants and handle bookings.
                        </p>

                        <div className="space-y-4 mb-12">
                            <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#1A1A1A]/70">
                                <span className="w-1.5 h-1.5 bg-primary-orange rounded-full"></span>
                                In-person experiences
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#1A1A1A]/70">
                                <span className="w-1.5 h-1.5 bg-primary-orange rounded-full"></span>
                                Community-based learning
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#1A1A1A]/70">
                                <span className="w-1.5 h-1.5 bg-primary-orange rounded-full"></span>
                                Local participants
                            </div>
                        </div>

                        <button
                            onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-[#1A1A1A] text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-primary-orange transition-colors shadow-lg"
                        >
                            Apply to Host
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mt-8 lg:mt-0"
                    >
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-deep-purple/5 relative z-10">
                            <h3 className="text-sm font-bold text-primary-orange uppercase tracking-widest mb-8">How it works</h3>

                            <div className="space-y-6 relative">
                                <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-100"></div>

                                {[
                                    "Apply as a host",
                                    "We review & help shape your workshop",
                                    "Your workshop goes live on the platform",
                                    "Participants book through us",
                                    "You host, we manage payments & logistics"
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-5 relative z-10 group">
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0 group-hover:border-primary-orange group-hover:text-primary-orange group-hover:bg-primary-orange/5 transition-all shadow-sm">
                                            0{idx + 1}
                                        </div>
                                        <div className="pt-2.5 flex-1">
                                            <p className="text-[15px] font-bold text-[#1A1A1A]/80 leading-snug">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary-orange/10 rounded-full blur-3xl -z-10"></div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col lg:flex-row items-baseline justify-between gap-12 mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-5xl font-serif text-[#1A1A1A] mb-4">Who can host?</h2>
                            <p className="text-lg text-deep-purple/60 leading-relaxed">
                                Expertise is welcome, but <span className="text-primary-orange font-bold">passion matters more.</span>
                                We invite everyone from lifelong artisans to weekend hobbyists.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Culinary Experts', desc: 'Bakers, chefs, & cooks.' },
                            { title: 'Visual Artists', desc: 'Painters, potters, & creators.' },
                            { title: 'Designers', desc: 'Fashion & digital designers.' },
                            { title: 'Craftspeople', desc: 'Knitters & jewelry makers.' },
                            { title: 'Studio Owners', desc: 'Venue & space owners.' },
                            { title: 'Creatives', desc: 'Workshop organizers.' },
                            { title: 'Hobbyists', desc: 'Passionate enthusiasts.' },
                            { title: 'And You', desc: 'Bring your unique craft.' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-6 rounded-2xl bg-[#FCFBF7] border border-gray-100 hover:bg-white hover:border-primary-orange/20 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-orange/20 group-hover:bg-primary-orange transition-colors"></div>
                                    <h5 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">{item.title}</h5>
                                </div>
                                <p className="text-xs text-deep-purple/50 leading-relaxed ml-4">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-28 bg-deep-purple overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-primary-orange/5 rounded-full blur-[120px] -mt-64 -ml-32"></div>
                
                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <h3 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                                Focus on the craft. <br />
                                <span className="text-primary-orange italic">We'll handle the rest.</span>
                            </h3>
                            
                            <div className="space-y-10">
                                <div className="flex items-start gap-8 group">
                                    <div className="pt-2">
                                        <div className="w-12 h-1 bg-white/10 transition-all group-hover:bg-primary-orange group-hover:w-16"></div>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-4">You Focus On</h5>
                                        <ul className="space-y-4">
                                            {['Teaching your craft', 'Creating the experience', 'Leading the interaction'].map((txt, i) => (
                                                <li key={i} className="text-2xl font-serif text-white/90">{txt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start gap-8 group">
                                    <div className="pt-2">
                                        <div className="w-12 h-1 bg-white/10 transition-all group-hover:bg-primary-orange group-hover:w-16"></div>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-4">We Handle</h5>
                                        <ul className="space-y-4">
                                            {['Discovery & Promotion', 'Booking & Ticketing', 'Payments & Logistics'].map((txt, i) => (
                                                <li key={i} className="text-2xl font-serif text-white/90">{txt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center h-full">
                            <button 
                                onClick={() => navigate('/workshops')}
                                className="group flex flex-col items-center gap-8 text-center"
                            >
                                <div className="p-12 rounded-full border border-white/10 group-hover:bg-primary-orange group-hover:border-primary-orange transition-all duration-500 shadow-2xl relative bg-white/5">
                                    <div className="absolute inset-0 bg-primary-orange/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <ArrowRight className="w-12 h-12 text-white group-hover:text-white transition-colors relative z-10" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-3xl md:text-5xl font-serif text-white transition-colors group-hover:text-primary-orange block px-6">
                                        <AnimatedHoverText text="See our hosted workshops" />
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-32 pb-32 bg-white flex flex-col items-center justify-center relative overflow-hidden" id="register">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

                <div className="max-w-4xl mx-auto px-6 w-full relative z-10">
                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-white p-8 md:p-16 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-deep-purple/5"
                        >
                            <div className="mb-12 text-center">
                                <h3 className="text-3xl font-serif text-[#1A1A1A] mb-3">Create your host account</h3>
                                <p className="text-base text-deep-purple/40">It only takes a few minutes to start your first hosting experience.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">First / preferred name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Last name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 py-1">
                                    <input
                                        type="checkbox"
                                        id="hasBusinessName"
                                        name="hasBusinessName"
                                        checked={formData.hasBusinessName}
                                        onChange={handleCheckboxChange}
                                        className="w-4 h-4 text-primary-orange rounded border-gray-300 focus:ring-primary-orange"
                                    />
                                    <label htmlFor="hasBusinessName" className="text-sm text-gray-600">Add business name</label>
                                </div>

                                {formData.hasBusinessName && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                    >
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                        />
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Main state *</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all appearance-none"
                                    >
                                        <option value="">Please select</option>
                                        <option value="Bagmati">Bagmati</option>
                                        <option value="Gandaki">Gandaki</option>
                                        <option value="Lumbini">Lumbini</option>
                                        <option value="Koshi">Koshi</option>
                                        <option value="Madhesh">Madhesh</option>
                                        <option value="Karnali">Karnali</option>
                                        <option value="Sudurpashchim">Sudurpashchim</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Show us what you do (Website / Instagram)</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="E.g. your website / Insta / Facebook link"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mobile phone *</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">NP</div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">We'll verify this. Only shown to customers.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Won't be shown publicly"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Create password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="8+ chars"
                                                className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        {formData.password && (
                                            <div className="mt-2 space-y-1 text-[10px]">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                                                        {passwordStrength.hasMinLength ? '✓' : '○'} 8+ chars
                                                    </span>
                                                    <span className={passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}>
                                                        {passwordStrength.hasUppercase ? '✓' : '○'} Upper
                                                    </span>
                                                    <span className={passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}>
                                                        {passwordStrength.hasLowercase ? '✓' : '○'} Lower
                                                    </span>
                                                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                                                        {passwordStrength.hasNumber ? '✓' : '○'} Num
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Confirm password *</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">How did you hear about us?</label>
                                    <select
                                        name="referralSource"
                                        value={formData.referralSource}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all appearance-none text-gray-700"
                                    >
                                        <option value="">Please select</option>
                                        <option value="Social Media">Social Media (Instagram/Facebook)</option>
                                        <option value="Friend/Family">Friend or Family</option>
                                        <option value="Google Search">Google Search</option>
                                        <option value="Advertisement">Advertisement</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                            <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-primary-orange text-white font-bold rounded-xl transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Registering...' : 'Register'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>

                <Toast
                    isVisible={toast.isVisible}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />
            </section>

            <section className="py-32 bg-white border-t border-gray-50">
                <div className="max-w-4xl mx-auto px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">FAQs</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { 
                                q: "Is this online or in-person?", 
                                a: "BookMyWorkshop is focused on tangible, in-person experiences. We believe the best learning happens together in the same space." 
                            },
                            { 
                                q: "Do I need a professional studio?", 
                                a: "Not at all. You can host in your kitchen, living room, garden, or a rented community space. What matters is the atmosphere you create." 
                            },
                            { 
                                q: "Can beginners really host?", 
                                a: "Absolutely. If you have a skill you're passionate about and can explain clearly, you're a host. You don't need a formal teaching degree." 
                            },
                            { 
                                q: "How do payments work?", 
                                a: (
                                    <>
                                        Participants pay through our secure platform. After your workshop is complete, we transfer your earnings directly to your bank account within 3-5 business days. 
                                        You can read more about our <button onClick={() => navigate('/payment-policy')} className="text-primary-orange font-bold hover:underline decoration-2 underline-offset-4">full payment and payout policy here</button>.
                                    </>
                                ) 
                            },
                            { 
                                q: "Who provides the materials?", 
                                a: "You decide. You can include materials in your workshop price, or ask participants to bring their own. Just clearly state this in your listing." 
                            },
                            { 
                                q: "Can I host occasionally?", 
                                a: "Yes. You have total control over your schedule. Host once a week, once a month, or just once a year. There are no minimum requirements." 
                            },
                            { 
                                q: "What if nobody books?", 
                                a: "There's no cost to you. If no one books, you don't pay anything. We only win when you win. Our marketing team also works to boost visibility for new hosts." 
                            },
                            { 
                                q: "What cities do you operate in?", 
                                a: "We are currently hyper-focused on major hubs in Nepal (Kathmandu, Pokhara, Lalitpur), but any host across the country is welcome to apply." 
                            }
                        ].map((faq, idx) => (
                            <div 
                                key={idx} 
                                className={`border border-gray-100 rounded-[2rem] transition-all duration-300 ${openFaq === idx ? 'bg-[#FCFBF7] border-primary-orange/20 shadow-lg' : 'bg-white hover:border-[#1A1A1A]/10'}`}
                            >
                                <button 
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full px-8 py-8 flex items-center justify-between text-left"
                                >
                                    <span className="text-xl font-serif text-[#1A1A1A]">{faq.q}</span>
                                    <div className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-45 text-primary-orange' : 'text-[#1A1A1A]/30'}`}>
                                        <Plus className="w-6 h-6" />
                                    </div>
                                </button>
                                <motion.div 
                                    initial={false}
                                    animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 pb-10 text-deep-purple/60 leading-relaxed text-lg max-w-2xl">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {showFloatingCta && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-10 left-10 z-[100] hidden md:block"
                    >
                        <div className="relative group">
                            <button 
                                onClick={() => setShowFloatingCta(false)}
                                className="absolute -top-3 -right-3 w-7 h-7 bg-[#000000] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>

                            <button 
                                onClick={() => {
                                    setShowFloatingCta(false);
                                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-white px-10 py-6 pr-12 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center min-w-[180px] hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-xl font-black text-[#000000] tracking-tight">
                                    Sign up!
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HostHero;
