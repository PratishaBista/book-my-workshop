import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Ghost } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="bg-[#FDFCF8] min-h-screen flex flex-col items-center justify-center p-6 md:p-12 font-mono text-black selection:bg-black selection:text-white">
            <div className="w-full max-w-lg flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-100 border-4 border-black relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 flex items-center justify-center">
                     <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     >
                        <Ghost size={64} strokeWidth={2} />
                     </motion.div>
                     <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-0.5 text-[8px] font-bold">
                        ERROR_404
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter uppercase italic">Page Not Found</h1>
                    <p className="text-sm leading-relaxed text-black/60 mb-10 max-w-sm mx-auto">
                        The page you are looking for has been moved, deleted, or never existed in the first place.
                    </p>
                    
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-black/80 transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};


export default NotFoundPage;
