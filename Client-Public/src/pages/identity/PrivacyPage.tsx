import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, HelpCircle } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream-base text-deep-purple font-sans flex flex-col">
            <Navbar minimal={true} />

            <div className="h-28" />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="border-b border-deep-purple/10 pb-8">
                        <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary-orange block mb-3 font-bold">
                            Information Security
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-deep-purple flex items-center gap-3">
                            <Shield className="text-primary-orange shrink-0" size={32} />
                            Privacy Policy
                        </h1>
                        <p className="text-sm text-deep-purple/50 font-mono mt-4">
                            Last Updated: May 30, 2026
                        </p>
                    </div>

                    <div className="bg-white/40 border border-deep-purple/5 p-6 rounded-3xl backdrop-blur-sm shadow-sm flex items-start gap-4">
                        <Eye className="text-primary-orange shrink-0 mt-1" size={20} />
                        <p className="text-sm text-deep-purple/70 leading-relaxed font-medium">
                            At BookMyWorkshop, we take digital data protection and transparency seriously. We believe in providing you absolute control over your digital identity, in line with modern standard compliance frameworks.
                        </p>
                    </div>

                    <article className="space-y-10 font-medium text-deep-purple/80 leading-[1.8] text-base">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                1. Personal Identity Data We Collect
                            </h3>
                            <p>
                                When registering on our platform as a student or host, we gather your primary account credentials, including your full name, email address, password hash, and optional telephone digits. For verified hosts, we securely hold identity documentation (government-issued certificates and PAN files) strictly for vetting.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                2. Transaction Records & Cookies
                            </h3>
                            <p>
                                Financial details are routed through Stripe or eSewa APIs. The platform never holds your credit card number or bank credentials directly. We use local browser caches, cookies, and system logs to save your visual settings, remember active login tokens, and track recent search keywords for recommendation lists.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                3. GDPR Art. 20 Data Portability Integration
                            </h3>
                            <p>
                                Consistent with global best practices in data sovereignty, you can utilize the interactive **Data Exporter** within your Account Privacy Dashboard. Clicking "Request Data Export" immediately compiles your profile structure, settings configurations, and transaction logs into an open, machine-readable `.json` document directly downloadable to your local disk.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                4. Right to Deletion & Minimization
                            </h3>
                            <p>
                                You can purge recommendation search traces and viewed workshop metrics instantly using the **Purge Search Cache** button in your settings tab. Additionally, under the Account Lifecycle panel, you hold the right to deactivate your profile temporarily or permanently delete your account, wiping all personal identifiers from our databases.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                5. Information Security Controls
                            </h3>
                            <p>
                                We add secure encryption protocols for data transfers. Two-Factor Authentication (2FA) is available to protect host and user accounts from brute-force attempts. We do not sell, rent, or lease your creative preferences or personal directories to third-party marketing entities.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                6. Contact & Data Protection Officer
                            </h3>
                            <p className="flex items-center gap-2">
                                <Database className="text-primary-orange shrink-0" size={16} />
                                If you have questions regarding this Privacy Policy or wish to request database corrections, please submit a support ticket via the Contact page or email our data protection officer directly at **privacy@bookmyworkshop.com**.
                            </p>
                        </section>
                    </article>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
