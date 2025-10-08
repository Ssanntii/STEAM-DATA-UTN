import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center px-4 sm:px-6">
      {/* Botón de volver arriba */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Contenido centrado */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl w-full">
          {/* Número 404 */}
          <h1 className="text-8xl sm:text-9xl font-bold text-black dark:text-gray-700 mb-4">
            404
          </h1>

          {/* Mensaje */}
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Lo sentimos, la página que estás buscando no existe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;