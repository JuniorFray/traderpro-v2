import { Card } from "../../components/ui/Card"
import { formatCurrency, formatPercent } from "../../utils/metrics"

export const MetricsCard = ({ label, value, type = "currency", trend }) => {
  const formatValue = () => {
    if (type === "currency") return formatCurrency(value)
    if (type === "percent") return formatPercent(value)
    if (type === "number") return value
    return value
  }

  const getTrendColor = () => {
    if (!trend) return "text-white"
    return trend > 0 ? "text-win" : "text-loss"
  }

  return (
    <Card>
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">{label}</p>
        <p className={`text-2xl font-bold ${getTrendColor()}`}>
          {formatValue()}
        </p>
      </div>
    </Card>
  )
}
