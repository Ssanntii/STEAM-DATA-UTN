import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

const HeroSkeleton = () => (
  <div className="w-full h-[60vh] bg-white/5 backdrop-blur-md rounded-2xl animate-pulse flex items-end">
    <div className="p-8 space-y-4 w-full max-w-xl">
      <div className="h-12 bg-white/10 rounded-lg w-3/4" />
      <div className="h-6 bg-white/10 rounded-lg w-full" />
      <div className="h-6 bg-white/10 rounded-lg w-2/3" />
      <div className="h-10 bg-white/10 rounded-lg w-32 mt-4" />
    </div>
  </div>
);

const HeroSlide = ({ games, loading }) => {
  // Mostrar skeleton mientras carga
  if (loading || !games || games.length === 0) {
    return <HeroSkeleton />;
  }

  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      loop={games.length > 1}
      className="w-full h-[60vh] rounded-2xl overflow-hidden"
    >
      {games.map((game) => (
        <SwiperSlide key={game.appid}>
          <motion.div
            className="relative w-full h-full flex items-end justify-start bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${game.background})`,
              // Fallback si la imagen no carga
              backgroundColor: '#1a1a2e'
            }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          >
            {/* Overlay con Glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="relative z-10 p-8 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                  #{game.rank}
                </span>
                <span className="text-sm text-gray-300">
                  {game.players} jugadores
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">
                {game.name}
              </h2>
              
              <p className="text-gray-300 mt-2 line-clamp-2">
                {game.short_description}
              </p>
              
              <button className="mt-6 bg-white/10 border border-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold">
                Ver detalles
              </button>
            </div>
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlide;