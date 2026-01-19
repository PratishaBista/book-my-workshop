import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
    return (
        <div className="min-h-screen bg-cream-base flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="text-red-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-deep-purple">Payment Failed</h2>
                    <p className="text-gray-500">
                        We couldn't process your payment. Please try again or contact support if the issue persists.
                    </p>
                    <Link
                        to="/"
                        className="inline-block mt-4 px-8 py-3 bg-deep-purple text-white rounded-xl font-bold hover:bg-deep-purple/90 transition-all"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentFailure;
