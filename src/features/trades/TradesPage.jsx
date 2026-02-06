// src/features/trades/TradesPage.jsx

import { useState } from "react"
import { useTrades } from "../../hooks/useTrades"
import { useAuth } from "../auth/AuthContext"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { TradeForm } from "./TradeForm"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { formatCurrency } from "../../utils/metrics"
import { ImportMT5Modal } from "./ImportMT5Modal"
import { ClearAccountModal } from "./ClearAccountModal"
import { recalculateSpecificPeriods } from "../../services/taxRecalculator"

export const TradesPage = () => {
  const { user } = useAuth()
  const { trades, loading, createTrade, updateTrade, deleteTrade, clearAllTrades, importTrades } = useTrades()
  const [showForm, setShowForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageFullscreen, setSelectedImageFullscreen] = useState(null)
  const [showLinksDropdown, setShowLinksDropdown] = useState(null) // ✅ CORRIGIDO - Estado separado
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all"
  })

  const filteredTrades = trades.filter(trade => {
    if (filters.startDate && trade.date < filters.startDate) return false
    if (filters.endDate && trade.date > filters.endDate) return false
    if (filters.symbol && !trade.asset.toLowerCase().includes(filters.symbol.toLowerCase())) return false
    if (filters.strategy && !trade.strategy?.toLowerCase().includes(filters.strategy.toLowerCase())) return false
    if (filters.result !== "all") {
      if (filters.result === "win" && trade.pnl <= 0) return false
      if (filters.result === "loss" && trade.pnl >= 0) return false
    }
    return true
  })

  const totalPnLBRL = filteredTrades.reduce((sum, t) => {
    const pnl = parseFloat(t.pnl) || 0
    const pnlBRL = t.market === "forex" ? pnl * 5.45 : pnl
    return sum + pnlBRL
  }, 0)

  const metrics = {
    total: filteredTrades.length,
    wins: filteredTrades.filter(t => t.pnl > 0).length,
    losses: filteredTrades.filter(t => t.pnl < 0).length,
    totalPnL: totalPnLBRL
  }

  // ✅ FUNÇÃO: Abrir link do TradingView
  const handleOpenTradingView = (url) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // FUNÇÃO MODIFICADA: Com recálculo automático do histórico fiscal
  const handleSubmit = async (tradeData) => {
    try {
      if (editingTrade) {
        // Capturar dados antigos ANTES de atualizar
        const oldTrade = editingTrade
        const oldDate = new Date(oldTrade.date)
        const oldPeriod = `${oldDate.getFullYear()}-${String(oldDate.getMonth() + 1).padStart(2, '0')}`
        const oldMarket = oldTrade.market

        // Atualizar o trade
        await updateTrade(editingTrade.id, tradeData)

        // Verificar se houve mudança de mercado ou período
        const newDate = new Date(tradeData.date)
        const newPeriod = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
        const newMarket = tradeData.market

        // RECALCULAR HISTÓRICO FISCAL AUTOMATICAMENTE
        if (oldMarket !== newMarket || oldPeriod !== newPeriod) {
          console.log('✅ Mercado/período alterado, recalculando histórico fiscal automaticamente...')
          
          // Coletar períodos e mercados afetados
          const periodsToRecalc = oldPeriod !== newPeriod 
            ? [oldPeriod, newPeriod] 
            : [oldPeriod]
          
          const marketsToRecalc = oldMarket !== newMarket 
            ? [oldMarket, newMarket] 
            : [oldMarket]

          // Recalcular em background sem bloquear UI
          recalculateSpecificPeriods(user.uid, periodsToRecalc, marketsToRecalc)
            .then(result => {
              if (result.success) {
                console.log('✅ Histórico fiscal recalculado automaticamente')
              } else {
                console.error('❌ Erro ao recalcular histórico fiscal', result.message)
              }
            })
            .catch(error => {
              console.error('❌ Erro ao recalcular histórico fiscal', error)
            })
        }
      } else {
        // Criar novo trade
        await createTrade(tradeData)

        // RECALCULAR período atual após criar trade
        const newDate = new Date(tradeData.date)
        const newPeriod = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
        const newMarket = tradeData.market

        console.log('✅ Novo trade criado, recalculando período atual...')

        recalculateSpecificPeriods(user.uid, [newPeriod], [newMarket])
          .then(result => {
            if (result.success) {
              console.log('✅ Histórico fiscal atualizado')
            }
          })
          .catch(error => {
            console.error('❌ Erro ao atualizar histórico fiscal', error)
          })
      }

      setShowForm(false)
      setEditingTrade(null)
    } catch (error) {
      console.error("Erro ao salvar trade", error)
      alert("Erro ao salvar trade: " + error.message)
    }
  }

  const handleEdit = (trade) => {
    setEditingTrade(trade)
    setShowForm(true)
  }

  const handleDelete = async (tradeId) => {
    if (window.confirm("Deseja realmente excluir este trade?")) {
      try {
        // Capturar dados ANTES de deletar para recalcular depois
        const tradeToDelete = trades.find(t => t.id === tradeId)
        const tradeDate = new Date(tradeToDelete.date)
        const tradePeriod = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`
        const tradeMarket = tradeToDelete.market

        await deleteTrade(tradeId)

        // Recalcular período após deletar
        console.log('✅ Trade deletado, recalculando período...')
        recalculateSpecificPeriods(user.uid, [tradePeriod], [tradeMarket])
          .then(result => {
            if (result.success) {
              console.log('✅ Histórico fiscal atualizado após exclusão')
            }
          })
          .catch(error => {
            console.error('❌ Erro ao atualizar histórico fiscal', error)
          })
      } catch (error) {
        console.error("Erro ao deletar trade", error)
        alert("Erro ao deletar trade: " + error.message)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTrade(null)
  }

  const handleViewImages = (trade) => {
    if (trade.images && trade.images.length > 0) {
      setSelectedImage({ images: trade.images, asset: trade.asset })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Carregando trades...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-0">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Trades</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => setShowForm(true)}
            disabled={showForm}
            className="w-full sm:w-auto"
          >
            ➕ Novo Trade
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto"
          >
            📥 Importar MT5
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearModal(true)}
            className="w-full sm:w-auto hover:bg-red-900/30 hover:border-red-500/50"
          >
            🗑️ Zerar Conta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">Total</div>
          <div className="text-xl md:text-2xl font-bold text-white">{metrics.total}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">Wins</div>
          <div className="text-xl md:text-2xl font-bold text-green-500">{metrics.wins}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">Losses</div>
          <div className="text-xl md:text-2xl font-bold text-red-500">{metrics.losses}</div>
        </Card>
        <Card className="p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">P&L Total</div>
          <div className={`text-xl md:text-2xl font-bold ${metrics.totalPnL > 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(metrics.totalPnL, "BRL")}
          </div>
        </Card>
      </div>

      <TradeFilters onFilterChange={setFilters} />

      {showForm && (
        <TradeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingTrade}
        />
      )}

      <Card className="p-3 md:p-4">
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
          📊 Histórico ({filteredTrades.length})
        </h2>

        {filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            Nenhum trade encontrado
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrades.map(trade => (
              <div
                key={trade.id}
                className="p-3 md:p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-white font-bold text-lg truncate">{trade.asset}</span>
                        <span className="text-xs md:text-sm text-zinc-400">{trade.date}</span>
                      </div>
                      {trade.strategy && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">
                          {trade.strategy}
                        </span>
                      )}
                    </div>

                    <div className={`text-xl md:text-2xl font-bold whitespace-nowrap ml-2 ${trade.pnl > 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatCurrency(trade.pnl, trade.currency, trade.market)}
                    </div>
                  </div>

                  {trade.notes && (
                    <p className="text-sm text-zinc-500 line-clamp-2">{trade.notes}</p>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-zinc-700 flex-wrap">
                    {/* ✅ BOTÃO TRADINGVIEW COM DROPDOWN INTELIGENTE */}
                    {(() => {
                      const links = (trade.tradingviewLinks || []).filter(link => link && link.trim() !== '')
                      const hasLinks = links.length > 0
                      
                      return (
                        <div className="relative flex-1 sm:flex-none">
                          {links.length === 1 ? (
                            // Se tiver apenas 1 link, abre direto
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTradingView(links[0])}
                              className="w-full bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                            >
                              📊 TradingView
                            </Button>
                          ) : links.length > 1 ? (
                            // Se tiver múltiplos links, mostra dropdown
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLinksDropdown(showLinksDropdown === trade.id ? null : trade.id)}
                                className="w-full bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                              >
                                📊 TradingView ({links.length}) ▾
                              </Button>
                              
                              {showLinksDropdown === trade.id && (
                                <>
                                  {/* Backdrop para fechar o dropdown */}
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowLinksDropdown(null)}
                                  />
                                  
                                  {/* Dropdown Menu */}
                                  <div className="absolute left-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                    {links.map((link, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          handleOpenTradingView(link)
                                          setShowLinksDropdown(null)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                                      >
                                        <span className="text-blue-400">📊</span>
                                        Link {index + 1}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            // Sem links cadastrados
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="w-full opacity-30"
                            >
                              📊 TradingView
                            </Button>
                          )}
                        </div>
                      )
                    })()}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewImages(trade)}
                      disabled={!trade.images || trade.images.length === 0}
                      className="flex-1 sm:flex-none"
                    >
                      📷 Imagens ({trade.images && trade.images.length > 0 ? trade.images.length : '0'})
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(trade)}
                      className="flex-1 sm:flex-none"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(trade.id)}
                      className="flex-1 sm:flex-none hover:bg-red-900/30 hover:border-red-500/50"
                    >
                      🗑️ Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showImportModal && (
        <ImportMT5Modal
          onClose={() => setShowImportModal(false)}
          onImport={importTrades}
          existingTrades={trades}
        />
      )}

      {showClearModal && (
        <ClearAccountModal
          onClose={() => setShowClearModal(false)}
          onConfirm={clearAllTrades}
          tradesCount={trades.length}
        />
      )}

      {/* MODAL DE VISUALIZAÇÃO DE IMAGENS - GALERIA */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">
                📷 Imagens - {selectedImage.asset} ({selectedImage.images.length})
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white text-3xl bg-black/50 hover:bg-black/70 w-12 h-12 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {selectedImage.images.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageFullscreen(url)
                  }}
                  className="relative group cursor-pointer"
                >
                  <img
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full rounded-lg border-2 border-zinc-700 hover:border-primary transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span className="text-white text-lg font-bold">🔍 Ampliar</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMAGEM EM TELA CHEIA */}
      {selectedImageFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedImageFullscreen(null)}
        >
          <button
            onClick={() => setSelectedImageFullscreen(null)}
            className="absolute top-4 right-4 text-white text-3xl bg-black/50 hover:bg-black/70 w-12 h-12 rounded-full flex items-center justify-center z-10"
          >
            ✕
          </button>
          <img
            src={selectedImageFullscreen}
            alt="Imagem em tela cheia"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
