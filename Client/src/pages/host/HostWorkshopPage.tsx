import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HostNavbar from '../../components/host/HostNavbar';
import HostHero from '../../components/host/HostHero';
import HostTrustedBy from '../../components/host/HostTrustedBy';
import HostTestimonials from '../../components/host/HostTestimonials';
import HostTeaser from '../../components/host/HostTeaser';
import Footer from '../../components/landing/Footer';

const HostWorkshopPage: React.FC = () => {
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
            <div className="relative z-10 font-sans">
                <HostNavbar />
                <main>
                    <HostHero />
                    <HostTrustedBy />
                    <HostTeaser />
                    <HostTestimonials />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default HostWorkshopPage;
