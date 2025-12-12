import React, { useRef, useEffect } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'spotlight' | 'premium';
    interactive?: boolean;
    glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    variant = 'default',
    interactive = false,
    glow = false,
    ...props
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Spotlight effect - track mouse position
    useEffect(() => {
        if (variant !== 'spotlight') return;
        
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, [variant]);

    const baseStyles = noPadding ? '' : 'p-5 md:p-6';
    
    const variantStyles: Record<string, string> = {
        default: 'glass-card',
        elevated: 'card-elevated',
        outlined: 'card-outlined',
        gradient: 'card-gradient',
        spotlight: 'card-spotlight',
        premium: 'glass-card-premium',
    };

    const interactiveStyles = interactive 
        ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform' 
        : '';

    const glowStyles = glow ? 'animate-glow' : '';

    return (
        <div
            ref={cardRef}
            className={`
                ${variantStyles[variant]}
                ${baseStyles}
                ${interactiveStyles}
                ${glowStyles}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
        >
            {children}
        </div>
    );
};

// Skeleton Card for loading states
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`glass-card p-5 md:p-6 ${className}`}>
        <div className="space-y-3">
            <div className="animate-shimmer h-4 w-24 rounded-lg" />
            <div className="animate-shimmer h-3 w-full rounded-lg" />
            <div className="animate-shimmer h-3 w-3/4 rounded-lg" />
        </div>
    </div>
);
