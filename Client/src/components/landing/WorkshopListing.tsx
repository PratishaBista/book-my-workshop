import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locations = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan"];

const workshops = [
    {
        id: 1,
        title: 'Traditional Pottery Wheel',
        location: 'Bhaktapur',
        category: 'Pottery',
        price: 'NPR 2500',
        image: 'https://images.unsplash.com/photo-1565193566173-0929d9956932?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviewCount: 124,
        businessYears: 5,
        frequency: 'Daily',
        wishlistCount: 2304
    },
    {
        id: 2,
        title: 'Mithila Art Workshop',
        location: 'Kathmandu',
        category: 'Art',
        price: 'NPR 1800',
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviewCount: 89,
        businessYears: 12,
        frequency: 'Weekends',
        wishlistCount: 1540
    },
    {
        id: 3,
        title: 'Organic Soap Making',
        location: 'Lalitpur',
        category: 'Crafts',
        price: 'NPR 3200',
        image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviewCount: 56,
        businessYears: 3,
        frequency: 'Monthly',
        wishlistCount: 890
    },
    {
        id: 4,
        title: 'Coffee Brewing 101',
        location: 'Pokhara',
        category: 'Cooking',
        price: 'NPR 2000',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
        rating: 5.0,
        reviewCount: 210,
        businessYears: 8,
        frequency: 'Daily',
        wishlistCount: 3400
    },
    {
        id: 5,
        title: 'Thangka Painting',
        location: 'Kathmandu',
        category: 'Art',
        price: 'NPR 4500',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviewCount: 45,
        businessYears: 20,
        frequency: 'Regularly',
        wishlistCount: 980
    },
];

const WorkshopListing: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Kathmandu");
    const [wishlist, setWishlist] = useState<number[]>([]);

    const toggleWishlist = (id: number) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredWorkshops = workshops.filter(w => w.location === activeTab);

    return (
        <section className="py-24 md:py-32 px-6 bg-[#F9F9F5]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 border-b border-deep-purple/10 pb-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-serif text-deep-purple leading-none tracking-tight mb-4">
                            Upcoming <br /> Sessions
                        </h2>
                    </div>

                    {/* Minimalist Tabs */}
                    <div className="flex gap-6 overflow-x-auto pb-2 mt-8 md:mt-0 no-scrollbar">
                        {locations.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => setActiveTab(loc)}
                                className={`text-lg transition-colors relative pb-1 whitespace-nowrap ${activeTab === loc
                                    ? 'text-deep-purple font-medium border-b-2 border-primary-orange'
                                    : 'text-deep-purple/40 hover:text-deep-purple'
                                    }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                    <AnimatePresence mode="popLayout">
                        {filteredWorkshops.map((workshop) => (
                            <motion.div
                                key={workshop.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="group cursor-pointer"
                            >
                                {/* Image Frame - Sharp Corners, clean */}
                                <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-gray-200">
                                    <img
                                        src={workshop.image}
                                        alt={workshop.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    {/* Wishlist Button - Top Right, Minimal */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(workshop.id); }}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className={`w-5 h-5 transition-colors ${wishlist.includes(workshop.id) ? 'fill-primary-orange stroke-primary-orange' : 'fill-transparent stroke-gray-900'}`}
                                            strokeWidth="2"
                                        >
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content Details - Minimalist Hierarchy */}
                                <div className="flex flex-col gap-3">

                                    {/* Meta Row */}
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-deep-purple/40 border-b border-deep-purple/10 pb-3">
                                        <span>{workshop.category}</span>
                                        <div className='flex items-center gap-1'>
                                            <span>★ {workshop.rating}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-serif text-deep-purple leading-tight group-hover:text-primary-orange transition-colors">
                                        {workshop.title}
                                    </h3>

                                    {/* Footer Info */}
                                    <div className="flex items-center justify-between mt-2 font-sans">
                                        <span className="text-deep-purple/60 text-sm">{workshop.location}</span>
                                        <span className="font-semibold text-deep-purple text-lg">{workshop.price}</span>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Minimal Link CTA */}
                <div className="mt-20 border-t border-deep-purple/10 pt-8 flex justify-end">
                    <button className="text-xl font-serif italic text-deep-purple transition-colors flex items-center gap-2 group">
                        See all workshops
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WorkshopListing;