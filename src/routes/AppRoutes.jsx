import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Home from '../pages/Home'
import GameDetails from '../pages/GameDetails'
import TopSellers from '../pages/TopSellers'
import Offers from '../pages/Offers'
import NotFoundPage from '../pages/NotFoundPage'

const AppRoutes = () => {
    return (
    <Routes>
    <Route path="/" element={<MainLayout><Home/></MainLayout>} />
    <Route path="/game/:id" element={<MainLayout><GameDetails/></MainLayout>} />
    <Route path="/top-sellers" element={<MainLayout><TopSellers/></MainLayout>} />
    <Route path="/offers" element={<MainLayout><Offers/></MainLayout>} />
    <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
    </Routes>
    )
}

export default AppRoutes