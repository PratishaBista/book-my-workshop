import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const manifestoPoints = [
    {
        num: "01",
        title: "Your craft deserves an audience.",
        content: "You've spent years mastering your skill. Whether it's pottery, coding, or baking, there are people waiting to learn from you. We just help them find you."
    },
    {
        num: "02",
        title: "Admin shouldn't kill your vibe.",
        content: "We know you hate spreadsheets, chasing payments, and managing guest lists. So we built tools to handle the boring stuff, while you focus on the magic."
    },
    {
        num: "03",
        title: "We grow when you grow.",
        content: "This isn't just a marketplace; it's a partnership. We provide the platform, marketing, and support to turn your passion into a thriving business."
    }
];

const HostTeaser: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 px-6 bg-[#FEE761] text-black" id="mission">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 md:gap-40">

                <div className="md:w-5/12">
                    <div className="sticky top-32">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-serif font-medium text-6xl md:text-8xl leading-[0.85] tracking-tight mb-12"
                        >
                            Why teach <br />
                            <span className="italic">with us?</span>
                        </motion.h2>

                        <p className="text-2xl font-medium leading-tight font-sans max-w-sm border-l-4 border-black pl-6">
                            "We believe everyone is a teacher. You just need the right stage."
                        </p>

                        <div className="mt-12 flex items-center gap-3">
                            <div className="text-sm font-bold uppercase tracking-widest">
                                <p>(Sincerely, The Team)</p>
                            </div>
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

export default HostTeaser;
