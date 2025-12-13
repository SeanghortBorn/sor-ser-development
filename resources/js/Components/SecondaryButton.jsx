export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-50 hover:scale-105 hover:shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 disabled:opacity-25 ${
                    disabled && 'opacity-25 cursor-not-allowed hover:scale-100 hover:shadow-sm'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
