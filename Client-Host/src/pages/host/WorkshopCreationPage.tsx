import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowUpRight, BookOpen, ChevronLeft, Clock, Info, MapPin,
    Plus, Save, Trash2, Sparkles, DollarSign,
    Image as ImageIcon, Play, Building2, Star, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../../config/api';
import { PricingType, MediaType } from '../../types/workshop';
import { type Venue } from '../../types/host';
import Toast, { type ToastType } from '../../components/ui/Toast';

const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'media', label: 'The Storyteller', icon: ImageIcon },
    { id: 'pricing', label: 'Pricing & Capacity', icon: DollarSign },
    { id: 'content', label: 'The Experience', icon: BookOpen },
    { id: 'logistics', label: 'Logistics', icon: Clock },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'additional', label: 'Additional Details', icon: Info },
];

interface FormMedia {
    url: string;
    publicId: string;
    mediaType: MediaType;
    isPrimary: boolean;
    storyPodId: number;
    displayOrder: number;
    aspectRatio?: string;
    file?: File;
    isUploading?: boolean;
}

interface FormData {
    title: string;
    subtitle: string;
    tagline: string;
    description: string;
    durationHours: string;
    durationMinutes: string;
    maxCapacity: string;
    minCapacity: string;
    categoryIds: number[];
    locationAddress: string;
    locationName: string;
    locationDetails: string;
    venueDescription: string;
    pricingType: PricingType;
    latitude?: number;
    longitude?: number;
    basePrice: string;
    whatToBring: string;
    skillLevel: string;
    suitability: string;
    cancellationPolicy: string;
    bookingCutoffHours: string;
    outcomes: string[];
    media: FormMedia[];
}

export const WorkshopCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const [activeSection, setActiveSection] = useState('overview');
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' as ToastType, isVisible: false });

    // Workshop status tracking
    const [workshopStatus, setWorkshopStatus] = useState<number>(0); // 0=Draft, 1=PendingReview, 2=Published, 3=Rejected
    const [rejectionReason, setRejectionReason] = useState<string | undefined>();
    const [hasPendingModifications, setHasPendingModifications] = useState(false);
    const [showModificationWarning, setShowModificationWarning] = useState(false);

    // Refs for scrolling
    const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        overview: useRef<HTMLDivElement>(null),
        media: useRef<HTMLDivElement>(null),
        pricing: useRef<HTMLDivElement>(null),
        content: useRef<HTMLDivElement>(null),
        logistics: useRef<HTMLDivElement>(null),
        location: useRef<HTMLDivElement>(null),
        additional: useRef<HTMLDivElement>(null),
    };

    const [formData, setFormData] = useState<FormData>({
        title: '',
        subtitle: '',
        tagline: '',
        description: '',
        durationHours: '2',
        durationMinutes: '0',
        maxCapacity: '10',
        minCapacity: '1',
        categoryIds: [],
        locationAddress: '',
        locationName: '',
        locationDetails: '',
        venueDescription: '',
        pricingType: PricingType.PerPerson,
        latitude: undefined,
        longitude: undefined,
        basePrice: '',
        whatToBring: '',
        skillLevel: 'Beginner',
        suitability: '',
        cancellationPolicy: 'Moderate: Full refund up to 24 hours before.',
        bookingCutoffHours: '2',
        outcomes: [''], // "What you'll get"
        media: [],
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(API_ENDPOINTS.venues, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setVenues(data);

                    if (!isEdit && data.length > 0) {
                        const defaultVenue = data.find((v: any) => v.isDefault) || data[0];
                        setSelectedVenueId(defaultVenue.id);
                        setFormData(prev => ({
                            ...prev,
                            locationName: defaultVenue.name,
                            locationAddress: defaultVenue.address,
                            latitude: defaultVenue.latitude,
                            longitude: defaultVenue.longitude
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch venues:', err);
            }

            if (isEdit) {
                try {
                    setLoading(true);
                    const res = await fetch(`${API_ENDPOINTS.workshop.base}/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        const durationParts = (data.duration || "02:00:00").split(':');

                        setWorkshopStatus(data.status);
                        setRejectionReason(data.rejectionReason);
                        setHasPendingModifications(data.hasPendingModifications || false);

                        if (data.status === 2) { // Published
                            setShowModificationWarning(true);
                        }

                        setFormData({
                            title: data.title || '',
                            subtitle: data.subtitle || '',
                            tagline: data.tagline || '',
                            description: data.description || '',
                            durationHours: parseInt(durationParts[0]).toString(),
                            durationMinutes: parseInt(durationParts[1]).toString(),
                            maxCapacity: data.maxCapacity?.toString() || '10',
                            minCapacity: data.minCapacity?.toString() || '1',
                            categoryIds: data.categories?.map((c: { id: number }) => c.id) || [],
                            locationAddress: data.locationAddress || '',
                            locationName: data.locationName || '',
                            locationDetails: data.locationDetails || '',
                            venueDescription: data.venueDescription || '',
                            pricingType: data.pricing?.pricingType ?? PricingType.PerPerson,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            basePrice: data.pricing?.basePrice?.toString() || '',
                            whatToBring: data.whatToBring || '',
                            skillLevel: data.skillLevel || 'Beginner',
                            suitability: data.suitability || '',
                            cancellationPolicy: data.cancellationPolicy || 'Moderate: Full refund up to 24 hours before.',
                            bookingCutoffHours: data.bookingCutoffHours?.toString() || '2',
                            outcomes: data.whatsIncluded?.split('\n') || [''],
                            media: data.media?.map((m: any) => ({
                                url: m.url,
                                publicId: m.publicId,
                                mediaType: m.mediaType,
                                isPrimary: m.isPrimary,
                                storyPodId: m.storyPodId || 1,
                                displayOrder: m.displayOrder,
                                aspectRatio: m.aspectRatio,
                                isUploading: false
                            })) || []
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch workshop:', err);
                    setToast({ message: 'Failed to load workshop data', type: 'error', isVisible: true });
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchInitialData();

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of SECTIONS) {
                const ref = sectionRefs[section.id];
                if (ref.current) {
                    const { offsetTop, offsetHeight } = ref.current;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id, isEdit]);

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const ref = sectionRefs[sectionId];
        if (ref.current) {
            window.scrollTo({
                top: ref.current.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) return 'Title is required';

        if (!formData.description.trim()) return 'Description is required';
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) return 'A valid base price is required';
        if (!formData.locationAddress.trim()) return 'Location address is required';
        return null;
    };

    const formatDuration = (hours: string, minutes: string) => {
        const h = hours.padStart(2, '0');
        const m = minutes.padStart(2, '0');
        return `${h}:${m}:00`;
    };

    const handleMediaUpload = async (file: File, mediaType: MediaType, aspectRatio: string) => {
        const previewUrl = URL.createObjectURL(file);
        const tempMedia = {
            url: previewUrl,
            publicId: '',
            mediaType,
            isPrimary: false, 
            storyPodId: 0,    
            displayOrder: formData.media.filter((m: any) => m.mediaType === mediaType).length,
            aspectRatio,
            isUploading: true
        };

        setFormData(prev => {
            let nextMedia = [...prev.media];
            if (mediaType === MediaType.Video) {
                nextMedia = nextMedia.filter(m => m.mediaType !== MediaType.Video);
            }
            return {
                ...prev,
                media: [...nextMedia, tempMedia]
            };
        });

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINTS.media.base}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            if (res.ok) {
                const data = await res.json();
                setFormData((prev: any) => ({
                    ...prev,
                    media: prev.media.map((m: any) =>
                        (m.url === previewUrl)
                            ? { ...m, url: data.url, publicId: data.publicId, isUploading: false }
                            : m
                    )
                }));
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            console.error('Media upload error:', err);
            setToast({ message: 'Failed to upload media', type: 'error', isVisible: true });
            setFormData((prev: any) => ({
                ...prev,
                media: prev.media.filter((m: any) => m.url !== previewUrl)
            }));
        }
    };

    const handleMediaDelete = (url: string) => {
        setFormData((prev: any) => ({
            ...prev,
            media: prev.media.filter((m: any) => m.url !== url)
        }));
    };

    const handleSave = async (isDraft: boolean = true) => {
        const error = validateForm();
        if (!isDraft && error) {
            setToast({ message: error, type: 'error', isVisible: true });
            return;
        }

        // Check if all media are finished uploading
        if (formData.media.some((m: any) => m.isUploading)) {
            setToast({ message: 'Please wait for media uploads to finish', type: 'error', isVisible: true });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const requestData = {
                title: formData.title,
                subtitle: formData.subtitle,
                tagline: formData.tagline,
                description: formData.description,
                duration: formatDuration(formData.durationHours || '0', formData.durationMinutes || '0'),
                maxCapacity: parseInt(formData.maxCapacity) || 1,
                minCapacity: parseInt(formData.minCapacity) || 0,
                categoryIds: formData.categoryIds,
                venueId: selectedVenueId,
                locationAddress: formData.locationAddress,
                locationName: formData.locationName,
                locationDetails: formData.locationDetails,
                venueDescription: formData.venueDescription,
                pricingType: formData.pricingType,
                basePrice: parseFloat(formData.basePrice) || 0,
                latitude: formData.latitude,
                longitude: formData.longitude,
                whatToBring: formData.whatToBring,
                skillLevel: formData.skillLevel,
                suitability: formData.suitability,
                cancellationPolicy: formData.cancellationPolicy,
                bookingCutoffHours: parseInt(formData.bookingCutoffHours) || 0,
                whatsIncluded: formData.outcomes.filter((o: string) => o.trim()).join('\n'),
                media: formData.media.map((m: any) => ({
                    url: m.url,
                    publicId: m.publicId,
                    mediaType: m.mediaType,
                    isPrimary: m.isPrimary,
                    storyPodId: m.storyPodId,
                    displayOrder: m.displayOrder,
                    aspectRatio: m.aspectRatio
                })),
                status: isDraft ? 0 : 1 // 0=Draft, 1=PendingReview
            };

            const response = await fetch(isEdit ? `${API_ENDPOINTS.workshop.base}/${id}` : API_ENDPOINTS.workshop.base, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                setToast({
                    message: isDraft ? 'Draft saved successfully!' : 'Workshop submitted for review!',
                    type: 'success',
                    isVisible: true
                });
                if (!isDraft) {
                    setTimeout(() => navigate('/host/dashboard'), 2000);
                } else if (!isEdit) {
                    setTimeout(() => navigate('/host/dashboard'), 2000);
                }
            } else {
                const data = await response.json();
                setToast({
                    message: data.message || 'Failed to save workshop',
                    type: 'error',
                    isVisible: true
                });
            }
        } catch (err) {
            console.error('Submission error:', err);
            setToast({ message: 'An unexpected error occurred', type: 'error', isVisible: true });
        } finally {
            setLoading(false);
        }
    };

    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleEnhanceText = async () => {
        const textToEnhance = formData.description?.trim();
        if (!textToEnhance) return;

        if (textToEnhance.length < 5) {
            setToast({ message: 'Please write a bit more before enhancing (min 5 characters).', type: 'error', isVisible: true });
            return;
        }

        setIsEnhancing(true);
        try {
            const response = await fetch('http://localhost:8000/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToEnhance })
            });

            if (response.ok) {
                const data = await response.json();
                setFormData((prev: any) => ({ ...prev, description: data.enhanced_text }));
            } else {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to enhance description.' }));
                setToast({
                    message: errorData.detail || 'Failed to enhance description. Try again.',
                    type: 'error',
                    isVisible: true
                });
            }
        } catch (error) {
            console.error('AI Error:', error);
            setToast({ message: 'Could not reach the AI server. Please check if it is running.', type: 'error', isVisible: true });
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] selection:bg-[#FF6B35]/20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-medium tracking-tight">{isEdit ? 'Edit' : 'Create'} Workshop</h1>
                        <p className="text-sm text-[#707070] font-light">{isEdit ? 'Refine your offering' : 'Craft an unforgettable experience'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="px-5 py-2 text-sm font-medium text-[#707070] hover:text-[#2D2D2D] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="bg-[#2D2D2D] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-black/10"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Submit for Review
                    </button>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex gap-12 px-6 py-12">
                {/* Sidebar Navigation */}
                <aside className="w-64 sticky top-32 h-fit hidden lg:block">
                    <nav className="flex flex-col gap-1">
                        {SECTIONS.map((section) => {
                            const Icon = section.icon;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${activeSection === section.id
                                        ? 'bg-[#2D2D2D] text-white shadow-lg shadow-black/5'
                                        : 'text-[#707070] hover:bg-white hover:shadow-sm hover:text-[#2D2D2D]'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-light">{section.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-12 p-6 bg-[#2D2D2D] rounded-3xl text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-medium mb-2 leading-tight">Need Inspiration?</h3>
                            <p className="text-xs text-white/70 font-light leading-relaxed mb-4">
                                Our most successful hosts focus on storytelling. Think about the atmosphere, the people, and the final result.
                            </p>
                            <button className="flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors">
                                View Guide <ArrowUpRight size={14} />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/20 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:from-[#FF6B35]/30 transition-all duration-700" />
                    </div>
                </aside>

                {/* Main Content Sections */}
                <main className="flex-1 max-w-[800px] flex flex-col gap-32 pb-64">

                    {/* Section: Overview */}
                    <section ref={sectionRefs.overview} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <Sparkles size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">Overview</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-12">The Essence</h2>

                        <div className="space-y-12">
                            <div className="group">
                                <label className="block text-sm font-medium text-[#707070] mb-2 group-focus-within:text-[#2D2D2D] transition-colors">
                                    Workshop Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Master the Art of Hand-Built Ceramics"
                                    className="w-full bg-transparent border-b border-[#E5E5E5] py-4 text-3xl font-light placeholder:text-[#BBB] focus:border-[#2D2D2D] outline-none transition-all duration-300"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <p className="mt-3 text-xs text-[#AAA] font-light">Keep it descriptive and inviting. Max 80 characters.</p>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-[#707070] mb-2 group-focus-within:text-[#2D2D2D] transition-colors">
                                    Subtitle (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. A morning of mud and mindfulness in Thamel"
                                    className="w-full bg-transparent border-b border-[#E5E5E5] py-4 text-xl font-light placeholder:text-[#BBB] focus:border-[#2D2D2D] outline-none transition-all duration-300"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                />
                                <p className="mt-3 text-xs text-[#AAA] font-light">A brief, punchy hook to grab attention.</p>
                            </div>

                        </div>
                    </section>

                    <section ref={sectionRefs.media} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <ImageIcon size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">The Storyteller</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-4">Visual Narrative</h2>
                        <p className="text-[#707070] font-light mb-16 max-w-lg leading-relaxed">
                            Capture defining workshop moments. Upload portrait photos and a landscape video to best describe the workshop experience.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-medium mb-2">Workshop Moments</h3>
                                    <p className="text-sm text-[#AAA] font-light">
                                        Upload at least 5 defining moments (Portrait mode recommended)
                                    </p>
                                </div>

                                <div
                                    onClick={() => document.getElementById('portrait-images-input')?.click()}
                                    className="w-full py-4 px-6 bg-white border-2 border-[#DDD] rounded-2xl hover:border-[#2D2D2D] transition-all cursor-pointer flex items-center justify-center gap-3 group"
                                >
                                    <input
                                        type="file"
                                        id="portrait-images-input"
                                        hidden
                                        multiple
                                        accept="image/*"
                                        onChange={(e: any) => {
                                            if (e.target.files) {
                                                Array.from(e.target.files).forEach((file: any) => handleMediaUpload(file, MediaType.Image, '9:16'));
                                            }
                                        }}
                                    />
                                    <ImageIcon size={20} className="text-[#707070] group-hover:text-[#2D2D2D] transition-colors" />
                                    <span className="text-sm font-medium text-[#707070] group-hover:text-[#2D2D2D] transition-colors">
                                        Upload Photos (Portrait)
                                    </span>
                                </div>

                                {formData.media.filter((m: any) => m.mediaType === MediaType.Image).length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {formData.media.filter((m: any) => m.mediaType === MediaType.Image).map((m: any, idx: number) => (
                                            <div key={idx} className="relative aspect-[9/16] group/item rounded-xl overflow-hidden bg-[#F5F5F5]">
                                                <img src={m.url} className="w-full h-full object-cover" alt={`Moment ${idx + 1}`} />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={(e: any) => { e.stopPropagation(); handleMediaDelete(m.url); }}
                                                        className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                {m.isUploading && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <div className="w-6 h-6 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-medium mb-2">Workshop Video</h3>
                                    <p className="text-sm text-[#AAA] font-light">
                                        Upload a video showcasing your workshop (Landscape mode recommended)
                                    </p>
                                </div>

                                <div
                                    onClick={() => document.getElementById('landscape-video-input')?.click()}
                                    className="aspect-video bg-[#F5F5F5] rounded-2xl border-2 border-dashed border-[#DDD] flex flex-col items-center justify-center group hover:border-[#2D2D2D] transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <input
                                        type="file"
                                        id="landscape-video-input"
                                        hidden
                                        accept="video/*"
                                        onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], MediaType.Video, '16:9')}
                                    />
                                    {formData.media.find((m: any) => m.mediaType === MediaType.Video) ? (
                                        <div className="absolute inset-0 group">
                                            {formData.media.find((m: any) => m.mediaType === MediaType.Video)?.mediaType === MediaType.Video ? (
                                                <video
                                                    src={formData.media.find((m: any) => m.mediaType === MediaType.Video)?.url}
                                                    className="w-full h-full object-cover"
                                                    autoPlay muted loop
                                                />
                                            ) : (
                                                <img
                                                    src={formData.media.find((m: any) => m.mediaType === MediaType.Video)?.url}
                                                    className="w-full h-full object-cover"
                                                    alt="Workshop video"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={(e: any) => { e.stopPropagation(); handleMediaDelete(formData.media.find((m: any) => m.mediaType === MediaType.Video)!.url); }}
                                                    className="p-4 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                            {formData.media.find((m: any) => m.mediaType === MediaType.Video)?.isUploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#2D2D2D] group-hover:text-white transition-colors duration-300">
                                                <Play size={24} />
                                            </div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#707070] group-hover:text-[#2D2D2D]">Upload Video (Landscape)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Pricing */}
                    <section ref={sectionRefs.pricing} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <DollarSign size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">Value</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-12">Pricing & Capacity</h2>

                        <div className="space-y-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-[#707070]">Pricing Model</label>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { id: PricingType.PerPerson, label: 'Per Person', desc: 'Ideal for standard classes' },
                                            { id: PricingType.PerGroup, label: 'Per Group', desc: 'Flat fee for private sessions' }
                                        ].map((p: any) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFormData({ ...formData, pricingType: p.id })}
                                                className={`p-5 rounded-2xl border text-left transition-all duration-300 ${formData.pricingType === p.id
                                                    ? 'border-[#2D2D2D] bg-white shadow-xl shadow-black/5'
                                                    : 'border-[#EEE] hover:border-[#CCC] bg-transparent'
                                                    }`}
                                            >
                                                <div className="font-medium text-sm">{p.label}</div>
                                                <div className="text-xs text-[#707070] font-light mt-1">{p.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-medium text-[#707070] mb-2 group-focus-within:text-[#2D2D2D] transition-colors">
                                        Base Price (NPR)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-light text-[#AAA]">Rs.</span>
                                        <input
                                            type="number"
                                            placeholder="2500"
                                            className="w-full bg-transparent border-b border-[#E5E5E5] py-6 pl-16 text-5xl font-light focus:border-[#2D2D2D] outline-none transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={formData.basePrice}
                                            onChange={(e: any) => setFormData({ ...formData, basePrice: e.target.value })}
                                        />
                                    </div>
                                    <p className="mt-4 text-xs text-[#AAA] font-light leading-relaxed">Set a competitive price that reflects your expertise and the value participants receive.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-[#F5F5F5]">
                                <div className="group">
                                    <label className="block text-sm font-medium text-[#707070] mb-2">Min. Seats</label>
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border-b border-[#E5E5E5] py-4 text-2xl font-light focus:border-[#2D2D2D] outline-none transition-all"
                                        value={formData.minCapacity}
                                        onChange={(e: any) => setFormData({ ...formData, minCapacity: e.target.value })}
                                    />
                                    <p className="mt-3 text-[10px] text-[#AAA] font-light italic leading-relaxed">The workshop will proceed once this many people book.</p>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-[#707070] mb-2">Max. Seats</label>
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border-b border-[#E5E5E5] py-4 text-2xl font-light focus:border-[#2D2D2D] outline-none transition-all"
                                        value={formData.maxCapacity}
                                        onChange={(e: any) => setFormData({ ...formData, maxCapacity: e.target.value })}
                                    />
                                    <p className="mt-3 text-[10px] text-[#AAA] font-light italic leading-relaxed">Total spots available per session across all dates.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Content */}
                    <section ref={sectionRefs.content} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <BookOpen size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">Experience</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-12">What & Why</h2>

                        <div className="space-y-16">
                            <div className="group">
                                <div className="flex items-center justify-between mb-6">
                                    <label className="block text-sm font-medium text-[#707070]">What you'll do</label>
                                    <button
                                        onClick={handleEnhanceText}
                                        disabled={isEnhancing || !formData.description}
                                        className="flex items-center gap-2 text-xs font-medium bg-[#1a0b2e]/5 hover:bg-[#1a0b2e]/10 text-[#6b4c9a] px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                                        title="Enhance with AI"
                                    >
                                        {isEnhancing ? (
                                            <div className="w-3 h-3 border-2 border-[#6b4c9a]/30 border-t-[#6b4c9a] rounded-full animate-spin" />
                                        ) : (
                                            <Sparkles size={14} />
                                        )}
                                        {isEnhancing ? 'Enhancing...' : 'Enhance writing'}
                                    </button>
                                </div>
                                <textarea
                                    rows={10}
                                    placeholder="Tell the story of the session. How does it begin? What techniques will they learn? What's the atmosphere like?"
                                    className="w-full bg-white/50 backdrop-blur-sm border border-[#EEE] rounded-[2rem] p-8 text-xl font-light leading-relaxed focus:border-[#2D2D2D] focus:ring-1 focus:ring-[#2D2D2D]/5 shadow-sm outline-none transition-all"
                                    value={formData.description}
                                    onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-8">
                                <label className="block text-sm font-medium text-[#707070]">What you'll get (Outcomes)</label>
                                <div className="space-y-4">
                                    {formData.outcomes.map((outcome, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <input
                                                type="text"
                                                placeholder="e.g. 2 hand-glazed ceramic bowls"
                                                className="flex-1 bg-transparent border-b border-[#EEE] py-4 text-base font-light focus:border-[#2D2D2D] outline-none transition-all"
                                                value={outcome}
                                                onChange={(e: any) => {
                                                    const newOutcomes = [...formData.outcomes];
                                                    newOutcomes[idx] = e.target.value;
                                                    setFormData({ ...formData, outcomes: newOutcomes });
                                                }}
                                            />
                                            {formData.outcomes.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const newOutcomes = formData.outcomes.filter((_: any, i: number) => i !== idx);
                                                        setFormData({ ...formData, outcomes: newOutcomes });
                                                    }}
                                                    className="p-4 text-[#AAA] hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setFormData({ ...formData, outcomes: [...formData.outcomes, ''] })}
                                        className="text-xs font-medium text-[#2D2D2D] flex items-center gap-2 hover:translate-x-2 transition-transform py-2"
                                    >
                                        <Plus size={16} /> Add another outcome
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Logistics */}
                    <section ref={sectionRefs.logistics} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <Clock size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">Logistics</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-12">Timing & Rules</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-6">
                                <label className="block text-sm font-medium text-[#707070]">Duration</label>
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-b border-[#EEE] py-4 text-center text-3xl font-light focus:border-[#2D2D2D] outline-none"
                                            placeholder="2"
                                            value={formData.durationHours}
                                            onChange={(e: any) => setFormData({ ...formData, durationHours: e.target.value })}
                                        />
                                        <span className="block text-[10px] text-[#AAA] text-center mt-3 uppercase font-bold tracking-widest">Hours</span>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-b border-[#EEE] py-4 text-center text-3xl font-light focus:border-[#2D2D2D] outline-none"
                                            placeholder="30"
                                            value={formData.durationMinutes}
                                            onChange={(e: any) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                        />
                                        <span className="block text-[10px] text-[#AAA] text-center mt-3 uppercase font-bold tracking-widest">Minutes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block text-sm font-medium text-[#707070]">Booking Cutoff</label>
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-b border-[#EEE] py-4 text-center text-3xl font-light focus:border-[#2D2D2D] outline-none"
                                            placeholder="24"
                                            value={formData.bookingCutoffHours}
                                            onChange={(e: any) => setFormData({ ...formData, bookingCutoffHours: e.target.value })}
                                        />
                                        <span className="block text-[10px] text-[#AAA] text-center mt-3 uppercase font-bold tracking-widest">Hours before</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[#AAA] font-light italic leading-relaxed">Minimum lead time needed for preparations.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Location */}
                    <section ref={sectionRefs.location} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <MapPin size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">Location</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-12">The Neighborhood</h2>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {venues.map((v: any) => (
                                    <button
                                        key={v.id}
                                        onClick={() => {
                                            setSelectedVenueId(v.id);
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                locationName: v.name,
                                                locationAddress: v.address,
                                                latitude: v.latitude,
                                                longitude: v.longitude
                                            }));
                                        }}
                                        className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${selectedVenueId === v.id ? 'border-primary-orange bg-orange-50/30' : 'border-[#EEE] hover:border-deep-purple bg-white'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors ${selectedVenueId === v.id ? 'bg-primary-orange text-white' : 'bg-[#F5F5F5] text-gray-400 group-hover:bg-deep-purple group-hover:text-white'}`}>
                                            <Building2 size={20} />
                                        </div>
                                        <div className="font-bold text-deep-purple">{v.name}</div>
                                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">{v.address}</div>
                                        {selectedVenueId === v.id && (
                                            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-primary-orange uppercase tracking-widest">
                                                <Star size={10} fill="currentColor" /> Selected Location
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {selectedVenueId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-8 border-t border-[#F5F5F5]"
                                >
                                    <div className="group">
                                        <label className="block text-sm font-medium text-[#707070] mb-4 uppercase tracking-widest">Specific Venue Details (Optional)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="e.g. Any specific last-mile instructions for this particular workshop?"
                                            className="w-full bg-white/30 backdrop-blur-sm border border-[#EEE] rounded-[2rem] p-6 text-sm font-light leading-relaxed focus:border-[#2D2D2D] outline-none transition-all"
                                            value={formData.locationDetails}
                                            onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    {/* Section: Additional Details */}
                    <section ref={sectionRefs.additional} className="scroll-mt-32">
                        <div className="flex items-center gap-2 text-[#FF6B35] mb-4">
                            <Info size={16} />
                            <span className="text-sm font-medium tracking-wider uppercase">Details</span>
                        </div>
                        <h2 className="text-5xl font-semibold tracking-tight mb-12">Fine Print</h2>

                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="group">
                                    <label className="block text-sm font-medium text-[#707070] mb-2 font-bold uppercase tracking-widest text-[10px]">What to bring</label>
                                    <textarea
                                        className="w-full bg-white/30 border border-[#EEE] rounded-2xl p-5 text-sm font-light leading-relaxed focus:border-[#2D2D2D] outline-none transition-all"
                                        rows={4}
                                        placeholder="e.g. Your own apron and a creative spirit. We provide the clay."
                                        value={formData.whatToBring}
                                        onChange={(e) => setFormData({ ...formData, whatToBring: e.target.value })}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-[#707070] mb-2 font-bold uppercase tracking-widest text-[10px]">Skill Level</label>
                                    <select
                                        className="w-full bg-white/30 border border-[#EEE] rounded-2xl p-5 text-sm font-light focus:border-[#2D2D2D] outline-none transition-all appearance-none"
                                        value={formData.skillLevel}
                                        onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                                    >
                                        <option>Beginner (No experience needed)</option>
                                        <option>Intermediate (Basic knowledge required)</option>
                                        <option>Advanced (Fluent in the craft)</option>
                                        <option>All Levels Welcome</option>
                                    </select>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-[#707070] mb-2 font-bold uppercase tracking-widest text-[10px]">Cancellation Policy</label>
                                <textarea
                                    className="w-full bg-white/30 border border-[#EEE] rounded-2xl p-5 text-sm font-light leading-relaxed focus:border-[#2D2D2D] outline-none transition-all"
                                    rows={3}
                                    placeholder="Outline your policy clearly..."
                                    value={formData.cancellationPolicy}
                                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                </main >
            </div >

            {/* Modification Warning Modal */}
            {
                showModificationWarning && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="text-orange-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-deep-purple mb-2">Editing Live Workshop</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Your workshop is currently live and accepting bookings.
                                </p>
                            </div>

                            <div className="space-y-4 mb-6 text-left">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-blue-900 mb-2">Changes requiring admin re-approval:</p>
                                    <ul className="text-xs text-blue-700 space-y-1 ml-4">
                                        <li className="list-disc">Title, Subtitle, or Tagline</li>
                                        <li className="list-disc">Price or Pricing Type</li>
                                        <li className="list-disc">Duration</li>
                                        <li className="list-disc">Capacity (Min/Max)</li>
                                        <li className="list-disc">Location or Venue</li>
                                        <li className="list-disc">Workshop Type or Categories</li>
                                    </ul>
                                    <p className="text-xs text-blue-600 mt-2 italic">Your workshop stays live with the current version until approved.</p>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-gray-900 mb-2">Changes that update immediately:</p>
                                    <ul className="text-xs text-gray-700 space-y-1 ml-4">
                                        <li className="list-disc">Description and details</li>
                                        <li className="list-disc">Photos and videos</li>
                                        <li className="list-disc">What to bring, skill level, suitability</li>
                                        <li className="list-disc">Cancellation policy and additional info</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowModificationWarning(false);
                                        navigate('/host/dashboard');
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowModificationWarning(false)}
                                    className="flex-1 px-4 py-3 bg-deep-purple text-white rounded-xl font-semibold hover:bg-deep-purple/90 transition-all"
                                >
                                    Continue Editing
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            {/* Rejection Reason Display */}
            {
                workshopStatus === 3 && rejectionReason && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="text-red-600" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-red-900 mb-1">Workshop Rejected</h4>
                                    <p className="text-sm text-red-700 mb-2">Please address the following issues and resubmit:</p>
                                    <p className="text-sm text-red-800 bg-white/50 rounded-lg p-3 border border-red-200">{rejectionReason}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div >
    );
};
