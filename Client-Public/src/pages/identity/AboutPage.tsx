import React from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-[#FDFCF8] min-h-screen">
            <Navbar />
            
            <main className="pt-48 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto font-mono text-black selection:bg-black selection:text-white">
                    {/* Header Styling */}
                    <div className="mb-16">
                        <div className="flex items-baseline justify-between border-b-4 border-black pb-2">
                            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter flex items-center gap-4">
                                ABOUT
                                <span className="hidden md:inline-block">
                                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 30C10 15 25 5 45 5C65 5 80 15 80 30M10 30C10 45 25 55 45 55C65 55 80 45 80 30M80 30C80 30 85 30 90 30M110 30C110 15 95 5 75 5C55 5 40 15 40 30M110 30C110 45 95 55 75 55C55 55 40 45 40 30" stroke="black" strokeWidth="3"/>
                                        <circle cx="45" cy="30" r="15" stroke="black" strokeWidth="2" strokeDasharray="4 4"/>
                                        <circle cx="75" cy="30" r="15" stroke="black" strokeWidth="2" strokeDasharray="4 4"/>
                                    </svg>
                                </span>
                            </h1>
                        </div>
                        <p className="mt-4 text-xs font-bold tracking-widest uppercase">
                            BookMyWorkshop Corp: Notes on our origins, vision, and the founder.
                        </p>
                    </div>

                    {/* Founder Section */}
                    <section className="mb-24 flex flex-col items-center">
                        <div className="w-64 h-64 bg-gray-100 border-4 border-black overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 rounded-full">
                            <img 
                                src="https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                alt="Founder group"
                                className="w-full h-full object-cover grayscale contrast-125"
                            />
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-[8px] font-bold whitespace-nowrap">
                                THE FOUNDING TEAM
                            </div>
                        </div>
                        
                        <div className="max-w-2xl text-center">
                            <h2 className="text-4xl font-bold mb-8 italic leading-none">"An invitation to come back to shared spaces."</h2>
                            <div className="space-y-6 text-sm leading-relaxed text-black/80">
                                <p>
                                    Learning together in a social environment, gathering with people, creating, and sharing experiences has been shown to support mental health and promote well-being. As we increasingly observe people spending more time on digital devices and less time engaging with one another in real life, this platform exists to encourage a return to meaningful social interaction.
                                </p>
                                <p>
                                    It is an invitation to come back to shared spaces: to learn together, create together, and reconnect through experience. At the same time, it aims to preserve crafts, skills, and forms of knowledge that are slowly disappearing and may no longer be accessible in the near future.
                                </p>
                                <p>
                                    This platform was born from that necessity and that need to foster human connection, protect creative traditions, and promote the overall well-being of individuals and communities.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
