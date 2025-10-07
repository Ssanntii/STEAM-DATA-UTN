import { useState, useEffect } from 'react'

const useFetch = (fetcher, deps = []) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    fetcher()
    .then((res) => { if (mounted) setData(res) })
    .catch((err) => { if (mounted) setError(err) })
    .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { data, loading, error }
}

export default useFetch