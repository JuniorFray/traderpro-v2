import { useTrades } from "../../hooks/useTrades"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { formatCurrency } from "../../utils/metrics"
import { useState } from "react"
import { TradeForm } from "../trades/TradeForm"

export const Calendar = () => {
  const { trades, loading, deleteTrade, updateTrade } = useTrades()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingTrade, setEditingTrade] = useState(null)

  if (loading) {
    return <div className="text-center p-8 text-zinc-400">Carregação...</div>
  }

  const tradesByDate = trades.reduce((acc, trade) => {
    const date = trade.date || ""
    if (!acc[date]) acc[date] = []
    acc[date].push(trade)
    return acc
  }, {})

  const getDayResult = (date) => {
    const dayTrades = tradesByDate[date] || []
    return dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const monthNames = ["Janeiro", "Fevereiro", "Marï¿½o", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(year, month + offset, 1))
  }

  const handleDayClick = (dateStr, dayTrades) => {
    if (dayTrades.length > 0) {
      setSelectedDate(dateStr)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este trade?")) {
      await deleteTrade(id)
      const remainingTrades = selectedDayTrades.filter(t => t.id !== id)
      if (remainingTrades.length === 0) {
        setSelectedDate(null)
      }
    }
  }

  const handleEdit = (trade) => {
    setEditingTrade(trade)
  }

  const handleUpdateTrade = async (updatedTrade) => {
    await updateTrade(editingTrade.id, updatedTrade)
    setEditingTrade(null)
  }

  const selectedDayTrades = selectedDate ? tradesByDate[selectedDate] || [] : []
  const selectedDayResult = selectedDate ? getDayResult(selectedDate) : 0

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-white">Calendï¿½rio de Trades</h2>
        <p className="text-sm lg:text-base text-zinc-400">Visualize seus trades por dia</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-2 lg:px-4 text-sm lg:text-base bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            ? Anterior
          </button>
          
          <h3 className="text-base lg:text-xl font-bold text-white">
            {monthNames[month]} {year}
          </h3>
          
          <button
            onClick={() => changeMonth(1)}
            className="px-3 py-2 lg:px-4 text-sm lg:text-base bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Prï¿½ximo ?
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 lg:gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sï¿½b"].map(day => (
            <div key={day} className="text-center text-[10px] lg:text-sm font-semibold text-zinc-400 py-1 lg:py-2">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayTrades = tradesByDate[dateStr] || []
            const dayResult = getDayResult(dateStr)

            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateStr, dayTrades)}
                className={`aspect-square p-1 lg:p-2 rounded-lg border transition-colors ${
                  dayTrades.length > 0
                    ? `cursor-pointer ${dayResult >= 0
                      ? "bg-win/10 border-win/30 hover:bg-win/20"
                      : "bg-loss/10 border-loss/30 hover:bg-loss/20"}`
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="text-[10px] lg:text-sm font-semibold text-white mb-0.5 lg:mb-1">{day}</div>
                {dayTrades.length > 0 && (
                  <div className="text-[8px] lg:text-xs">
                    <div className={`font-bold ${dayResult >= 0 ? "text-win" : "text-loss"}`}>
                      {formatCurrency(dayResult)}
                    </div>
                    <div className="text-zinc-500">{dayTrades.length} trade(s)</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Modal de Detalhes do Dia */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-zinc-900 rounded-xl p-4 lg:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-ação" onClick={(e) => e.stopPropagaçãon()}>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-white">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </h3>
                <p className={`text-base lg:text-lg font-bold ${selectedDayResult >= 0 ? "text-win" : "text-loss"}`}>
                  Resultado: {formatCurrency(selectedDayResult)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ï¿½
              </button>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {selectedDayTrades.map((trade) => (
                <Card key={trade.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white truncate">{trade.asset || trade.symbol || "N/A"}</span>
                        <span className={`text-sm font-bold whitespace-nowrap ${trade.pnl >= 0 ? "text-win" : "text-loss"}`}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      </div>
                      {trade.strategy && (
                        <div className="text-xs lg:text-sm text-zinc-400">Estratï¿½gia: {trade.strategy}</div>
                      )}
                      {trade.notes && (
                        <div className="text-xs lg:text-sm text-zinc-500 mt-1">{trade.notes}</div>
                      )}
                    </div>
                    <div className="flex flex-col lg:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(trade)}
                        className="px-2 lg:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs lg:text-sm whitespace-nowrap"
                      >
                        ?? Editar
                      </button>
                      <button
                        onClick={() => handleDelete(trade.id)}
                        className="px-2 lg:px-3 py-1 bg-loss hover:bg-red-700 text-white rounded text-xs lg:text-sm whitespace-nowrap"
                      >
                        ??? Deletar
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ediï¿½ï¿½o */}
      {editingTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingTrade(null)}>
          <div className="bg-zinc-900 rounded-xl p-4 lg:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-ação" onClick={(e) => e.stopPropagaçãon()}>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-white">Editar Trade</h3>
              <button
                onClick={() => setEditingTrade(null)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ï¿½
              </button>
            </div>
            <TradeForm
              key={editingTrade.id}
              onSubmit={handleUpdateTrade}
              initialData={editingTrade}
              submitLabel="Atualizar Trade"
            />
          </div>
        </div>
      )}
    </div>
  )
}
