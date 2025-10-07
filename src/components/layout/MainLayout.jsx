import Navbar from './Navbar'
import Footer from './Footer'

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-6">
                {children}
            </main>
            
            <Footer />
        </div>
    )
}

export default MainLayout