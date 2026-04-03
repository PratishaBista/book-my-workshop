import React from 'react';

interface AnimatedHoverTextProps {
    text: string;
}

export const AnimatedHoverText: React.FC<AnimatedHoverTextProps> = ({ text }) => {
    return (
        <span className="relative inline-flex overflow-hidden">
            {text.split('').map((char, index) => (
                <span key={index} className="relative inline-flex overflow-hidden">
                    <span 
                        className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                        style={{ transitionDelay: `${index * 15}ms` }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                    <span 
                        className="absolute left-0 inline-block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0"
                        style={{ transitionDelay: `${index * 15}ms` }}
                        aria-hidden="true"
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                </span>
            ))}
        </span>
    );
};
