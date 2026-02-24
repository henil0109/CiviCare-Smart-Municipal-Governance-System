const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className="space-y-1">
            {label && <label className={`block text-sm font-medium ${props.labelClassName || 'text-gray-700'}`}>{label}</label>}
            <input
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${error
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default Input;
