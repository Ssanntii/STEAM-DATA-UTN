import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../../contexts/ThemeContext'
import useDebounce from '../../hooks/useDebounce'
import { Search } from 'lucide-react'

const Navbar = () => {
    const { darkMode, setDarkMode } = useContext(ThemeContext)
    const [query, setQuery] = useState('')
    const debounced = useDebounce(query, 450)
    const navigate = useNavigate()

    // ejemplo simple: navegá a /?q=... o ejecutá fetch
    const onSubmit = (e) => { e.preventDefault(); navigate(`/?q=${encodeURIComponent(query)}`) }

    return (
        <header className="py-4 bg-transparent">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-bold">STEAM DATA UTN</Link>

                <form onSubmit={onSubmit} className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar juegos..."
                            className="pl-10 pr-3 py-2 rounded-xl glass w-64"
                        />
                        <Search className="absolute left-3 top-2.5 w-5 h-5 opacity-70" />
                    </div>
                    <button type="submit" className="px-3 py-2 rounded-xl glass">Buscar</button>
                </form>

                <div className="flex items-center gap-3">
                    <Link to="/top-sellers" className="glass px-3 py-2 rounded-xl">Top Sellers</Link>
                    <Link to="/deals" className="glass px-3 py-2 rounded-xl">Deals</Link>

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full glass"
                        aria-label="toggle theme"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar