import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Tag, DollarSign, Trophy, ArrowLeft } from 'lucide-react';
import steamApi from '../api/steamApi';
import LineChartPlayers from '../components/charts/LineChartsPlayers';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const details = await steamApi.getAppDetails(id);
        console.log('Detalles del juego:', details);
        setGame(details);
      } catch (err) {
        console.error('Error cargando detalles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGameDetails();
    }
  }, [id]);

  // Datos de ejemplo para el chart (en producción, obtenerlos de una API real)
  const playerData = [
    { date: '2025-09-30', players: 12000 },
    { date: '2025-10-01', players: 15000 },
    { date: '2025-10-02', players: 9000 },
    { date: '2025-10-03', players: 13000 },
    { date: '2025-10-04', players: 14500 },
    { date: '2025-10-05', players: 16000 },
    { date: '2025-10-06', players: 15500 },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-white/5 rounded-lg" />
            <div className="h-96 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-96 bg-white/5 rounded-2xl" />
              <div className="h-96 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <div className="min-h-screen px-6 py-8 flex items-center justify-center">
        <div className="text-center glass p-8 rounded-2xl max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400 mb-4">
            {error || 'No se pudo cargar el juego'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isFree = game.is_free;
  const price = isFree ? 'Gratis' : game.price_overview?.final_formatted || 'N/A';
  const hasMetacritic = game.metacritic && game.metacritic.score;

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header con imagen de fondo */}
        <div className="relative rounded-2xl overflow-hidden">
          <div
            className="h-96 bg-cover bg-center"
            style={{
              backgroundImage: `url(${game.background || game.background_raw})`,
            }}
          >
            <div className="absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-start gap-6">
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="w-64 rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/460x215/1a1a2e/ffffff?text=${encodeURIComponent(game.name)}`;
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {game.name}
                  </h1>
                  <p className="text-gray-300 text-lg mb-4">
                    {game.short_description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {game.developers?.map((dev, i) => (
                      <span
                        key={i}
                        className="badge bg-blue-600/30 text-blue-300 border border-blue-500/30"
                      >
                        {dev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Precio</span>
            </div>
            <div className="text-2xl font-bold">{price}</div>
          </div>

          <div className="glass p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Lanzamiento</span>
            </div>
            <div className="text-lg font-bold">
              {game.release_date?.date || 'TBA'}
            </div>
          </div>

          {hasMetacritic && (
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Metacritic</span>
              </div>
              <div className="text-2xl font-bold">{game.metacritic.score}</div>
            </div>
          )}

          {game.recommendations && (
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Reseñas</span>
              </div>
              <div className="text-2xl font-bold">
                {game.recommendations.total.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart de jugadores */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Jugadores activos
            </h2>
            <LineChartPlayers data={playerData} />
            <p className="text-xs text-gray-500 mt-2">
              * Datos de ejemplo. En producción, usar una API real de históricos.
            </p>
          </div>

          {/* Info lateral */}
          <div className="space-y-6">
            {/* Géneros */}
            {game.genres && game.genres.length > 0 && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-400" />
                  Géneros
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="badge bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                    >
                      {genre.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Plataformas */}
            {game.platforms && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-3">Plataformas</h3>
                <div className="space-y-2">
                  {game.platforms.windows && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-blue-400">●</span>
                      Windows
                    </div>
                  )}
                  {game.platforms.mac && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-blue-400">●</span>
                      Mac
                    </div>
                  )}
                  {game.platforms.linux && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-blue-400">●</span>
                      Linux
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publishers */}
            {game.publishers && game.publishers.length > 0 && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-3">Distribuidores</h3>
                <div className="space-y-1">
                  {game.publishers.map((pub, i) => (
                    <div key={i} className="text-gray-300">
                      {pub}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripción completa */}
        {game.detailed_description && (
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Acerca de este juego</h2>
            <div
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: game.detailed_description }}
            />
          </div>
        )}

        {/* Screenshots */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Capturas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {game.screenshots.slice(0, 6).map((screenshot) => (
                <img
                  key={screenshot.id}
                  src={screenshot.path_thumbnail}
                  alt="Screenshot"
                  className="w-full h-40 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(screenshot.path_full, '_blank')}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;