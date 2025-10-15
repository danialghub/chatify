
const Input = ({ title, error = "", Icon, ...props }) => {
    return (
        <div>
            <label className="auth-input-label">{title}</label>
            <div className="relative">
                <Icon className="auth-input-icon" />
                <input
                    {...props}
                    className="input"
                />
            </div>
            <p className={`${error ? "visible" : "invisible"} text-red-500 text-xs font-thick pt-2 text-right`}>{error}</p>
        </div>
    )
}

export default Input