import { useEffect, useState } from "react";
import { ChevronLeft, Percent } from "lucide-react";
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

export default function Offers() {
  const {
    offersGames,
    loading,
    error,
    fetchOffers,
  } = useGamesStore();

  const [viewMode, setViewMode] = useState("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOffers(150);
  }, [fetchOffers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchOffers(150, { forceRefresh: true });
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

  // Calcular descuento promedio
  const averageDiscount = offersGames.length > 0
    ? Math.round(
        offersGames.reduce((sum, game) => sum + (game.discount_percent || 0), 0) /
        offersGames.length
      )
    : 0;

  // Encontrar el mayor descuento
  const maxDiscount = offersGames.length > 0
    ? Math.max(...offersGames.map(g => g.discount_percent || 0))
    : 0;

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
        
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white">
            Ofertas Especiales
          </h1>
          <Percent className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <p className="text-lg text-foreground/70 dark:text-gray-400">
          Los mejores descuentos de Steam ahora mismo
        </p>
      </div>

      {/* Controles de vista */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-foreground/60 dark:text-gray-500">
          {loading ? (
            "Cargando ofertas..."
          ) : (
            `Mostrando ${offersGames.length} ofertas`
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
      {!loading && offersGames.length > 0 && (
        <GamesGrid games={offersGames} viewMode={viewMode} />
      )}

      {/* Stats Section */}
      {!loading && offersGames.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground dark:text-white mb-6">
            Estadísticas de Ofertas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                -{maxDiscount}%
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Mayor descuento
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1">
                ¡Ofertaza!
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {offersGames.filter((g) => (g.discount_percent || 0) >= 75).length}
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Con -75% o más
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1">
                ¡Super ofertas!
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {offersGames.filter((g) => (g.discount_percent || 0) >= 50).length}
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Con -50% o más
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1">
                Descuentos grandes
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                -{averageDiscount}%
              </div>
              <div className="text-sm text-foreground/70 dark:text-gray-400 mt-1">
                Descuento promedio
              </div>
              <div className="text-xs text-foreground/60 dark:text-gray-500 mt-1">
                En todas las ofertas
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}