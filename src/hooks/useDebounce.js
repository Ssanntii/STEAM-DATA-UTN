import { useState, useEffect } from 'react'

const useDebounce = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])

    return debounced
}

export default useDebounce