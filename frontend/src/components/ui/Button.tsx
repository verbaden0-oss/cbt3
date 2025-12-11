import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    ...props
}) => {
    const baseStyles = `
        inline-flex items-center justify-center rounded-xl font-medium 
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-[0.98]
    `;

    const variants: Record<string, string> = {
        primary: `
            bg-primary text-white 
            hover:bg-opacity-90 hover:shadow-lg hover:shadow-primary/25
            focus:ring-primary
        `,
        secondary: `
            bg-secondary text-white 
            hover:bg-opacity-90 hover:shadow-lg hover:shadow-secondary/25
            focus:ring-secondary
        `,
        accent: `
            bg-accent text-white 
            hover:bg-opacity-90 hover:shadow-lg hover:shadow-accent/25
            focus:ring-accent
        `,
        danger: `
            bg-error text-white 
            hover:bg-opacity-90 hover:shadow-lg hover:shadow-error/25
            focus:ring-error
        `,
        ghost: `
            bg-transparent text-text-primary 
            hover:bg-black/5 dark:hover:bg-white/10
            focus:ring-gray-400
        `,
        gradient: `
            bg-gradient-to-r from-primary via-purple-500 to-secondary 
            text-white font-semibold
            hover:shadow-lg hover:shadow-purple-500/30
            hover:brightness-110
            focus:ring-purple-500
            bg-size-200 animate-gradient
        `,
    };

    const sizes: Record<string, string> = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-5 py-2.5 text-base gap-2',
        lg: 'px-8 py-3.5 text-lg gap-3',
    };

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
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
