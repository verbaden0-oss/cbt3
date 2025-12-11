import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    variant?: 'default' | 'premium';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    variant = 'default',
    ...props
}) => {
    const baseClass = variant === 'premium' ? 'glass-card-premium' : 'glass-card';

    return (
        <div
            className={`${baseClass} ${noPadding ? 'p-0' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
