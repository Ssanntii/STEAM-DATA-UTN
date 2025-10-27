import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Tag, DollarSign, Trophy, ArrowLeft, X, ChevronLeft, ChevronRight, ThumbsUp, Star, Play, Monitor, ExternalLink, Folder } from 'lucide-react';
import steamApi from '../api/steamApi';
import LineChartPlayers from '../components/charts/LineChartsPlayers';
import Button from '../components/ui/Button';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch directo a steamApi (sin store)
        const details = await steamApi.getAppDetails(id);
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
      <div className="min-h-screen px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-white/5 rounded-lg" />
            <div className="h-96 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
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
      <div className="min-h-screen px-4 sm:px-6 py-8 flex items-center justify-center">
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
  const hasReviews = game.recommendations && game.recommendations.total > 0;
  const steamRating = game.steam_rating;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8">
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
            
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
              <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="w-full sm:w-64 rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;
                  }}
                />
                <div className="flex-1 w-full">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {game.name}
                  </h1>
                  <p className="text-gray-200 text-sm sm:text-lg mb-3 sm:mb-4 drop-shadow-md line-clamp-2 sm:line-clamp-none">
                    {game.short_description}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                    {game.developers?.map((dev, i) => (
                      <span
                        key={i}
                        className="badge bg-blue-600/50 text-blue-200 border border-blue-400/30 backdrop-blur-sm shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1"
                      >
                        {dev}
                      </span>
                    ))}
                  </div>
                  
                  {/* Botón de acción */}
                  <a
                    href={`https://store.steampowered.com/app/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="primary" size="md" className="shadow-xl">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                      <span className="hidden sm:inline">Ver en Steam</span>
                      <span className="sm:hidden">Steam</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Precio con descuento */}
          <div className="glass p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase">Precio</span>
            </div>
            
            {/* Si hay descuento */}
            {game.price_overview?.discount_percent > 0 ? (
              <div className="space-y-1">
                {/* Badge de descuento */}
                <div className="inline-block bg-[#4c6b22] text-[#beee11] px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold">
                  -{game.price_overview.discount_percent}%
                </div>
                {/* Precio original tachado */}
                <div className="text-xs sm:text-sm text-gray-500 line-through">
                  {game.price_overview.initial_formatted}
                </div>
                {/* Precio con descuento */}
                <div className="text-lg sm:text-2xl font-bold text-[#beee11]">
                  {game.price_overview.final_formatted}
                </div>
              </div>
            ) : (
              // Sin descuento
              <div className="text-lg sm:text-2xl font-bold">
                {isFree ? 'Gratis' : price}
              </div>
            )}
          </div>

          {/* Fecha de lanzamiento */}
          <div className="glass p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase">Lanzamiento</span>
            </div>
            <div className="text-sm sm:text-lg font-bold line-clamp-2">
              {game.release_date?.date || 'TBA'}
            </div>
          </div>

          {/* Calificación de Steam */}
          {steamRating && (
            <div className="glass p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: steamRating.color }} />
                <span className="text-[10px] sm:text-xs font-semibold uppercase text-gray-400">Calificación</span>
              </div>
              <div className="text-sm sm:text-lg font-bold line-clamp-1" style={{ color: steamRating.color }}>
                {steamRating.text}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {steamRating.percent}% positivo
              </div>
            </div>
          )}

          {/* Reseñas totales */}
          {hasReviews && (
            <div className="glass p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase">Reseñas</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold">
                {game.recommendations.total.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                recomendaciones
              </div>
            </div>
          )}

          {/* Metacritic */}
          {hasMetacritic && (
            <div className="glass p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase">Metacritic</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold">{game.metacritic.score}</div>
            </div>
          )}
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart de jugadores */}
          <div className="lg:col-span-2 glass p-4 sm:p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Jugadores activos
            </h2>
            <LineChartPlayers data={playerData} />
            <p className="text-xs text-gray-500 mt-2">
              * Datos de ejemplo. En producción, usar una API real de históricos.
            </p>
          </div>

          {/* Info lateral */}
          <div className="space-y-4 sm:space-y-6">
            {/* Categorías */}
            {game.categories && game.categories.length > 0 && (
              <div className="glass p-4 sm:p-6 rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  Categorías
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.categories.slice(0, 8).map((category) => (
                    <span
                      key={category.id}
                      className="badge bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs sm:text-sm px-2 py-1"
                    >
                      {category.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Géneros */}
            {game.genres && game.genres.length > 0 && (
              <div className="glass p-4 sm:p-6 rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  Géneros
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="badge bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm px-2 py-1"
                    >
                      {genre.description}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Plataformas */}
            {game.platforms && (
              <div className="glass p-4 sm:p-6 rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Plataformas</h3>
                <div className="space-y-2">
                  {game.platforms.windows && (
                    <div className="flex items-center gap-2 text-black dark:text-gray-300 text-sm">
                      <span className="text-blue-400">●</span>
                      Windows
                    </div>
                  )}
                  {game.platforms.mac && (
                    <div className="flex items-center gap-2 text-black dark:text-gray-300 text-sm">
                      <span className="text-blue-400">●</span>
                      Mac
                    </div>
                  )}
                  {game.platforms.linux && (
                    <div className="flex items-center gap-2 text-black dark:text-gray-300 text-sm">
                      <span className="text-blue-400">●</span>
                      Linux
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publishers */}
            {game.publishers && game.publishers.length > 0 && (
              <div className="glass p-4 sm:p-6 rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Distribuidores</h3>
                <div className="space-y-1">
                  {game.publishers.map((pub, i) => (
                    <div key={i} className="text-black dark:text-gray-300 text-sm">
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
          <div className="glass p-4 sm:p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Acerca de este juego</h2>
            <div
              className="prose prose-invert max-w-none text-sm sm:text-base text-black dark:text-gray-300 prose-headings:text-black dark:prose-headings:text-white prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: game.detailed_description }}
            />
          </div>
        )}

        {/* Requerimientos del sistema */}
        {(game.pc_requirements?.minimum || game.mac_requirements?.minimum || game.linux_requirements?.minimum) && (
          <div className="glass p-4 sm:p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-green-400" />
              Requerimientos del sistema
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Windows Requirements */}
              {game.pc_requirements?.minimum && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-base">Windows</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">Mínimos</h4>
                      <div
                        className="text-xs sm:text-sm text-black dark:text-gray-300 prose prose-sm prose-invert max-w-none prose-ul:my-2 prose-li:my-0.5"
                        dangerouslySetInnerHTML={{ __html: game.pc_requirements.minimum }}
                      />
                    </div>
                    
                    {game.pc_requirements.recommended && (
                      <div className="pt-3 border-t border-border/30">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Recomendados</h4>
                        <div
                          className="text-xs sm:text-sm text-black dark:text-gray-300 prose prose-sm prose-invert max-w-none prose-ul:my-2 prose-li:my-0.5"
                          dangerouslySetInnerHTML={{ __html: game.pc_requirements.recommended }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mac Requirements */}
              {game.mac_requirements?.minimum && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Monitor className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-base">Mac</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">Mínimos</h4>
                      <div
                        className="text-xs sm:text-sm text-black dark:text-gray-300 prose prose-sm prose-invert max-w-none prose-ul:my-2 prose-li:my-0.5"
                        dangerouslySetInnerHTML={{ __html: game.mac_requirements.minimum }}
                      />
                    </div>
                    
                    {game.mac_requirements.recommended && (
                      <div className="pt-3 border-t border-border/30">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Recomendados</h4>
                        <div
                          className="text-xs sm:text-sm text-black dark:text-gray-300 prose prose-sm prose-invert max-w-none prose-ul:my-2 prose-li:my-0.5"
                          dangerouslySetInnerHTML={{ __html: game.mac_requirements.recommended }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linux Requirements */}
              {game.linux_requirements?.minimum &&  (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Monitor className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-base">Linux</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">Mínimos</h4>
                      <div
                        className="text-xs sm:text-sm text-black dark:text-gray-300 prose prose-sm prose-invert max-w-none prose-ul:my-2 prose-li:my-0.5"
                        dangerouslySetInnerHTML={{ __html: game.linux_requirements.minimum }}
                      />
                    </div>
                    
                    {game.linux_requirements.recommended && (
                      <div className="pt-3 border-t border-border/30">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Recomendados</h4>
                        <div
                          className="text-xs sm:text-sm text-black dark:text-gray-300 prose prose-sm prose-invert max-w-none prose-ul:my-2 prose-li:my-0.5"
                          dangerouslySetInnerHTML={{ __html: game.linux_requirements.recommended }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screenshots con modal */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div className="glass p-4 sm:p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Capturas de pantalla</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {game.screenshots.slice(0, 8).map((screenshot, index) => (
                <div 
                  key={screenshot.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => openImageModal(index)}
                >
                  <img
                    src={screenshot.path_thumbnail}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
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
              className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 transition-colors z-10"
              onClick={() => setModalImage(null)}
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full hover:bg-white/20 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full hover:bg-white/20 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            <img
              src={modalImage.path_full}
              alt="Screenshot completo"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full">
              <span className="text-white text-xs sm:text-sm">
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