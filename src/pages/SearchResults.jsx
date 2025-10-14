import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import steamApi from '../api/steamApi'
import ViewToggle from '../components/ui/ViewToggle'
import GameCard from '../components/GameCard'
import { Search, Loader2, ArrowLeft } from 'lucide-react'

const SearchResults = () => {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState('list') // Por defecto LIST como tu página

    useEffect(() => {
        const searchGames = async () => {
            if (!query.trim()) return

            setLoading(true)
            setError(null)

            try {
                // ✅ Traer hasta 50 juegos incluyendo DLCs
                const games = await steamApi.searchGamesAdvanced(query, {
                    limit: 50, // 👈 Aumentado a 50 juegos
                    includeDetails: true,
                    onlyGames: false, // 👈 Incluir DLCs y todo
                    includePlayers: false
                })
                
                setResults(games)
            } catch (err) {
                console.error('Error al buscar juegos:', err)
                setError('Hubo un error al buscar juegos. Intenta nuevamente.')
            } finally {
                setLoading(false)
            }
        }

        searchGames()
    }, [query])

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3 sm:mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>
                
                <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold">Resultados de búsqueda</h1>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                                {query ? `Resultados para "${query}"` : 'Sin término de búsqueda'}
                            </p>
                        </div>
                    </div>

                    {/* ViewToggle solo si hay resultados */}
                    {!loading && results.length > 0 && (
                        <ViewToggle 
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Buscando juegos...</p>
                    <p className="text-sm text-muted-foreground/70">Esto puede tomar unos segundos...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="glass rounded-xl p-8 text-center">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {/* Results */}
            {!loading && !error && (
                <>
                    {results.length > 0 ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-6">
                                Se encontraron {results.length} juegos
                            </p>
                            
                            {/* Grid View - Responsive */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                    {results.map((game) => (
                                        <GameCard 
                                            key={game.appid} 
                                            game={game}
                                            viewMode="grid" 
                                        />
                                    ))}
                                </div>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="flex flex-col gap-4">
                                    {results.map((game) => (
                                        <GameCard 
                                            key={game.appid} 
                                            game={game}
                                            viewMode="list" 
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        !loading && (
                            <div className="glass rounded-xl p-12 text-center">
                                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h2 className="text-2xl font-bold mb-2">No se encontraron juegos</h2>
                                <p className="text-muted-foreground mb-6">
                                    No hay resultados para "{query}"
                                </p>
                                <Link 
                                    to="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl transition-colors"
                                >
                                    Explorar juegos populares
                                </Link>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    )
}

export default SearchResults