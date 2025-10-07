import { useEffect, useState } from "react";
import HeroSlide from "../components/HeroSlide";
import GameGrid from "../components/GameGrid";
import steamApi from "../api/steamApi";
import apiConfig from "../api/apiConfig";

export default function Home() {
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        setLoading(true);
        const response = await steamApi.getTopPlayed();
        
        console.log('Steam API Response:', response); // Para debug
        
        // La respuesta de Steam viene en response.response.ranks
        const games = response?.response?.ranks || [];
        
        // Transformar los datos para que coincidan con tu estructura
        const transformedGames = games.map(game => ({
          appid: game.appid,
          rank: game.rank,
          name: `Game ${game.appid}`, // Steam no devuelve nombre en este endpoint
          players: game.concurrent_in_game?.toLocaleString() || '0',
          // Construir URLs de imágenes
          image: apiConfig.getCapsuleImage(game.appid),
          background: apiConfig.getLibraryImage(game.appid),
          short_description: `Ranked #${game.rank} - ${game.concurrent_in_game?.toLocaleString()} players online`
        }));

        setTopGames(transformedGames);
        setError(null);
      } catch (err) {
        console.error('Error fetching top games:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopGames();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Verifica la consola para más detalles. Es posible que haya problemas de CORS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HeroSlide games={topGames.slice(0, 10)} loading={loading} />
      
      <section className="px-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Top Juegos Más Jugados
        </h2>
        <GameGrid games={topGames} loading={loading} />
      </section>
    </div>
  );
}