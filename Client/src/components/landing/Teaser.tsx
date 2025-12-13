import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const manifestoPoints = [
    {
        num: "01",
        title: "Screens aren't real life.",
        content: "We spend 11 hours a day on pixels. It’s time to touch grass (or clay, or canvas). We built this to get you out of your house and into a room full of messy, tangible, beautiful chaos."
    },
    {
        num: "02",
        title: "Imperfection is the goal.",
        content: "Social media demands perfection. We demand the opposite. Make a lopsided pot. Paint a weird cat. Sing off-key. The joy is in the doing, not the result."
    },
    {
        num: "03",
        title: "Strangers are just friends you haven't met.",
        content: "The best conversations often start with 'I don't know how to do this either.' There's something uniquely human about learning alongside someone else, where shared curiosity becomes the first chapter of a new connection."
    }
];

const Teaser: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 px-6 bg-[#FEE761] text-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 md:gap-40">

                <div className="md:w-5/12">
                    <div className="sticky top-32">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-serif font-medium text-6xl md:text-8xl leading-[0.85] tracking-tight mb-12"
                        >
                            We believe in <br />
                            <span className="italic">getting your hands dirty.</span>
                        </motion.h2>

                        <p className="text-2xl font-medium leading-tight font-sans max-w-sm border-l-4 border-black pl-6">
                            "In a world optimized for efficiency, we are making space for the slow, the messy, and the meaningful."
                        </p>

                        <div className="mt-12 flex items-center gap-3">
                            {/* <div className="w-12 h-12 rounded-full bg-deep-purple overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" alt="Founder" className="w-full h-full object-cover" />
                            </div> */}
                            <div className="text-sm font-bold uppercase tracking-widest">
                                <p>(Love, The Team)</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <a href="/about" className="inline-flex items-center gap-2 text-xl font-bold font-serif hover:gap-6 transition-all duration-300 group">
                                <span className="border-b-2 border-black group-hover:bg-black group-hover:text-[#FEE761] transition-colors">Read our story</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="md:w-7/12 pt-4">
                    <div className="border-t-2 border-black">
                        {manifestoPoints.map((point, i) => (
                            <div key={i} className="border-b-2 border-black">
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full py-10 flex items-start justify-between text-left group"
                                >
                                    <div className="flex items-baseline gap-6 md:gap-12">
                                        <span className="font-mono text-base font-bold pt-1">({point.num})</span>
                                        <h3 className={`font-serif text-3xl md:text-5xl transition-colors duration-300 ${openIndex === i ? 'italic' : 'group-hover:opacity-60'}`}>
                                            {point.title}
                                        </h3>
                                    </div>
                                    <div className="pt-2">
                                        {openIndex === i ? <Minus size={32} strokeWidth={2.5} /> : <Plus size={32} strokeWidth={2.5} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-12 pl-16 md:pl-28 pr-4 max-w-2xl">
                                                <p className="font-sans text-xl md:text-2xl font-medium leading-relaxed">
                                                    {point.content}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Teaser;
