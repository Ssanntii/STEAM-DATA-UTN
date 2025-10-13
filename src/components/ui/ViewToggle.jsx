import { LayoutGrid, List, RefreshCw } from 'lucide-react'

const Button = ({ variant = 'ghost', size = 'default', onClick, className = '', children, disabled, ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white',
        ghost: 'hover:bg-primary/10 text-foreground/70 hover:text-primary dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white',
    }
    
    const sizes = {
        default: 'px-4 py-2 text-sm',
        icon: 'w-9 h-9',
    }
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

const ViewToggle = ({ viewMode, setViewMode, onRefresh, isRefreshing = false }) => {
    return (
        <div className="flex items-center gap-2">           
            {/* Toggle Grid/List */}
            <div className="flex items-center gap-1 glass rounded-lg p-1">
                <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="relative"
                    aria-label="Vista en cuadrícula"
                >
                    <LayoutGrid className="w-4 h-4" />
                </Button>
                
                <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    aria-label="Vista en lista"
                >
                    <List className="w-4 h-4" />
                </Button>
            </div>
            
            {/* Botón de Refresh */}
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="glass rounded-lg p-1 hover:bg-primary/10 dark:hover:bg-white/10 transition-all duration-200 group"
                    aria-label="Actualizar datos"
                >
                    <div className="w-9 h-9 flex items-center justify-center">
                        <RefreshCw 
                            className={`w-4 h-4 text-foreground/70 group-hover:text-primary transition-colors dark:text-gray-400 ${
                                isRefreshing ? 'animate-spin text-primary' : ''
                            }`} 
                        />
                    </div>
                </button>
            )}
        </div>
    )
}

export default ViewToggle