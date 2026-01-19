import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const testimonials = [
    {
        id: 1,
        text: "My hands were covered in clay and I’ve never felt more peaceful. A total core memory unlocked!",
        user: "Jangmu Sherpa",
        workshop: "Pottery & Peace",
        image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&q=80&w=400", // Hands on pottery wheel
        date: "Oct 2024"
    },
    {
        id: 2,
        text: "Took my mom here for her 60th. We painted, laughed, and made a mess. Best birthday gift ever.",
        user: "Ashita Tamang",
        workshop: "Mithila Art Basics",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400", // Painting action
        date: "Sept 2024"
    },
    {
        id: 3,
        text: "I didn’t know coffee could taste like blueberries until this workshop. The host was a wizard!",
        user: "Phurba Rai",
        workshop: "Barista 101",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=400", // Coffee brewing detail
        date: "Nov 2024"
    },
    {
        id: 4,
        text: "Walking out with my own handmade soap felt so empowering. Smells like lavender heaven!",
        user: "Priya Sharma",
        workshop: "Organic Soap Making",
        image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=400", // Soap making ingredients/hands
        date: "Aug 2024"
    },
    {
        id: 5,
        text: "Patience is a virtue, and Thangka painting teaches you exactly that. A spiritual experience.",
        user: "Aarohan Basnet",
        workshop: "Thangka Masterclass",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400", // Art detail
        date: "Dec 2024"
    }
];

const Testimonials: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-deep-purple">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">

                <div className="absolute top-12 left-6 md:left-12 z-20 pointer-events-none">
                    <h2 className="text-cream-base font-serif text-3xl md:text-5xl leading-tight drop-shadow-lg">
                        Kind words from <br />
                        <span className="opacity-70 italic">our makers</span>
                    </h2>
                </div>

                <motion.div
                    style={{ x }}
                    className="flex gap-6 md:gap-12 pl-[10vw] md:pl-[20vw] items-center"
                >
                    {testimonials.map((t, i) => (
                        <div
                            key={t.id}
                            className={`relative w-[280px] md:w-[320px] flex-shrink-0 group ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-500`}
                        >
                            <div className="bg-[#fffcf5] p-6 pb-8 rounded-sm shadow-xl flex flex-col items-center text-center relative">

                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#E8A585]/80 opacity-90 rotate-1 shadow-sm"></div>

                                <div className="w-full aspect-[4/3] bg-gray-100 mb-6 p-2 shadow-inner">
                                    <div className="w-full h-full overflow-hidden relative">
                                        <img src={t.image} alt={t.workshop} className="w-full h-full object-cover sepia-[.2] group-hover:sepia-0 transition-all duration-500" />

                                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-mono text-gray-500 tracking-tighter">
                                            {t.date}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 text-primary-orange mb-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>

                                <h4 className="font-serif text- deep-purple text-xl mb-2">{t.workshop}</h4>

                                <p className="font-sans text-gray-600 text-sm italic leading-relaxed mb-4 line-clamp-3">
                                    "{t.text}"
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                                    <p className="font-sans text-deep-purple text-sm">
                                        {t.user}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))}

                    <div className="relative w-[300px] flex-shrink-0 flex items-center justify-center">
                        <div className="text-center group cursor-pointer">
                            <p className="text-cream-base font-serif text-xl border-b border-cream-base/30 inline-block pb-1">
                                Read more stories
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
