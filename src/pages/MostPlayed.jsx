import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import useGamesStore from "../hooks/useGamesStore";
import GameCard from "../components/GameCard";
import ViewToggle from "../components/ui/ViewToggle";

function GamesGrid({ games, viewMode }) {
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

export default function MostPlayed() {
  const {
    topGames,
    loading,
    error,
    fetchTopGames,
  } = useGamesStore();

  const [viewMode, setViewMode] = useState("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTopGames(150);
  }, [fetchTopGames]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTopGames(150, { forceRefresh: true });
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
      {/* Header con breadcrumb */}
      <div className="space-y-2">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white">
          Juegos Más Jugados
        </h1>
        
        <p className="text-lg text-foreground/70 dark:text-gray-400">
          Top juegos con más jugadores activos en este momento
        </p>
      </div>

      {/* Controles de vista */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-foreground/60 dark:text-gray-500">
          {loading ? (
            "Cargando juegos..."
          ) : (
            `Mostrando ${topGames.length} juegos`
          )}
        </div>
        
        <ViewToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[460/215] bg-foreground/10 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-foreground/10 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-foreground/10 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid/List de juegos */}
      {!loading && topGames.length > 0 && (
        <GamesGrid games={topGames} viewMode={viewMode} />
      )}
    </div>
  );
}