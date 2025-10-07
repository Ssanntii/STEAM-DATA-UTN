const Button = ({ children, className = '', ...props }) => {
    return (
        <button
            {...props}
            className={`px-4 py-2 rounded-lg glass hover:scale-[1.02] transition ${className}`}
        >
            {children}
        </button>
    )
}

export default Button