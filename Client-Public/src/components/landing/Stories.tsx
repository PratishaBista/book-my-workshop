import React from 'react';
import { motion } from 'framer-motion';

const stories = [
    {
        id: 1,
        title: 'The ancient art of potting soil',
        excerpt: "Why getting your hands in the earth is the best therapy money can't buy.",
        category: 'Philosophy',
        image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        title: 'Kathmandu’s hidden makers',
        excerpt: "Exploring the back-alleys of Thamel to find the masters of metal and wood.",
        category: 'Culture',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 3,
        title: 'A beginner’s guide to failure',
        excerpt: "You will make something ugly. And that is perfectly okay.",
        category: 'Opinion',
        image: 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&q=80&w=800'
    },
];

const Stories: React.FC = () => {
    return (
        <section className="py-32 px-6 bg-[#F9F9F5] border-t-2 border-deep-purple">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-deep-purple/10 pb-8">
                    <h2 className="text-6xl md:text-8xl font-serif text-deep-purple leading-none tracking-tight">
                        The Journal
                    </h2>
                    <p className="text-lg md:text-xl text-deep-purple/60 font-sans max-w-sm mt-6 md:mt-0 text-right">
                        Notes on creativity, craft, and the messiness of being human.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                    {stories.map((story, i) => (
                        <motion.article
                            key={story.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group cursor-pointer flex flex-col"
                        >
                            {/* Image Frame */}
                            <div className="overflow-hidden mb-8 aspect-[4/5] border border-deep-purple/10 bg-gray-100 relative">
                                <div className="absolute inset-0 bg-deep-purple/0 group-hover:bg-deep-purple/5 transition-colors duration-500 z-10 transition-colors"></div>
                                <img
                                    src={story.image}
                                    alt={story.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                                />
                            </div>

                            {/* Meta */}
                            <div className="flex justify-between items-center border-t border-deep-purple/20 pt-4 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary-orange">
                                    {story.category}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="text-3xl font-serif text-deep-purple leading-tight mb-4 group-hover:underline decoration-1 underline-offset-4 transition-all">
                                {story.title}
                            </h3>
                            <p className="text-deep-purple/60 text-base leading-relaxed mb-6 font-sans">
                                {story.excerpt}
                            </p>

                            <div className="mt-auto">
                                <span className="inline-block text-sm font-semibold uppercase tracking-wider border-b border-transparent group-hover:border-deep-purple transition-all pb-1">
                                    Read Story
                                </span>
                            </div>

                        </motion.article>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Stories;
