import { Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailure = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col selection:bg-orange-100">
            <Navbar />

            <main className="flex-grow flex items-center justify-center pt-32 pb-32 px-6">
                <div className="max-w-xl w-full text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-10"
                    >
                        <div className="w-24 h-24 bg-red-50 rounded-full mx-auto flex items-center justify-center text-red-500">
                            <AlertCircle size={48} strokeWidth={1.5} />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">Oh, no.</h1>
                            <p className="text-xl text-gray-500 leading-relaxed max-w-md mx-auto italic font-serif">
                                We couldn't complete your reservation because the payment didn't go through.
                            </p>
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest">
                            <button
                                onClick={() => window.history.back()}
                                className="w-full sm:w-auto px-10 py-5 bg-deep-purple text-white rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all shadow-lg shadow-deep-purple/10"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                            <Link
                                to="/"
                                className="w-full sm:w-auto px-10 py-5 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all"
                            >
                                <ArrowLeft size={18} />
                                Return Home
                            </Link>
                        </div>

                        <div className="pt-12 text-sm text-gray-400 font-serif italic">
                            If you think this is a mistake, please check your eSewa balance or contact our support team.
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentFailure;
