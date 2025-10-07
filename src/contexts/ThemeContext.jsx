import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem('theme') === 'dark'
        } catch { return false }
        })

    useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try { 
        localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    } catch {}
    }, [darkMode])

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}