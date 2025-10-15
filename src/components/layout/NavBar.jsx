import { useContext, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../../contexts/ThemeContext'
import useDebounce from '../../hooks/useDebounce'
import steamApi from '../../api/steamApi'
import SearchDropdown from './SearchDropdown'
import { Search, Sun, Moon, Gift, DollarSign, Gamepad2, Rocket, Menu, X } from 'lucide-react'

const Navbar = () => {
    const { darkMode, setDarkMode } = useContext(ThemeContext)
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const debounced = useDebounce(query, 450)
    const navigate = useNavigate()
    const searchRef = useRef(null)

    // Efecto para buscar sugerencias cuando cambia el término debounced
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debounced.trim().length < 2) {
                setSuggestions([])
                setShowDropdown(false)
                return
            }

            setLoading(true)
            setShowDropdown(true)

            try {
                const results = await steamApi.searchGamesAdvanced(debounced, {
                    limit: 5,
                    includeDetails: false,
                    onlyGames: true
                })
                
                setSuggestions(results)
            } catch (error) {
                console.error('Error al buscar sugerencias:', error)
                setSuggestions([])
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestions()
    }, [debounced])

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Bloquear scroll cuando el menú está abierto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

    const onSubmit = (e) => { 
        e.preventDefault()
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`)
            setShowDropdown(false)
            setIsMenuOpen(false)
        }
    }

    const handleSelectGame = () => {
        setQuery('')
        setSuggestions([])
        setShowDropdown(false)
    }

    const handleLinkClick = () => {
        setIsMenuOpen(false)
    }

    const navLinks = [
        {
            to: '/most-played',
            icon: Rocket,
            label: 'Más Jugados',
            hoverColor: 'hover:bg-purple-500/10 hover:border-purple-500/50',
            iconHoverColor: 'group-hover:text-purple-400'
        },
        {
            to: '/top-sellers',
            icon: DollarSign,
            label: 'Más Vendidos',
            hoverColor: 'hover:bg-steam-green/10 hover:border-steam-green/50',
            iconHoverColor: 'group-hover:text-steam-green'
        },
        {
            to: '/offers',
            icon: Gift,
            label: 'Ofertas',
            hoverColor: 'hover:bg-primary/10 hover:border-primary/50',
            iconHoverColor: 'group-hover:text-primary'
        }
    ]

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-3 md:gap-6">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-steam-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                        <Gamepad2 className="w-6 h-6 text-steam-accent" />
                        <span className="hidden sm:inline">STEAM DATA</span>
                    </Link>

                    {/* Buscador - Desktop y Mobile */}
                    <form onSubmit={onSubmit} className="flex-1 max-w-md relative md:block" ref={searchRef}>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0 && query.trim().length >= 2) {
                                        setShowDropdown(true)
                                    }
                                }}
                                placeholder="Buscar juegos..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm
                                         focus:ring-2 focus:ring-primary/50 focus:border-primary
                                         transition-all duration-200 placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Dropdown de sugerencias */}
                        {showDropdown && (
                            <SearchDropdown 
                                suggestions={suggestions}
                                loading={loading}
                                query={query}
                                onSelectGame={handleSelectGame}
                                onClose={() => setShowDropdown(false)}
                            />
                        )}
                    </form>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-2 glass px-4 py-2 rounded-xl 
                                    ${link.hoverColor} transition-all duration-200
                                    text-sm font-medium group`}
                            >
                                <link.icon className={`w-4 h-4 ${link.iconHoverColor} transition-colors`} />
                                <span>{link.label}</span>
                            </Link>
                        ))}

                        {/* Theme Toggle - Desktop */}
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

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 rounded-xl glass hover:bg-primary/10 hover:border-primary/50
                                     transition-all duration-200 flex-shrink-0"
                            aria-label="Abrir menú"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        {/* Theme Toggle - Mobile */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 rounded-xl glass hover:bg-primary/10 hover:border-primary/50
                                     transition-all duration-200 group flex-shrink-0"
                            aria-label="Cambiar tema"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                            ) : (
                                <Moon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-white dark:bg-[#0a0e27] z-[100] animate-in slide-in-from-right duration-300">
                    <div className="h-full flex flex-col">
                        {/* Header del menú */}
                        <div className="flex items-center justify-between h-16 border-b border-border/50 px-4">
                            <Link 
                                to="/" 
                                onClick={handleLinkClick}
                                className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-steam-accent to-primary bg-clip-text text-transparent"
                            >
                                <Gamepad2 className="w-6 h-6 text-steam-accent" />
                                <span>STEAM DATA</span>
                            </Link>

                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2.5 rounded-xl glass hover:bg-primary/10 hover:border-primary/50
                                         transition-all duration-200"
                                aria-label="Cerrar menú"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 flex flex-col items-center justify-center gap-6 py-8 px-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.to}
                                    to={link.to}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-3 glass px-8 py-4 rounded-xl 
                                        ${link.hoverColor} transition-all duration-200
                                        text-lg font-medium group w-full max-w-xs justify-center`}
                                >
                                    <link.icon className={`w-5 h-5 ${link.iconHoverColor} transition-colors`} />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Footer info */}
                        <div className="pb-8 text-center text-sm text-muted-foreground px-4">
                            <p>© 2025 STEAM DATA UTN - Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar