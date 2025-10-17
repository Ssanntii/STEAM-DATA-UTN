import { useNavigate } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react';

const SearchDropdown = ({ suggestions, loading, query, onSelectGame, onClose }) => {
  const navigate = useNavigate();

  if (!query || query.length < 2) return null;

  const handleViewAll = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const handleSelectGame = (game) => {
    navigate(`/game/${game.appid}`);
    onSelectGame(game);
  };

  // Componente para mostrar precio con descuento
  const PriceTag = ({ game }) => {
    const hasDiscount = game.discount_percent && game.discount_percent > 0;

    if (game.price === 'Gratis' || game.price === 'Free') {
      return <span className="text-green-500 font-semibold">Gratis</span>;
    }

    if (!hasDiscount) {
      return <span className="text-muted-foreground">{game.price}</span>;
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className="bg-[#4c6b22] text-[#beee11] px-1.5 py-0.5 rounded text-[10px] font-bold">
          -{game.discount_percent}%
        </span>
        <span className="text-[10px] text-gray-500 line-through">
          {game.original_price}
        </span>
        <span className="text-[#beee11] font-semibold text-xs">
          {game.price}
        </span>
      </div>
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Buscando juegos...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <>
          {/* Lista de sugerencias */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {suggestions.map((game) => (
              <button
                key={game.appid}
                onClick={() => handleSelectGame(game)}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors duration-200 text-left group"
              >
                {/* Imagen del juego */}
                <div className="relative w-16 h-9 rounded overflow-hidden flex-shrink-0 bg-muted">
                  {/* Badge de descuento en la imagen */}
                  {game.discount_percent > 0 && (
                    <div className="absolute top-0.5 left-0.5 bg-[#4c6b22] text-[#beee11] px-1 py-0.5 rounded text-[9px] font-bold z-10">
                      -{game.discount_percent}%
                    </div>
                  )}
                  
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/184x69/1a1a1a/666666?text=No+Image`;
                    }}
                  />
                </div>

                {/* Info del juego */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {game.name}
                  </p>
                  <div className="mt-0.5">
                    <PriceTag game={game} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Botón "Ver todos" */}
          <div className="border-t border-border/50 p-2">
            <button
              onClick={handleViewAll}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-sm font-medium group"
            >
              <SearchIcon className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors">
                Ver todos los resultados para "{query}"
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="py-8 px-4 text-center text-muted-foreground">
          <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No se encontraron juegos para "{query}"</p>
          <p className="text-xs mt-1 opacity-75">Intenta con otro término de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;