import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HostHero: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, hasBusinessName: e.target.checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
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

            const response = await fetch('https://localhost:7166/api/auth/provider/signup', {
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
                // If text response
                if (typeof data === 'string') {
                    setError(data);
                    setLoading(false);
                    return;
                }

                // Handle API error structure (ASP.NET Identity often returns array of errors)
                if (Array.isArray(data)) {
                    // Extract descriptions if array of object, or strings
                    const messages = data.map((err: any) => err.description || err.code || JSON.stringify(err)).join(', ');
                    setError(messages || 'Registration failed');
                } else if (data.message) {
                    setError(data.message);
                } else if (typeof data === 'string') {
                    setError(data);
                } else {
                    setError('Registration failed. Please try again.');
                }
                setLoading(false);
                return;
            }

            // Success: Store token & redirect
            // Success: Registration complete. Now auto-verify (Dev) or Login logic
            // The API returns { message, token } (NOT a login token, but EmailConfirmationToken)

            if (data.token) {
                // Auto-verify for development convenience
                try {
                    const verifyResponse = await fetch('https://localhost:7166/api/auth/verify-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email, token: data.token })
                    });

                    if (verifyResponse.ok) {
                        // After verification, we must LOGIN to get the actual JWT
                        const loginResponse = await fetch('https://localhost:7166/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: formData.email, password: formData.password })
                        });

                        const loginData = await loginResponse.json();

                        if (loginResponse.ok) {
                            localStorage.setItem('token', loginData.token);
                            localStorage.setItem('tokenExpiry', loginData.expiry);
                            localStorage.setItem('isApproved', (loginData.isApproved || false).toString());
                            navigate('/host/dashboard');
                            return;
                        }
                    }
                } catch (verifyErr) {
                    console.error("Auto-verification failed", verifyErr);
                }

                // Fallback if auto-verify/login fails
                alert('Registration successful! Please check your email to verify your account.');
                navigate('/login');
            } else {
                alert('Registration successful! Please check your email.');
                navigate('/login');
            }

        } catch (err) {
            console.error(err);
            setError('Something went wrong. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="pt-24 pb-12 bg-cream-base min-h-screen flex items-center" id="register">
            <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12">

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
                        {/* Placeholder for the painting image in the screenshot */}
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
                            <h3 className="text-2xl font-bold text-deep-purple mb-2">Learn more</h3>
                            <p className="text-sm text-gray-500">Create your host account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

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
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="At least 8 characters"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Confirm password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">How did you hear about us?</label>
                                <input
                                    type="text"
                                    name="referralSource"
                                    value={formData.referralSource}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                                />
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
        </section>
    );
};

export default HostHero;
