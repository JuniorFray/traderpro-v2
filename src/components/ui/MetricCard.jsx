// src/components/ui/MetricCard.jsx
export const MetricCard = ({ 
  label, 
  value, 
  type = 'currency', 
  positive = false, 
  negative = false, 
  icon = null, 
  subtext = null,
  currency = 'BRL' // ✅ Nova prop
}) => {
  const formatValue = () => {
    if (type === 'currency') {
      const symbol = currency === 'USD' ? '$' : 'R$';
      const locale = currency === 'USD' ? 'en-US' : 'pt-BR';
      
      return `${symbol} ${Math.abs(value).toLocaleString(locale, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    }
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  const getValueColor = () => {
    if (positive) return 'text-win';
    if (negative) return 'text-loss';
    return 'text-white';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <p className="text-zinc-400 text-xs lg:text-sm font-medium leading-tight">
          {label}
        </p>
        {icon && <span className="text-base lg:text-lg">{icon}</span>}
      </div>
      <p className={`text-xl lg:text-2xl font-bold ${getValueColor()}`}>
        {formatValue()}
      </p>
      {subtext && (
        <p className="text-zinc-500 text-xs mt-1">{subtext}</p>
      )}
    </div>
  );
};
