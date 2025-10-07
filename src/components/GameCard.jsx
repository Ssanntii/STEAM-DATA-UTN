import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

const GameCard = ({ game }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-20, 20], [8, -8])
    const rotateY = useTransform(x, [-20, 20], [-8, 8])

    return (
        <motion.div
            style={{ rotateX, rotateY }}
            onMouseMove={(e)=>{
                const rect = e.currentTarget.getBoundingClientRect()
                x.set((e.clientX - rect.left - rect.width / 2) / 20)
                y.set((e.clientY - rect.top - rect.height / 2) / 20)
            }}
            whileHover={{ scale: 1.03, y: -6 }}
            className="glass rounded-2xl p-4 shadow-lg min-h-[180px]"
        >
            <Link to={`/game/${game.appid}`}>
                <div className="flex gap-4">
                    <img
                        src={game.image || 'https://via.placeholder.com/120x68'}
                        alt="cover"
                        className="w-28 h-16 object-cover rounded-md"
                    />
                    <div>
                        <h3 className="font-semibold">{game.name}</h3>
                        <p className="text-sm opacity-80">{game.players || '—'} players</p>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default GameCard