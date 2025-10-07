const Input = (props) => {
    return (
        <input
            {...props}
            className={`px-3 py-2 rounded-lg glass ${props.className || ''}`}
        />
    )
}

export default Input