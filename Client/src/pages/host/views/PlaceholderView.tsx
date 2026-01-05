import React from 'react';

interface PlaceholderViewProps {
    title: string;
    description: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-primary-orange/5 rounded-[2rem] flex items-center justify-center text-primary-orange mb-8 transform rotate-12">
                <div className="w-12 h-12 border-4 border-primary-orange rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary-orange rounded-full" />
                </div>
            </div>
            <h2 className="text-3xl font-serif font-bold text-deep-purple mb-4">{title}</h2>
            <p className="text-gray-400 max-w-sm font-medium leading-relaxed">
                {description}
            </p>
            <button className="mt-8 px-8 py-3 bg-deep-purple text-white rounded-2xl font-bold shadow-lg hover:bg-deep-purple/90 transition-all">
                Coming Soon
            </button>
        </div>
    );
};
