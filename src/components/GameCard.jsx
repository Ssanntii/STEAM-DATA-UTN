import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Star, TrendingUp, Clock } from 'lucide-react'

const GameCard = ({ game, viewMode = 'grid' }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-20, 20], [8, -8])
    const rotateY = useTransform(x, [-20, 20], [-8, 8])

    const handleMouseMove = (e) => {
        if (viewMode !== 'grid') return
        const rect = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - rect.left - rect.width / 2) / 20)
        y.set((e.clientY - rect.top - rect.height / 2) / 20)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    // Vista GRID (tarjetas)
    if (viewMode === 'grid') {
        return (
            <motion.div
                style={{ rotateX, rotateY }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.03, y: -8 }}
                className="glass rounded-2xl overflow-hidden shadow-lg group"
            >
                <Link to={`/game/${game.appid}`} className="block">
                    {/* Imagen */}
                    <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-steam-dark to-steam-blue">
                        <img
                            src={game.header_image || game.image || 'https://via.placeholder.com/460x215'}
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                        {/* Overlay hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge ranking */}
                        {game.rank && (
                            <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold">
                                <TrendingUp className="w-3.5 h-3.5" />
                                #{game.rank}
                            </div>
                        )}
                    </div>

                    {/* Contenido */}
                    <div className="p-4 space-y-3">
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {game.name}
                        </h3>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            {game.players && (
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    <span>{game.players.toLocaleString()}</span>
                                </div>
                            )}
                            
                            {game.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{game.rating}</span>
                                </div>
                            )}
                        </div>

                        {/* Precio */}
                        {game.price && (
                            <div className="flex items-center justify-end pt-2 border-t border-border/50">

                                <span className="font-bold text-steam-green">{game.price}</span>
                            </div>
                        )}
                    </div>
                </Link>
            </motion.div>
        )
    }

    // Vista LIST (filas)
    return (
        <motion.div
            whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            className="glass rounded-xl overflow-hidden shadow-md group"
        >
            <Link to={`/game/${game.appid}`} className="flex gap-4 p-4 items-center">
                {/* Imagen */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-steam-dark to-steam-blue flex-shrink-0">
                    <img
                        src={game.image || game.header_image || 'https://via.placeholder.com/184x69'}
                        alt={game.name}
                        className="w-32 h-[72px] md:w-40 md:h-[90px] object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                    {game.rank && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            <TrendingUp className="w-3 h-3" />
                            #{game.rank}
                        </div>
                    )}
                </div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors mb-1">
                        {game.name}
                    </h3>
                    
                    {game.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 hidden md:block">
                            {game.short_description}
                        </p>
                    )}

                    {/* Stats inline */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        {game.players && (
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>{game.players.toLocaleString()}</span>
                            </div>
                        )}
                        
                        {game.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{game.rating}</span>
                            </div>
                        )}

                        {game.playtime && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{game.playtime}h</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Precio (derecha) */}
                {game.price && (
                    <div className="flex-shrink-0 text-right">
                        <div className="font-bold text-lg text-steam-green">
                            {game.price}
                        </div>
                    </div>
                )}
            </Link>
        </motion.div>
    )
}

export default GameCard