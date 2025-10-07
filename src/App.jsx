import { useEffect } from 'react'

import { BrowserRouter } from 'react-router-dom'

import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'

import AOS from 'aos'
import 'aos/dist/aos.css'

import AppRoutes from './routes/AppRoutes'

function App() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: 'ease-in-out', once: true })
  }, [])

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppRoutes/>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
