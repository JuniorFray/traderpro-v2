import { Button } from "../../components/ui"
import { Card } from "../../components/ui"
import { formatCurrency } from "../../utils/metrics"
import { useState } from "react"

export const TradesList = ({ 
  trades, 
  onEdit, 
  onDelete,
  onView 
}) => {
  const [selectedImage, setSelectedImage] = useState(null)

  if (trades.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-zinc-500">
          Nenhum trade encontrado
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">
          Histórico ({trades.length} {trades.length === 1 ? "trade" : "trades"})
        </h2>

        <div className="space-y-3">
          {trades.map(trade => (
            <div
              key={trade.id}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Informações do Trade */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-white font-bold">{trade.asset}</span>
                    <span className="text-sm text-zinc-400">{trade.date}</span>
                    {trade.strategy && (
                      <span className="text-xs px-2 py-1 bg-zinc-700 rounded text-zinc-300">
                        {trade.strategy}
                      </span>
                    )}
                  </div>

                  {trade.notes && (
                    <p className="text-sm text-zinc-500 mb-2">{trade.notes}</p>
                  )}

                  {/* Miniaturas das imagens */}
                  {trade.screenshots && trade.screenshots.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {trade.screenshots.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(url)}
                          className="relative w-16 h-16 rounded border-2 border-zinc-700 hover:border-primary transition-colors overflow-hidden group"
                        >
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">🔍 Ver</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* P&L e Ações */}
                <div className="flex flex-col items-end gap-3">
                  <div className={`text-xl font-bold whitespace-nowrap ${trade.pnl >= 0 ? "text-win" : "text-loss"}`}>
                    {formatCurrency(trade.pnl)}
                  </div>

                  <div className="flex gap-2">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(trade)}
                      >
                        👁️
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(trade)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(trade.id)}
                      className="hover:bg-red-900/30 hover:border-red-500/50"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de visualização de imagem em tela cheia */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-3xl bg-black/50 hover:bg-black/70 w-12 h-12 rounded-full flex items-center justify-center z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Screenshot ampliado"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
