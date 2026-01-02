export const Input = ({ 
  label, 
  error,
  className = "", 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-zinc-500 font-bold uppercase ml-1 block">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-accent transition-colors placeholder:text-zinc-700 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-loss ml-1">{error}</p>
      )}
    </div>
  )
}


