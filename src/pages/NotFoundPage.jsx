import { Link } from "react-router-dom"
import { ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
    return (
        <div>
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
            </Link>
            <div className="flex items-center justify-center">
                <div className="flex justify-center min-w-[800px] min-h-[400px] bg-slate-900 shadow-lg rounded-3xl">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            Página no encontrada
                        </h2>
                        <p className="text-white mb-8">
                            La ruta que estás buscando no existe.
                        </p>
                    </div>
                </div>
            </div>
            
        </div>    
    )
}

export default NotFoundPage