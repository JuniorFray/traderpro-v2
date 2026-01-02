import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { parseMT5File, validateTrades } from "../../utils/mt5Parser"
import { formatCurrency } from "../../utils/metrics"

export const ImportMT5Modal = ({ onClose, onImport, existingTrades = [] }) => {
  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [parsedData, setParsedData] = useState(null)
  const [validation, setValidation] = useState(null)
  const [error, setError] = useState("")

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx')) {
      setError("Por favor, selecione um arquivo Excel (.xlsx)")
      return
    }

    setFile(selectedFile)
    setError("")
    setParsedData(null)
    setValidation(null)
  }

  const handleParse = async () => {
    if (!file) return

    setParsing(true)
    setError("")

    try {
      const result = await parseMT5File(file)
      
      if (!result.success) {
        setError(result.error || "Erro ao processar arquivo")
        return
      }

      if (result.trades.length === 0) {
        setError("Nenhum trade encontrado no arquivo. Verifique se é um relatório MT5 válido.")
        return
      }

      setParsedData(result)

      // Validar trades
      const validationResult = validateTrades(result.trades, existingTrades)
      setValidation(validationResult)

    } catch (err) {
      console.error("Erro ao fazer parse:", err)
      setError("Erro ao processar arquivo. Verifique se é um relatório MT5 válido.")
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
  if (!validation || validation.valid.length === 0) {
    alert('Nenhum trade válido para importar')
    return
  }

  setImporting(true)
  setError("")
  setImportProgress({ current: 0, total: validation.valid.length })

  try {
    // Passar o ARRAY COMPLETO para importTrades (batch)
    await onImport(validation.valid)
    
    // Simular progresso visualmente
    for (let i = 1; i <= validation.valid.length; i++) {
      setImportProgress({ current: i, total: validation.valid.length })
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    alert(`${validation.valid.length} trades importados com sucesso!`)
    onClose()
  } catch (err) {
    console.error("Erro ao importar:", err)
    setError("Erro ao importar trades. Tente novamente.")
    setImporting(false)
  }
}


  const progressPercent = importProgress.total > 0 
    ? (importProgress.current / importProgress.total) * 100 
    : 0

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={importing ? undefined : onClose}
    >
      <div 
        className="bg-zinc-900 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">📤 Importar Histórico MT5</h2>
            <p className="text-sm text-zinc-400">Faça upload do relatório de histórico do MetaTrader 5</p>
          </div>
          {!importing && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Barra de Progresso - Importação Ativa */}
        {importing && (
          <div className="mb-6">
            <Card className="bg-emerald-900/20 border-emerald-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold">
                    ⏳ Importando trades...
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {importProgress.current} / {importProgress.total}
                  </span>
                </div>
                
                {/* Barra de Progresso */}
                <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300 flex items-center justify-center text-xs font-bold text-black"
                    style={{ width: `${progressPercent}%` }}
                  >
                    {progressPercent > 10 && `${Math.round(progressPercent)}%`}
                  </div>
                </div>

                <p className="text-sm text-zinc-400 text-center">
                  Por favor, aguarde. Não feche esta janela.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Passo 1: Selecionar Arquivo */}
        {!importing && (
          <>
            <Card className="mb-4">
              <h3 className="text-lg font-bold text-white mb-3">1️⃣ Selecione o Arquivo</h3>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-zinc-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-emerald-500 file:text-black
                    hover:file:bg-emerald-600
                    file:cursor-pointer cursor-pointer"
                />
                {file && (
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-sm text-white">📄 {file.name}</span>
                    <Button onClick={handleParse} disabled={parsing}>
                      {parsing ? "Processando..." : "Processar Arquivo"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Passo 2: Informações Detectadas */}
            {parsedData && (
              <Card className="mb-4">
                <h3 className="text-lg font-bold text-white mb-3">2️⃣ Informações Detectadas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-400 mb-1">Formato</p>
                    <p className="text-white font-semibold">✅ MetaTrader 5</p>
                  </div>
                  {parsedData.metadata.broker && (
                    <div>
                      <p className="text-zinc-400 mb-1">Corretora</p>
                      <p className="text-white font-semibold">{parsedData.metadata.broker}</p>
                    </div>
                  )}
                  {parsedData.metadata.account && (
                    <div>
                      <p className="text-zinc-400 mb-1">Conta</p>
                      <p className="text-white font-semibold">{parsedData.metadata.account}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-400 mb-1">Trades Encontrados</p>
                    <p className="text-white font-semibold">{parsedData.trades.length} posições</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Passo 3: Validação */}
            {validation && (
              <>
                <Card className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-3">3️⃣ Validação</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                      <span className="text-emerald-400 font-semibold">✅ Trades Válidos</span>
                      <span className="text-emerald-400 font-bold text-lg">{validation.valid.length}</span>
                    </div>
                    
                    {validation.duplicates.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                        <span className="text-yellow-400 font-semibold">⚠️ Duplicados (serão ignorados)</span>
                        <span className="text-yellow-400 font-bold text-lg">{validation.duplicates.length}</span>
                      </div>
                    )}

                    {validation.errors.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-800 rounded-lg">
                        <span className="text-red-400 font-semibold">❌ Com Erro (serão ignorados)</span>
                        <span className="text-red-400 font-bold text-lg">{validation.errors.length}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Preview dos Trades */}
                <Card className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-3">📋 Preview (5 primeiros)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left py-2 px-2 text-zinc-400 font-medium">Data</th>
                          <th className="text-left py-2 px-2 text-zinc-400 font-medium">Ativo</th>
                          <th className="text-right py-2 px-2 text-zinc-400 font-medium">P&L</th>
                          <th className="text-right py-2 px-2 text-zinc-400 font-medium">Comissão</th>
                          <th className="text-right py-2 px-2 text-zinc-400 font-medium">Swap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validation.valid.slice(0, 5).map((trade, idx) => (
                          <tr key={idx} className="border-b border-zinc-900">
                            <td className="py-2 px-2 text-zinc-300">
                              {new Date(trade.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-2 px-2 text-white font-medium">{trade.asset}</td>
                            <td className={`py-2 px-2 text-right font-bold ${trade.pnl >= 0 ? 'text-win' : 'text-loss'}`}>
                              {formatCurrency(trade.pnl)}
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-400">
                              {formatCurrency(trade.commission)}
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-400">
                              {formatCurrency(trade.swap)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validation.valid.length > 5 && (
                      <p className="text-xs text-zinc-500 mt-2 text-center">
                        ... e mais {validation.valid.length - 5} trades
                      </p>
                    )}
                  </div>
                </Card>

                {/* Aviso sobre Estratégia */}
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
                  <p className="text-blue-400 text-sm">
                    <span className="font-semibold">ℹ️ Informação:</span> O campo "Estratégia" ficará em branco. 
                    Você pode editar cada trade depois para adicionar a estratégia.
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleImport}
                    className="flex-1"
                    disabled={validation.valid.length === 0}
                  >
                    Importar {validation.valid.length} Trades
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

