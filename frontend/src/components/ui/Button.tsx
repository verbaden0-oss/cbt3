import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'gradient' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    glow = false,
    disabled,
    ...props
}) => {
    const baseStyles = `
        relative inline-flex items-center justify-center rounded-xl font-medium 
        transition-all duration-300 ease-smooth
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-[0.98]
        btn-3d
    `;

    const variants: Record<string, string> = {
        primary: `
            bg-primary text-white 
            hover:bg-primary-light
            focus:ring-primary
            shadow-md hover:shadow-lg hover:shadow-primary/20
        `,
        secondary: `
            bg-secondary text-white 
            hover:bg-secondary-light
            focus:ring-secondary
            shadow-md hover:shadow-lg hover:shadow-secondary/20
        `,
        accent: `
            bg-accent text-white 
            hover:bg-accent-light
            focus:ring-accent
            shadow-md hover:shadow-lg hover:shadow-accent/20
        `,
        danger: `
            bg-error text-white 
            hover:bg-error-light
            focus:ring-error
            shadow-md hover:shadow-lg hover:shadow-error/20
        `,
        ghost: `
            bg-transparent text-text-primary 
            hover:bg-surface-elevated
            focus:ring-primary/50
            border border-transparent hover:border-border
        `,
        gradient: `
            bg-gradient-to-r from-primary via-primary-light to-accent
            text-white font-semibold
            shadow-lg hover:shadow-xl
            hover:brightness-110
            focus:ring-primary
            bg-[length:200%_auto] hover:bg-right
        `,
        outline: `
            bg-transparent text-primary
            border-2 border-primary
            hover:bg-primary hover:text-white
            focus:ring-primary
        `,
    };

    const sizes: Record<string, string> = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-5 py-2.5 text-base gap-2',
        lg: 'px-8 py-3.5 text-lg gap-3',
    };

    const glowStyles = glow ? 'animate-glow' : '';

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${glowStyles}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
};
