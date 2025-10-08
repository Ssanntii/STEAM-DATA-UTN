import { useEffect, useState } from "react";
import HeroSlide from "../components/HeroSlide";
import GameGrid from "../components/GameGrid";
import useGamesStore from "../hooks/useGamesStore";
import GameCard from "../components/GameCard";
import ViewToggle from "../components/ui/ViewToggle";

function HomePage({ games }) {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div>
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {games.map((game) => (
          <GameCard key={game.appid} game={game} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const {
    topGames,
    loading,
    error,
    progress,
    fetchTopGames,
    refresh,
  } = useGamesStore();

  useEffect(() => {
    fetchTopGames(20);
  }, [fetchTopGames]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass p-8 rounded-2xl max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Posibles causas:</p>
          <ul className="text-sm text-gray-500 text-left mt-2 space-y-1">
            <li>• Problemas de CORS (verifica el proxy en vite.config.js)</li>
            <li>• API key inválida o expirada</li>
            <li>• Rate limiting de Steam</li>
            <li>• Conexión a internet</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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

      {/* Top Games con toggle */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Top Juegos Más Jugados
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Los juegos con más jugadores activos ahora mismo
            </p>
          </div>
        </div>

        {/* 🔹 Acá usamos HomePage */}
        {!loading && topGames.length > 0 && <HomePage games={topGames} />}
      </section>

      {/* Stats Section */}
      {!loading && topGames.length > 0 && (
        <section className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-blue-400">
                {topGames[0]?.players || "0"}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Jugadores en #{1}
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {topGames[0]?.name || "N/A"}
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-cyan-400">
                {topGames
                  .reduce(
                    (sum, game) => sum + (game.concurrent_in_game || 0),
                    0
                  )
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Total de jugadores
              </div>
              <div className="text-xs text-gray-500 mt-1">
                En top {topGames.length} juegos
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <div className="text-3xl font-bold text-purple-400">
                {topGames.filter((g) => g.price === "Gratis").length}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Juegos gratuitos
              </div>
              <div className="text-xs text-gray-500 mt-1">
                En el top {topGames.length}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
