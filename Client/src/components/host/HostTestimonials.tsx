import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const testimonials = [
    {
        id: 1,
        text: "I used to manage bookings on spreadsheets. BookMyWorkshop automated everything. Now I just focus on teaching art!",
        user: "Sujata Pradhan",
        workshop: "Pradhan Art Studio",
        image: "https://artiststudiofinder.org/wp-content/uploads/2024/03/BOW-ARTS-OPEN-DAYS-2023-X-PRIMROSE.FILMS116-scaled.jpg", // Artist in studio
        date: "Joined 2023"
    },
    {
        id: 2,
        text: "The exposure we get here is unmatched. We filled our weekend pottery classes for 3 months straight.",
        user: "Ramesh & Sunita",
        workshop: "Clay & Wheel",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqkEEC23cmEU1EhfnR8misxxmY9nU06spFZg&s", // Potters working
        date: "Joined 2023"
    },
    {
        id: 3,
        text: "Finally, a platform that understands what workshop hosts need. Payments are on time, and support is great.",
        user: "Amit Karki",
        workshop: "Kathmandu Cooking Class",
        image: "https://www.shepherdholidays.com/_next/image?url=https%3A%2F%2Ffis-api.shepherdholidays.com%2Fmedia%2Ffeatured%2Fcooking-class-in-kathmandu-1758365936.jpg&w=1024&q=75", // Chef cooking
        date: "Joined 2024"
    },
    {
        id: 4,
        text: "Turning my floral arrangement hobby into a business was scary, but this platform made it so easy.",
        user: "Meera Shrestha",
        workshop: "Meera's Blooms",
        image: "https://cdn.shopify.com/s/files/1/0447/8350/1468/files/Floral_Materials_for_Bouquet_Making_480x480.png?v=1730771235", // Flower arrangement
        date: "Joined 2024"
    }
];

const HostTestimonials: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-45%"]);

    return (
        <section ref={targetRef} className="relative h-[250vh] bg-deep-purple" id="testimonials">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">

                {/* Title */}
                <div className="absolute top-24 left-6 md:left-24 z-20 pointer-events-none">
                    <h2 className="text-cream-base font-serif text-3xl md:text-5xl leading-tight drop-shadow-lg">
                        Hear from our <br />
                        <span className="opacity-70 italic">amazing hosts</span>
                    </h2>
                </div>

                <motion.div
                    style={{ x }}
                    className="flex gap-6 md:gap-12 pl-[10vw] md:pl-[30vw] items-center"
                >
                    {testimonials.map((t, i) => (
                        <div
                            key={t.id}
                            className={`relative w-[280px] md:w-[320px] flex-shrink-0 group ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-500`}
                        >
                            {/* Card Container */}
                            <div className="bg-[#fffcf5] p-6 pb-8 rounded-sm shadow-xl flex flex-col items-center text-center relative">

                                {/* Washi Tape Top */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#E8A585]/80 opacity-90 rotate-1 shadow-sm"></div>

                                {/* Photo Polaroid Style */}
                                <div className="w-full aspect-[4/3] bg-gray-100 mb-6 p-2 shadow-inner">
                                    <div className="w-full h-full overflow-hidden relative">
                                        <img src={t.image} alt={t.workshop} className="w-full h-full object-cover sepia-[.2] group-hover:sepia-0 transition-all duration-500" />

                                        {/* Date Stamp on Photo */}
                                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-mono text-gray-500 tracking-tighter">
                                            {t.date}
                                        </div>
                                    </div>
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 text-primary-orange mb-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>

                                {/* Workshop Name */}
                                <h4 className="font-serif text-deep-purple text-xl mb-2">{t.workshop}</h4>

                                {/* Review Text */}
                                <p className="font-sans text-gray-600 text-sm italic leading-relaxed mb-4 line-clamp-4">
                                    "{t.text}"
                                </p>

                                {/* User Name */}
                                <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                                    <p className="font-sans text-deep-purple text-sm font-semibold">
                                        {t.user}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HostTestimonials;
