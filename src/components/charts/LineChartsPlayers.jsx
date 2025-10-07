import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

const LineChartPlayers = ({ data = [] }) => {
    return (
        <div className="w-full h-72">
            <ResponsiveContainer>
                <LineChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="players" stroke="#60A5FA" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default LineChartPlayers