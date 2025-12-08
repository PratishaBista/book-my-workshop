import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis'; // Import default export from lenis
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero.tsx';
import IntroOverlay from '../components/landing/IntroOverlay';

const LandingPage: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);

  // Initialize Leins Smooth Scroll
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

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream-base text-deep-purple font-sans selection:bg-primary-orange selection:text-white">
      <AnimatePresence mode="sync">
        {!introFinished && (
          <IntroOverlay onComplete={() => setIntroFinished(true)} />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {introFinished && (
          <Navbar />
        )}

        {/* We keep Hero in DOM but maybe hidden or simple fade in? 
            If we delay showing it until intro is done, it's cleaner. */}
        {introFinished && (
          <main>
            <Hero />
            {/* Future sections: Features, Workshops, etc. */}
            <div className="h-screen"></div> {/* Spacer to test scroll */}
          </main>
        )}
      </div>
    </div>
  );
};

export default LandingPage;