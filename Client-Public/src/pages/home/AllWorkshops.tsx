import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

interface Workshop {
    id: number;
    title: string;
    slug: string;
    locationName: string;
    locationAddress: string;
    categoryName: string;
    basePrice: number;
    currency: string;
    primaryImageUrl: string;
    averageRating: number | null;
    reviewCount: number;
}

const AllWorkshops: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [selectedLocation, setSelectedLocation] = useState(searchParams.get('loc') || 'All Locations');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.category);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (e) {
                console.error("Error fetching categories", e);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchWorkshops = async () => {
            setLoading(true);
            try {
                let url = API_ENDPOINTS.workshop.all; 
                
                if (searchQuery || (selectedCategory && selectedCategory !== 'All') || (selectedLocation && selectedLocation !== 'All Locations')) {
                   const params = new URLSearchParams();
                   if (searchQuery) params.append('q', searchQuery);
                   if (selectedCategory && selectedCategory !== 'All') {
                       const catId = categories.find(c => c.name === selectedCategory)?.id;
                       if (catId) params.append('categoryId', catId.toString());
                   }
                   if (selectedLocation && selectedLocation !== 'All Locations') params.append('location', selectedLocation);
                   
                   url = `${API_ENDPOINTS.workshop.base}/search?${params.toString()}`;
                }

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    // Map the response and shuffle it
                    let formattedData = data.map((w: any) => ({
                        ...w,
                        categoryName: w.categories?.[0]?.name || w.categoryName || ''
                    }));
                    
                    // Fisher-Yates Shuffle algorithm
                    for (let i = formattedData.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [formattedData[i], formattedData[j]] = [formattedData[j], formattedData[i]];
                    }
                    
                    setWorkshops(formattedData);
                    setCurrentPage(1); // Reset to first page on search
                }
            } catch (error) {
                console.error('Error fetching workshops:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshops();
        
        const newParams: any = {};
        if (searchQuery) newParams.q = searchQuery;
        if (selectedCategory !== 'All') newParams.category = selectedCategory;
        if (selectedLocation !== 'All Locations') newParams.loc = selectedLocation;
        setSearchParams(newParams);

    }, [searchQuery, selectedCategory, selectedLocation, categories, setSearchParams]);

    const handleWorkshopClick = (slugOrId: string) => {
        navigate(`/workshop/${slugOrId}`);
        window.scrollTo(0, 0);
    };

    // Calculate Paginated Workshops
    const totalPages = Math.ceil(workshops.length / itemsPerPage);
    const paginatedItems = workshops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF7] text-deep-purple font-sans selection:bg-primary-orange/20">
            <Navbar />

            {/* Spacer for Sticky Nav */}
            <div className="h-[84px]" />

            {/* Premium Header & Filter Area */}
            <div className="bg-[#FDFCF7] pt-12 pb-8 px-6 md:px-12 border-b border-deep-purple/5 relative">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-4">
                                Explore <span className="italic text-primary-orange">Experiences</span>
                            </h1>
                            <p className="text-xl text-deep-purple/60 font-light max-w-xl">
                                Discover and book unique workshops taught by passionate locals in your city.
                            </p>
                        </div>
                        
                        {/* Compact Integrated Search & Location */}
                        <div className="flex items-center bg-white p-2 rounded-full shadow-md shadow-deep-purple/5 border border-deep-purple/10 flex-1 max-w-2xl lg:max-w-xl h-[64px]">
                            <div className="flex-1 flex items-center px-4">
                                <Search className="w-5 h-5 text-deep-purple/30 mr-3 hidden sm:block" />
                                <input
                                    type="text"
                                    placeholder="Search creative workshops..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-2 bg-transparent outline-none font-medium text-sm text-deep-purple placeholder:text-deep-purple/30 focus:ring-0"
                                />
                            </div>
                            <div className="w-px h-8 bg-deep-purple/10 mx-2"></div>
                            <div className="flex items-center px-4 relative">
                                <MapPin className="w-5 h-5 text-primary-orange mr-2 hidden sm:block" />
                                <select 
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="py-2 bg-transparent appearance-none outline-none font-bold text-xs uppercase tracking-wider cursor-pointer pr-4 hover:text-primary-orange transition-colors"
                                >
                                    <option value="All Locations">All Locations</option>
                                    <option value="Kathmandu">Kathmandu</option>
                                    <option value="Pokhara">Pokhara</option>
                                    <option value="Lalitpur">Lalitpur</option>
                                    <option value="Bhaktapur">Bhaktapur</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Category Pills */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
                        <button
                            onClick={() => { setSelectedCategory('All'); setCurrentPage(1); }}
                            className={`flex-shrink-0 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all snap-start shadow-sm border ${
                                selectedCategory === 'All' 
                                    ? 'bg-deep-purple border-deep-purple text-white shadow-deep-purple/20' 
                                    : 'bg-white border-deep-purple/10 text-deep-purple/70 hover:border-deep-purple/30 hover:text-deep-purple'
                            }`}
                        >
                            <span className="flex items-center gap-2"><Sparkles size={14}/> All</span>
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                                className={`flex-shrink-0 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all snap-start shadow-sm border ${
                                    selectedCategory === cat.name 
                                        ? 'bg-deep-purple border-deep-purple text-white shadow-deep-purple/20' 
                                        : 'bg-white border-deep-purple/10 text-deep-purple/70 hover:border-deep-purple/30 hover:text-deep-purple'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content - Flat List */}
            <main className="py-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-16 h-16 border-4 border-primary-orange/10 border-t-primary-orange rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-primary-orange animate-pulse" />
                            </div>
                        </div>
                        <p className="font-serif italic text-xl text-deep-purple/40">Discovering workshops for you...</p>
                    </div>
                ) : paginatedItems.length > 0 ? (
                    <div className="space-y-20">
                        <motion.div 
                            key={currentPage}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-16"
                        >
                            {paginatedItems.map((workshop) => (
                                <motion.div
                                    key={workshop.id}
                                    variants={itemVariants}
                                    onClick={() => handleWorkshopClick(workshop.slug)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-3xl bg-gray-100 shadow-sm border border-deep-purple/5">
                                        {workshop.primaryImageUrl ? (
                                            <img
                                                src={workshop.primaryImageUrl}
                                                alt={workshop.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-deep-purple/5 to-primary-orange/5 flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-deep-purple/10" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-between">
                                            <div className="text-white">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-serif text-white">View Details</span>
                                                    <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        {workshop.averageRating && (
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1 shadow-lg ring-1 ring-black/5">
                                                <span className="text-primary-orange font-bold text-[10px]">★</span>
                                                <span className="font-bold text-[10px] text-deep-purple">{workshop.averageRating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {workshop.categoryName && (
                                                <span className="text-[9px] font-black uppercase tracking-wider text-primary-orange px-1 border-l border-primary-orange">
                                                    {workshop.categoryName}
                                                </span>
                                            )}
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-deep-purple/30">
                                                {workshop.locationName}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-serif font-medium leading-tight group-hover:text-primary-orange transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
                                            {workshop.title}
                                        </h3>

                                        <div className="pt-2 border-t border-deep-purple/5 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-serif font-bold text-deep-purple">
                                                    <span className="text-[10px] font-normal opacity-40 mr-1">{workshop.currency}</span>
                                                    {workshop.basePrice.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-deep-purple/10 flex items-center justify-center group-hover:bg-deep-purple group-hover:text-white transition-all duration-500">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pt-20 border-t border-deep-purple/5 flex items-center justify-center gap-4">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}
                                    className="px-6 py-3 border border-deep-purple/10 rounded-2xl font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-cream-base transition-all"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                                            className={`w-10 h-10 rounded-full font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20' : 'hover:bg-cream-base text-deep-purple/40'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}
                                    className="px-6 py-3 border border-deep-purple/10 rounded-2xl font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-cream-base transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 flex flex-col items-center text-center max-w-xl mx-auto"
                    >
                        <div className="w-24 h-24 bg-cream-base rounded-full flex items-center justify-center mb-8 border border-deep-purple/5 shadow-inner">
                            <SlidersHorizontal size={32} className="text-deep-purple/20" />
                        </div>
                        <h2 className="text-4xl font-serif mb-4">No matching workshops</h2>
                        <p className="text-deep-purple/60 leading-relaxed mb-10">
                            We couldn't find any workshops matching your search or filters. Try adjusting your settings or browsing all categories.
                        </p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                                setSelectedLocation('All Locations');
                            }}
                            className="px-8 py-4 bg-deep-purple text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-deep-purple/90 transition-all shadow-xl shadow-deep-purple/10"
                        >
                            Reset All Filters
                        </button>
                    </motion.div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default AllWorkshops;
;
