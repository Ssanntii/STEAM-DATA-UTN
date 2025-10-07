import { useParams } from 'react-router-dom'
import LineChartPlayers from '../components/charts/LineChartsPlayers'

const GameDetails = () => {
    const { id } = useParams()

    // Placeholder: reemplazar con fetch real por id
    const sample = [
        { date: '2025-09-30', players: 1200 },
        { date: '2025-10-01', players: 1500 },
        { date: '2025-10-02', players: 900 },
        { date: '2025-10-03', players: 1300 },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Detalles juego {id}</h1>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 glass p-4 rounded-2xl">
                    <h2 className="font-semibold">Jugadores activos</h2>
                    <LineChartPlayers data={sample} />
                </div>
                <div className="glass p-4 rounded-2xl">Información general / precios / tags</div>
            </div>
        </div>
    )
}

export default GameDetails