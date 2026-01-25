import React from 'react';
import HostNavbar from '../../components/host/HostNavbar';
import HostHero from '../../components/host/HostHero';
import HostTeaser from '../../components/host/HostTeaser';
import HostTrustedBy from '../../components/host/HostTrustedBy';
import HostTestimonials from '../../components/host/HostTestimonials';
import Footer from '../../components/landing/Footer';

const HostWorkshopPage: React.FC = () => {
    return (
        <div className="bg-[#FDFBF7] min-h-screen font-sans text-deep-purple selection:bg-primary-orange/20">
            <HostNavbar />
            <main>
                <HostHero />
                <HostTrustedBy />
                <HostTeaser />
                <HostTestimonials />
            </main>
            <div className="border-t border-deep-purple/5">
                <Footer />
            </div>
        </div>
    );
};

export default HostWorkshopPage;
