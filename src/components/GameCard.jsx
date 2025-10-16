import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Star, TrendingUp, Clock } from 'lucide-react'

// Componente para mostrar precios con descuento
const PriceDisplay = ({ game, size = 'normal' }) => {
    const hasDiscount = game.discount_percent && game.discount_percent > 0;
    
    // Si es gratis
    if (game.price === 'Gratis' || game.price === 'Free') {
        return (
            <div className={`font-bold text-green-500 ${size === 'large' ? 'text-xl' : 'text-base'}`}>
                Gratis
            </div>
        );
    }

    // Sin descuento
    if (!hasDiscount) {
        return (
            <div className={`font-bold text-foreground dark:text-white ${size === 'large' ? 'text-xl' : 'text-base'}`}>
                {game.price}
            </div>
        );
    }

    // Con descuento - Estilo Steam
    return (
        <div className="flex items-center gap-2">
            {/* Badge de descuento verde */}
            <div className="bg-[#4c6b22] text-[#beee11] px-2 py-1 rounded font-bold text-sm">
                -{game.discount_percent}%
            </div>
            
            {/* Precios */}
            <div className="flex flex-col items-end">
                <div className="text-xs text-foreground/50 dark:text-gray-500 line-through">
                    {game.original_price}
                </div>
                <div className={`font-bold text-[#beee11] ${size === 'large' ? 'text-xl' : 'text-base'}`}>
                    {game.price}
                </div>
            </div>
        </div>
    );
};

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
                        
                        {/* Badge de descuento (esquina superior izquierda) */}
                        {game.discount_percent > 0 && (
                            <div className="absolute top-3 left-3 bg-[#4c6b22] text-[#beee11] px-3 py-1.5 rounded font-bold shadow-lg">
                                -{game.discount_percent}%
                            </div>
                        )}

                        {/* Badge ranking (si no hay descuento, o moverlo a la derecha) */}
                        {game.rank && (
                            <div className={`absolute top-3 ${game.discount_percent > 0 ? 'right-3' : 'left-3'} flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold`}>
                                <TrendingUp className="w-3.5 h-3.5" />
                                #{game.rank}
                            </div>
                        )}
                    </div>

                    {/* Contenido */}
                    <div className="p-4 space-y-3">
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
                            {game.name}
                        </h3>
                        
                        {/* Stats - Solo mostrar si hay players Y rating */}
                        {((game.players && game.players > 0) || (game.current_players && game.current_players > 0) || game.rating) && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                {((game.players && game.players > 0) || (game.current_players && game.current_players > 0)) && (
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{(game.players || game.current_players).toLocaleString()}</span>
                                    </div>
                                )}
                                
                                {game.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span>{game.rating}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Precio con descuento */}
                        {game.price && (
                            <div className="flex items-center justify-end pt-2 border-t border-border/50">
                                <PriceDisplay game={game} size="normal" />
                            </div>
                        )}
                    </div>
                </Link>
            </motion.div>
        )
    }

    // Vista LIST (estilo de tu página principal)
    return (
        <motion.div
            whileHover={{ x: 4 }}
            className="glass rounded-xl overflow-hidden shadow-md group"
        >
            <Link to={`/game/${game.appid}`} className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-3 sm:p-5 items-start">
                {/* Imagen más grande a la izquierda */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-steam-dark to-steam-blue flex-shrink-0 w-full sm:w-auto">
                    <img
                        src={game.header_image || game.image || 'https://via.placeholder.com/230x107'}
                        alt={game.name}
                        className="w-full sm:w-[230px] h-[130px] sm:h-[107px] object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                    
                    {/* Badge de descuento (esquina superior izquierda) */}
                    {game.discount_percent > 0 && (
                        <div className="absolute top-2 left-2 bg-[#4c6b22] text-[#beee11] px-2.5 py-1 rounded font-bold text-sm shadow-lg">
                            -{game.discount_percent}%
                        </div>
                    )}

                    {/* Badge ranking (mover a la derecha si hay descuento) */}
                    {game.rank && (
                        <div className={`absolute top-2 ${game.discount_percent > 0 ? 'right-2' : 'left-2'} flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold`}>
                            <TrendingUp className="w-3 h-3" />
                            #{game.rank}
                        </div>
                    )}
                </div>

                {/* Contenido principal - Flex para poner precio a la derecha en desktop */}
                <div className="flex-1 flex flex-col justify-between min-h-[107px] w-full">
                    {/* Título y descripción */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg sm:text-xl group-hover:text-primary transition-colors flex-1">
                                {game.name}
                            </h3>
                            
                            {/* Precio en mobile (arriba a la derecha) */}
                            <div className="sm:hidden flex-shrink-0">
                                <PriceDisplay game={game} size="normal" />
                            </div>
                        </div>
                        
                        {game.short_description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {game.short_description}
                            </p>
                        )}
                    </div>

                    {/* Stats en la parte inferior */}
                    {((game.players && game.players > 0) || (game.current_players && game.current_players > 0) || game.rating || game.playtime) && (
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
                            {((game.players && game.players > 0) || (game.current_players && game.current_players > 0)) && (
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>{(game.players || game.current_players).toLocaleString()}</span>
                                </div>
                            )}
                            
                            {game.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{game.rating}</span>
                                </div>
                            )}

                            {game.playtime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>{game.playtime}h</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Precio a la derecha en desktop */}
                <div className="hidden sm:flex flex-shrink-0 items-start">
                    <div className="text-right">
                        <PriceDisplay game={game} size="large" />
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default GameCard