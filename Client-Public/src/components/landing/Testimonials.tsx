import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const testimonials = [
    {
        id: 1,
        text: "My hands were covered in clay and I've never felt more peaceful.",
        user: "Jangmu Sherpa",
        workshop: "Pottery & Peace",
        image: "https://i.pinimg.com/1200x/8a/84/73/8a8473687b75e57958f332616845f7b2.jpg",
        date: "Oct 2024"
    },
    {
        id: 2,
        text: "Took my mom here for her 60th. We painted, laughed. Best birthday gift ever.",
        user: "Phurba Rai",
        workshop: "Mithila Art Basics",
        image: "https://i.pinimg.com/1200x/da/53/3d/da533da89ecd6e835cf3c3b297a3fa31.jpg",
        date: "Sept 2024"
    },
    {
        id: 3,
        text: "I didn't know coffee could taste like blueberries until this workshop.",
        user: "Ashita Tamang",
        workshop: "Barista 101",
        image: "https://i.pinimg.com/736x/fd/8d/3f/fd8d3fb03c4a6263aeb5f3fe17661565.jpg",
        date: "Nov 2024"
    },
    {
        id: 4,
        text: "Walking out with my own handmade soap felt so empowering",
        user: "Priya Sharma",
        workshop: "Organic Soap Making",
        image: "https://i.pinimg.com/736x/d6/0f/60/d60f60b2f7e1ae392f29424790a94dc4.jpg",
        date: "Aug 2024"
    },
];

const Testimonials: React.FC = () => {
    const navigate = useNavigate();
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);
    const handleNavigate = () => {
        navigate('/reviews');
    };

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-deep-purple">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="absolute top-12 left-6 md:left-12 z-20 pointer-events-none">
                    <h2 className="text-cream-base font-serif text-3xl md:text-5xl leading-tight drop-shadow-lg">
                        Reviews
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

                                <div className="w-full mb-6 p-2 shadow-inner">
                                    <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden rounded-sm">
                                        <img 
                                            src={t.image} 
                                            alt={t.workshop} 
                                            className="absolute inset-0 w-full h-full object-cover sepia-[.2] group-hover:sepia-0 transition-all duration-500"
                                        />
                                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-mono text-gray-500 tracking-tighter z-10">
                                            {t.date}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 text-primary-orange mb-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <h4 className="font-serif text-deep-purple text-xl mb-2">{t.workshop}</h4>

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
                        <div
                            onClick={handleNavigate}
                            className="text-center group cursor-pointer"
                        >
                            <p className="text-cream-base font-serif text-xl border-b border-cream-base/30 inline-block pb-1 hover:border-cream-base transition-colors duration-300">
                                Read more
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;