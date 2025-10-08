import { useState, useEffect } from 'react'
import GameCard from './GameCard'
import ViewToggle from './ui/ViewToggle'
import { motion } from 'framer-motion'

const GameList = () => {
    const [viewMode, setViewMode] = useState(() => {
        // Guardar preferencia en localStorage
        return localStorage.getItem('viewMode') || 'grid'
    })
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    // Guardar preferencia cuando cambie
    useEffect(() => {
        localStorage.setItem('viewMode', viewMode)
    }, [viewMode])

    // Simulación de carga de datos
    useEffect(() => {
        // Aquí irían tus fetch/axios calls
        setTimeout(() => {
            setGames([
                {
                    appid: 1,
                    name: 'Counter-Strike 2',
                    players: 1234567,
                    rank: 1,
                    rating: 4.8,
                    price: 'Free',
                    short_description: 'El clásico shooter táctico renovado...',
                    header_image: 'https://via.placeholder.com/460x215',
                    image: 'https://via.placeholder.com/184x69'
                },
                // ... más juegos
            ])
            setLoading(false)
        }, 1000)
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 glass rounded-lg w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 glass rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header con toggle */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Todos los Juegos</h1>
                    <p className="text-muted-foreground">
                        {games.length} juegos disponibles
                    </p>
                </div>
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            {/* Grid o List según viewMode */}
            <motion.div
                layout
                className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'flex flex-col gap-4'
                }
            >
                {games.map((game) => (
                    <motion.div
                        key={game.appid}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GameCard game={game} viewMode={viewMode} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

export default GameList