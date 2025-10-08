import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme) {
                return savedTheme === 'dark'
            }
            // Si no hay tema guardado, detectar preferencia del sistema
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        } catch { 
            return false 
        }
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode)
        try { 
            localStorage.setItem('theme', darkMode ? 'dark' : 'light')
        } catch {}
    }, [darkMode])

    // Escuchar cambios en la preferencia del sistema (opcional pero útil)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            // Solo cambiar si el usuario no tiene preferencia guardada
            if (!localStorage.getItem('theme')) {
                setDarkMode(e.matches)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}