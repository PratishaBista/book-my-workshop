import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import IntroOverlay from '../../components/landing/IntroOverlay';
import Footer from '../../components/landing/Footer';
import Teaser from '../../components/landing/Teaser';
import WorkshopListing from '../../components/landing/WorkshopListing';
import Testimonials from '../../components/landing/Testimonials';
import TrustedBy from '../../components/landing/TrustedBy';
import Stories from '../../components/landing/Stories';
import BecomeHost from '../../components/landing/BecomeHost';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [introFinished, setIntroFinished] = useState(() => {
    return sessionStorage.getItem('introShown') === 'true';
  });

  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [hasDismissedCta, setHasDismissedCta] = useState(false);
  const workshopRef = useRef<HTMLDivElement>(null);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introShown', 'true');
    setIntroFinished(true);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleScroll = () => {
      if (hasDismissedCta) return;
      
      const scrollPosition = window.scrollY + window.innerHeight;
      const workshopSection = document.getElementById('explore-workshops');
      
      if (workshopSection) {
        const sectionTop = workshopSection.offsetTop;
        if (scrollPosition > sectionTop + 200) {
          setShowFloatingCta(true);
        } else {
          setShowFloatingCta(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasDismissedCta]);

  return (
    <div className="min-h-screen bg-cream-base text-deep-purple font-sans selection:bg-primary-orange selection:text-white">
      <AnimatePresence mode="sync">
        {!introFinished && (
          <IntroOverlay onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <div className="relative z-10 font-sans">
        {introFinished && <Navbar />}

        {introFinished && (
          <main>
            <Hero />
            <div id="explore-workshops">
              <WorkshopListing />
            </div>
            <Testimonials />
            <TrustedBy />
            <BecomeHost />
            <Teaser />
            <Stories />
          </main>
        )}

        {introFinished && <Footer />}
      </div>

      <AnimatePresence>
        {showFloatingCta && !hasDismissedCta && !isAuthenticated && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-10 left-10 z-[100] hidden md:block"
            >
                <div className="relative group">
                    <button 
                        onClick={() => {
                          setShowFloatingCta(false);
                          setHasDismissedCta(true);
                        }}
                        className="absolute -top-3 -right-3 w-7 h-7 bg-[#000000] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    <button 
                        onClick={() => {
                            setShowFloatingCta(false);
                            setHasDismissedCta(true);
                            navigate('/login');
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

export default LandingPage;