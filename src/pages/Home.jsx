import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import HeroSlide from "../components/HeroSlide";
import useGamesStore from "../hooks/useGamesStore";
import GameCard from "../components/GameCard";
import ViewToggle from "../components/ui/ViewToggle";

function HomePage({ games, viewMode }) {
  const containerClasses = viewMode === "grid"
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
    : "flex flex-col gap-4";

  return (
    <div className={containerClasses}>
      {games.map((game) => (
        <GameCard key={game.appid} game={game} viewMode={viewMode} />
      ))}
    </div>
  );
}

export default function Home() {
  const {
    topGames,
    loading,
    error,
    fetchTopGames,
  } = useGamesStore();

  const [viewMode, setViewMode] = useState("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTopGames(20);
  }, [fetchTopGames]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTopGames(20, { forceRefresh: true });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass p-8 rounded-2xl max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-foreground/70 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-foreground/60 dark:text-gray-500">Posibles causas:</p>
          <ul className="text-sm text-foreground/60 dark:text-gray-500 text-left mt-2 space-y-1">
            <li>• Problemas de CORS (verifica el proxy en vite.config.js)</li>
            <li>• API key inválida o expirada</li>
            <li>• Rate limiting de Steam</li>
            <li>• Conexión a internet</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Carousel */}
      <section>
        <HeroSlide games={topGames.slice(0, 10)} loading={loading} />
      </section>

      {/* Header con título y controles */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-foreground dark:text-white">
            Top Juegos Más Jugados
          </h2>
          <Link 
            to="/most-played"
            className="text-sm text-foreground/60 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors flex items-center gap-1 group"
          >
            Ver todos
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ViewToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Subtítulo */}
      <p className="text-lg text-foreground/70 dark:text-gray-400 -mt-6 mb-6">
        Los juegos con más jugadores activos ahora mismo
      </p>

      {/* Grid/List de juegos */}
      {!loading && topGames.length > 0 && (
        <HomePage games={topGames} viewMode={viewMode} />
      )}

      {/* Stats Section - MEJORADO PARA MODO CLARO */}
      {!loading && topGames.length > 0 && (
        <section className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {topGames[0]?.concurrent_in_game?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Jugadores en #{1}
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1 truncate">
                {topGames[0]?.name || "N/A"}
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {topGames
                  .reduce(
                    (sum, game) => sum + (game.concurrent_in_game || 0),
                    0
                  )
                  .toLocaleString()}
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Total de jugadores
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1">
                En top {topGames.length} juegos
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {topGames.filter((g) => g.price === "Gratis").length}
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Juegos gratuitos
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1">
                En el top {topGames.length}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}