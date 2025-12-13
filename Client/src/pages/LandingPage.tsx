import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import IntroOverlay from '../components/landing/IntroOverlay';
import Footer from '../components/landing/Footer';
import CategoryDiscovery from '../components/landing/CategoryDiscovery';
import Teaser from '../components/landing/Teaser';
import WorkshopListing from '../components/landing/WorkshopListing';
import Testimonials from '../components/landing/Testimonials';
import TrustedBy from '../components/landing/TrustedBy';
import Stories from '../components/landing/Stories';
import BecomeHost from '../components/landing/BecomeHost';

const LandingPage: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);

  // Initialize Lenis Smooth Scroll
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

      <div className="relative z-10 font-sans">
        {introFinished && <Navbar />}

        {introFinished && (
          <main>
            <Hero />
            <CategoryDiscovery />
            <WorkshopListing />
            <Testimonials />
            <TrustedBy />
            <BecomeHost />
            <Teaser />
            <Stories />
          </main>
        )}

        {introFinished && <Footer />}
      </div>
    </div>
  );
};

export default LandingPage;