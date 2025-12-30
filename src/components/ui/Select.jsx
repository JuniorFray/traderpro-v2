export const Select = ({ label, options, error, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label}
      </label>
    )}
    <select
      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1 text-sm text-red-400">{error}</p>
    )}
  </div>
)
