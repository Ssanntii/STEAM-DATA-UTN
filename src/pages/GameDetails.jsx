import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Tag, DollarSign, Trophy, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useGamesStore from '../hooks/useGamesStore';
import LineChartPlayers from '../components/charts/LineChartsPlayers';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { getGameDetails } = useGamesStore();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const details = await getGameDetails(id);
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
  }, [id, getGameDetails]);

  // Función para abrir modal de imagen
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setModalImage(game.screenshots[index]);
  };

  // Función para navegar entre imágenes
  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % game.screenshots.length
      : (currentImageIndex - 1 + game.screenshots.length) % game.screenshots.length;
    
    setCurrentImageIndex(newIndex);
    setModalImage(game.screenshots[newIndex]);
  };

  // Datos de ejemplo para el chart
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
              backgroundImage: `url(${game.background_raw || game.background})`,
            }}
          >
            {/* Overlay personalizado */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="w-64 rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {game.name}
                  </h1>
                  <p className="text-gray-200 text-lg mb-4 drop-shadow-md">
                    {game.short_description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {game.developers?.map((dev, i) => (
                      <span
                        key={i}
                        className="badge bg-blue-600/50 text-blue-200 border border-blue-400/30 backdrop-blur-sm shadow-lg"
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

          {game.review_summary && (
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">Reseñas:</span>
              </div>
              <p className="text-gray-200">
                {game.review_summary} • {game.review_percent.toFixed(1)}% de aprobación
              </p>
              <p className="text-gray-400 text-xs">
                {game.review_count} reseñas totales
              </p>
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

        {/* Screenshots con modal */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Capturas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {game.screenshots.slice(0, 6).map((screenshot, index) => (
                <img
                  key={screenshot.id}
                  src={screenshot.path_thumbnail}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => openImageModal(index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modal de imagen */}
        {modalImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setModalImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setModalImage(null)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <img
              src={modalImage.path_full}
              alt="Screenshot full"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full">
              <span className="text-white text-sm">
                {currentImageIndex + 1} / {game.screenshots.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;