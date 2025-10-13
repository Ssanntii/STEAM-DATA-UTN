import { forwardRef } from 'react'

const Button = forwardRef(({ 
    children, 
    className = '', 
    variant = 'default',
    size = 'md',
    disabled = false,
    ...props 
}, ref) => {
    
    const variants = {
        default: 'glass hover:bg-white/10 dark:hover:bg-white/10 text-foreground border-border',
        primary: 'bg-primary hover:bg-primary/90 text-white border-primary/50 shadow-lg shadow-primary/20',
        secondary: 'bg-muted hover:bg-muted/80 text-muted-foreground border-muted',
        success: 'bg-steam-green hover:bg-steam-green/90 text-white border-steam-green/50 shadow-lg shadow-steam-green/20',
        danger: 'bg-steam-red hover:bg-steam-red/90 text-white border-steam-red/50 shadow-lg shadow-steam-red/20',
        ghost: 'hover:bg-primary/10 dark:hover:bg-white/5 text-foreground border-transparent',
        outline: 'bg-transparent hover:bg-white/10 text-white border-white/30 hover:border-white/50 backdrop-blur-sm shadow-xl',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
    }

    const baseStyles = `
        inline-flex items-center justify-center gap-2 
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:pointer-events-none
        hover:scale-[1.02] active:scale-[0.98]
    `

    return (
        <button
            ref={ref}
            disabled={disabled}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export default Button