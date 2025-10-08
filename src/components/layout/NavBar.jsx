import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../../contexts/ThemeContext'
import useDebounce from '../../hooks/useDebounce'
import { Search, Sun, Moon, TrendingUp, Tag, Gamepad2 } from 'lucide-react'

const Navbar = () => {
    const { darkMode, setDarkMode } = useContext(ThemeContext)
    const [query, setQuery] = useState('')
    const debounced = useDebounce(query, 450)
    const navigate = useNavigate()

    const onSubmit = (e) => { 
        e.preventDefault()
        navigate(`/?q=${encodeURIComponent(query)}`) 
    }

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-6">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-steam-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                    >
                        <Gamepad2 className="w-6 h-6 text-steam-accent" />
                        <span className="hidden sm:inline">STEAM DATA</span>
                    </Link>

                    {/* Buscador */}
                    <form onSubmit={onSubmit} className="flex-1 max-w-md">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar juegos..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm
                                         focus:ring-2 focus:ring-primary/50 focus:border-primary
                                         transition-all duration-200 placeholder:text-muted-foreground"
                            />
                        </div>
                    </form>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2">
                        <Link 
                            to="/top-sellers" 
                            className="flex items-center gap-2 glass px-4 py-2 rounded-xl 
                                     hover:bg-primary/10 hover:border-primary/50 transition-all duration-200
                                     text-sm font-medium group"
                        >
                            <TrendingUp className="w-4 h-4 group-hover:text-primary transition-colors" />
                            <span className="hidden md:inline">Top Sellers</span>
                        </Link>
                        
                        <Link 
                            to="/offers" 
                            className="flex items-center gap-2 glass px-4 py-2 rounded-xl 
                                     hover:bg-steam-green/10 hover:border-steam-green/50 transition-all duration-200
                                     text-sm font-medium group"
                        >
                            <Tag className="w-4 h-4 group-hover:text-steam-green transition-colors" />
                            <span className="hidden md:inline">Ofertas</span>
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 rounded-xl glass hover:bg-primary/10 hover:border-primary/50
                                     transition-all duration-200 group"
                            aria-label="Cambiar tema"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 group-hover:text-yellow-400 group-hover:rotate-90 transition-all duration-300" />
                            ) : (
                                <Moon className="w-5 h-5 group-hover:text-blue-400 group-hover:-rotate-12 transition-all duration-300" />
                            )}
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Navbar