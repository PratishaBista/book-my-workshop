import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Toast from '../ui/Toast';
import type { ToastType } from '../ui/Toast';

const HostHero: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Toast State
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

        // 1. Client-side Validation
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

            // Explicitly clear any old tokens to prevent "Identity Crisis"
            localStorage.removeItem('token');
            localStorage.removeItem('isApproved');

            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            console.error(err);
            showToast('Network error. Is the server running?', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="pt-24 pb-12 bg-cream-base min-h-screen flex items-center" id="register">
            <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-start gap-12">

                {/* Left Side: Image & Text */}
                <div className="md:w-1/2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="font-serif text-5xl md:text-6xl font-bold text-deep-purple leading-tight mb-6">
                            Teach with <span className="text-primary-orange">BookMyWorkshop</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-md">
                            Attract a wider audience for your classes, and streamline your admin.
                            It only takes a few minutes to set up. We're looking forward to partnering with you!
                        </p>
                    </motion.div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                        <img
                            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"
                            alt="Art Workshop"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="md:w-1/2 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-deep-purple mb-2">Create your host account</h3>
                            <p className="text-sm text-gray-500">Sign up to start hosting your classes</p>
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
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🇳🇵</div>
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

                                    {/* Password Strength Meter */}
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

                <Toast
                    isVisible={toast.isVisible}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

            </div>
        </section>
    );
};

export default HostHero;
