import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

// Skeleton simple para loading
const SkeletonCard = () => (
  <div className="animate-pulse bg-white/5 backdrop-blur-md rounded-2xl p-4 h-32 flex flex-col gap-2">
    <div className="bg-white/10 h-16 w-full rounded-md" />
    <div className="bg-white/10 h-4 w-3/4 rounded-md mt-2" />
    <div className="bg-white/10 h-3 w-1/2 rounded-md mt-1" />
  </div>
);

// Fancy GameCard con parallax
const GameCard = ({ game }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-20, 20], [8, -8]);
  const rotateY = useTransform(x, [-20, 20], [-8, 8]);

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) / 20);
        y.set((e.clientY - rect.top - rect.height / 2) / 20);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.03, y: -6 }}
      className="glass rounded-2xl p-4 shadow-lg min-h-[180px] cursor-pointer transition-shadow hover:shadow-xl"
    >
      <Link to={`/game/${game.appid}`}>
        <div className="flex gap-4 items-start">
          <div className="relative flex-shrink-0">
            <img
              src={game.image}
              alt={game.name}
              className="w-28 h-16 object-cover rounded-md"
              onError={(e) => {
                // Fallback si la imagen no carga
                e.target.src = 'https://via.placeholder.com/120x68/1a1a2e/ffffff?text=No+Image';
              }}
            />
            {game.rank && (
              <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {game.rank}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white line-clamp-2 mb-1">
              {game.name}
            </h3>
            <p className="text-sm text-gray-400">
              {game.players} jugadores
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const GameGrid = ({ games, loading }) => {
  // Si loading, mostrar skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No hay juegos para mostrar.</p>
        <p className="text-gray-500 text-sm mt-2">
          Intenta recargar la página o verifica tu conexión.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {games.map((game) => (
        <GameCard key={game.appid} game={game} />
      ))}
    </div>
  );
};

export default GameGrid;