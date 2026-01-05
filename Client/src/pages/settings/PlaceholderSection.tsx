import React from 'react';
import { Info } from 'lucide-react';

interface PlaceholderSectionProps {
    title: string;
    desc: string;
}

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ title, desc }) => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-24 bg-white/50 border border-deep-purple/5 rounded-[3rem] backdrop-blur-sm">
        <div className="w-20 h-20 bg-cream-base rounded-full flex items-center justify-center mb-2 shadow-inner">
            <Info size={32} className="text-deep-purple/20" />
        </div>
        <div className="space-y-2">
            <h2 className="text-4xl font-serif font-bold text-deep-purple">{title}</h2>
            <p className="text-deep-purple/40 max-w-sm mx-auto text-lg leading-relaxed">
                {desc}
            </p>
        </div>
        <div className="pt-4">
            <div className="px-10 py-4 bg-deep-purple text-cream-base rounded-full text-base font-bold shadow-xl hover:scale-105 transition-transform cursor-default">
                Feature coming soon
            </div>
        </div>
    </div>
);

export default PlaceholderSection;
