import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"

export const ClearAccountModal = ({ onClose, onConfirm, tradesCount }) => {
  const [confirmText, setConfirmText] = useState("")
  const [clearing, setClearing] = useState(false)

  const handleConfirm = async () => {
    if (confirmText !== "ZERAR") return

    setClearing(true)
    try {
      await onConfirm()
    } finally {
      setClearing(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={clearing ? undefined : onClose}
    >
      <div 
        className="bg-zinc-900 rounded-xl p-6 max-w-lg w-full border-2 border-red-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-500">Zerar Conta</h2>
              <p className="text-sm text-zinc-400">Ação irreversível!</p>
            </div>
          </div>
          {!clearing && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Aviso */}
        <Card className="mb-6 bg-red-900/20 border-red-800">
          <div className="space-y-3">
            <p className="text-red-400 font-semibold">
              ⚠️ ATENÇÃO: Esta ação não pode ser desfeita!
            </p>
            <p className="text-zinc-300 text-sm">
              Você está prestes a deletar <span className="font-bold text-white">{tradesCount} trades</span> permanentemente.
            </p>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>Todos os seus trades serão removidos</li>
              <li>Todo o histórico será perdido</li>
              <li>As estatísticas serão zeradas</li>
              <li>Esta ação é IRREVERSÍVEL</li>
            </ul>
          </div>
        </Card>

        {/* Confirmação */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Digite <span className="font-bold text-red-500">ZERAR</span> para confirmar:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Digite ZERAR"
            disabled={clearing}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-50"
            autoFocus
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={clearing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={confirmText !== "ZERAR" || clearing}
          >
            {clearing ? "Zerando..." : "Confirmar e Zerar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

