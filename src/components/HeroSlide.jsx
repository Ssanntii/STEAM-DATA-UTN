import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { Play, Users, TrendingUp } from "lucide-react";
import Button from "../components/ui/Button"

const HeroSkeleton = () => (
  <div className="w-full h-[70vh] glass rounded-2xl animate-pulse flex items-end overflow-hidden">
    <div className="p-8 md:p-12 space-y-4 w-full max-w-2xl">
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-20 bg-white/10 rounded-full" />
        <div className="h-8 w-32 bg-white/10 rounded-full" />
      </div>
      <div className="h-14 bg-white/10 rounded-lg w-3/4" />
      <div className="h-6 bg-white/10 rounded-lg w-full" />
      <div className="h-6 bg-white/10 rounded-lg w-2/3" />
      <div className="h-12 bg-white/10 rounded-lg w-40 mt-6" />
    </div>
  </div>
);

const HeroSlide = ({ games, loading }) => {
  if (loading || !games || games.length === 0) {
    return <HeroSkeleton />;
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={games.length > 1}
        className="w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl"
      >
        {games.map((game, index) => (
          <SwiperSlide key={game.appid}>
            <motion.div
              className="relative w-full h-full flex items-end justify-start bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${game.background})`,
                backgroundColor: '#0f1419'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Overlay gradiente mejorado */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              
              {/* Contenido */}
              <motion.div 
                className="relative z-10 p-8 md:p-12 max-w-2xl"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <motion.span 
                    className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-white bg-primary/20 border border-primary/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    #{game.rank} Top
                  </motion.span>
                  
                  {game.players && (
                    <motion.span 
                      className="inline-flex items-center gap-1.5 text-xs md:text-sm text-gray-300 glass px-3 py-1.5 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {game.players.toLocaleString()} jugadores
                    </motion.span>
                  )}
                </div>
                
                {/* Título */}
                <motion.h2 
                  className="text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl mb-4 leading-tight"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {game.name}
                </motion.h2>
                
                {/* Descripción */}
                <motion.p 
                  className="text-base md:text-lg text-gray-200 leading-relaxed line-clamp-3 mb-6"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {game.short_description || "Descubre uno de los juegos más populares de Steam"}
                </motion.p>
                
                {/* Botones */}
                <motion.div 
                  className="flex flex-wrap gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
              <Button 
                variant="primary" 
                size="lg"
                className="font-semibold"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Ver detalles
                </Button>

                <Button variant="outline">
                Más información
                </Button>

                </motion.div>
              </motion.div>

              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Indicador de scroll (opcional) */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 text-white/60 text-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span>Desliza para más</span>
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          →
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSlide;