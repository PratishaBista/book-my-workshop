import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Gavel } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const TermsPage: React.FC = () => {
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
                            Legal Framework
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-deep-purple flex items-center gap-3">
                            <FileText className="text-primary-orange shrink-0" size={32} />
                            Terms of Service
                        </h1>
                        <p className="text-sm text-deep-purple/50 font-mono mt-4">
                            Last Updated: May 30, 2026
                        </p>
                    </div>

                    <div className="bg-white/40 border border-deep-purple/5 p-6 rounded-3xl backdrop-blur-sm shadow-sm flex items-start gap-4">
                        <Scale className="text-primary-orange shrink-0 mt-1" size={20} />
                        <p className="text-sm text-deep-purple/70 leading-relaxed font-medium">
                            Please review these terms carefully before utilizing BookMyWorkshop. By using our platform to list, search, or book handmade artisan workshop experiences, you agree to comply with and be bound by these Terms of Service.
                        </p>
                    </div>

                    <article className="space-y-10 font-medium text-deep-purple/80 leading-[1.8] text-base">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                1. Services Provided & Scope
                            </h3>
                            <p>
                                BookMyWorkshop acts as a premier community-based marketplace bridging local artisan hosts ("Hosts") with students and creative enthusiasts ("Students"). We facilitate the booking of hands-on physical classes, workshop registrations, gift card vouchers, and digital wallets to secure transaction values.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                2. Account Security & Verification
                            </h3>
                            <p>
                                When creating a member profile, you are responsible for maintaining exact credentials. Hosts are subject to verification controls, including government-issued identification uploads and PAN certificates. If you choose to enable Two-Factor Authentication (2FA), you are solely responsible for protecting your secret authenticator keys.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                3. Payment Processing & VAT Rules
                            </h3>
                            <p>
                                Payments are verified and executed securely through sandbox integrations, specifically **Stripe** (international credit/debit card processing) and **eSewa** (local wallet routing). 
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2 text-deep-purple/70">
                                <li>All prices listed on the platform are determined exclusively by the respective workshop host.</li>
                                <li>The platform collects a default commission rate from the listing amount to manage server architectures.</li>
                                <li>In compliance with regional directives, a **13% Value Added Tax (VAT)** is levied directly on the platform's commission rather than the student's booking total.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                4. Cancellations, Refunds & Gift Vouchers
                            </h3>
                            <p>
                                Students may request a booking cancellation subject to host timelines. Approved refund amounts are transferred directly back to the student's **BookMyWorkshop Digital Wallet** to facilitate future bookings. Vouchers purchased through the **Gift Card Portal** are non-refundable once claimed.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                5. User Conduct & Sentiment Moderation
                            </h3>
                            <p>
                                By submitting reviews, comments, or workshop images, you warrant that you are providing authentic feedback based on confirmed attendance. Reviews are monitored using **sentiment classification models**. Offensive or false feedback will be flagged automatically and deleted to protect studio reputations.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold font-serif text-deep-purple flex items-center gap-2">
                                6. Governing Law
                            </h3>
                            <p className="flex items-center gap-2">
                                <Gavel className="text-primary-orange shrink-0" size={16} />
                                These terms and platform transactions shall be governed by, interpreted, and enforced in accordance with the prevailing laws of the Federal Democratic Republic of Nepal.
                            </p>
                        </section>
                    </article>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsPage;
