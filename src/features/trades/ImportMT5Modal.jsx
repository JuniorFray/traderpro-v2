import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { parseTradeFile, validateTrades } from "../../utils/universalTradeParser";
import { formatCurrency } from "../../utils/metrics";

export const ImportMT5Modal = ({ onClose, onImport, existingTrades = [] }) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [parsedData, setParsedData] = useState(null);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validExtensions = ['xlsx', 'xls', 'csv'];
    const extension = selectedFile.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(extension)) {
      setError("Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)");
      return;
    }

    setFile(selectedFile);
    setError("");
    setParsedData(null);
    setValidation(null);
  };

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    setError("");

    try {
      const result = await parseTradeFile(file);
      
      if (result.trades.length === 0) {
        setError("Nenhum trade válido encontrado no arquivo");
        setParsing(false);
        return;
      }

      const validationResult = validateTrades(result.trades, existingTrades);
      
      setParsedData(result);
      setValidation(validationResult);

      if (result.errors.length > 0) {
        console.warn('Linhas com erro:', result.errors);
      }
    } catch (err) {
      setError(err.message || "Erro ao processar arquivo");
      console.error('Erro no parser:', err);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!validation || validation.validCount === 0) return;

    setImporting(true);
    setImportProgress({ current: 0, total: validation.validCount });

    try {
      // ✅ CORRIGIDO: Passar array completo de uma vez
      await onImport(validation.valid);
      
      setImportProgress({
        current: validation.validCount,
        total: validation.validCount
      });

      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError("Erro ao importar trades: " + err.message);
      console.error('Erro na importação:', err);
    } finally {
      setImporting(false);
    }
  };

  const calculateStats = () => {
    if (!validation) return null;

    const { valid } = validation;
    const totalPnL = valid.reduce((sum, t) => sum + t.pnl, 0);
    const totalTax = valid.reduce((sum, t) => sum + t.taxes.amount, 0);
    const wins = valid.filter(t => t.pnl > 0).length;
    const losses = valid.filter(t => t.pnl < 0).length;
    const winRate = valid.length > 0 ? (wins / valid.length) * 100 : 0;

    return { totalPnL, totalTax, wins, losses, winRate };
  };

  const stats = calculateStats();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Importar Trades
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Suporta Excel (.xlsx, .xls) e CSV de qualquer plataforma
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
            disabled={importing}
          >
            ✕
          </button>
        </div>

        {!parsedData && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={parsing}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block"
              >
                <div className="text-4xl mb-4">📊</div>
                <div className="text-white font-medium mb-2">
                  {file ? file.name : 'Escolher arquivo'}
                </div>
                <div className="text-sm text-zinc-400">
                  Excel (.xlsx, .xls) ou CSV
                </div>
              </label>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-300">
              <div className="font-medium mb-2">📋 Colunas aceitas (qualquer nome):</div>
              <ul className="space-y-1 text-zinc-400">
                <li>• <strong>Obrigatórias:</strong> Ativo, Data, Resultado/PnL</li>
                <li>• <strong>Opcionais:</strong> Mercado, Moeda, Quantidade, Preços, Horários, Taxas, etc</li>
              </ul>
              <div className="mt-3 text-xs text-zinc-500">
                💡 O sistema detecta automaticamente as colunas e calcula impostos
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            <Button
              onClick={handleParse}
              disabled={!file || parsing}
              className="w-full"
            >
              {parsing ? "Processando..." : "Processar Arquivo"}
            </Button>
          </div>
        )}

        {parsedData && validation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-zinc-400 text-sm">Total Trades</div>
                <div className="text-2xl font-bold text-white">
                  {validation.total}
                </div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-4">
                <div className="text-emerald-400 text-sm">Válidos</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {validation.validCount}
                </div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <div className="text-yellow-400 text-sm">Duplicados</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {validation.duplicateCount}
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4">
                <div className="text-blue-400 text-sm">Win Rate</div>
                <div className="text-2xl font-bold text-blue-400">
                  {stats.winRate.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Resultado Total:</span>
                <span className={stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {formatCurrency(stats.totalPnL, 'BRL')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Impostos Calculados:</span>
                <span className="text-orange-400">
                  {formatCurrency(stats.totalTax, 'BRL')}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2">
                <span className="text-zinc-400">Resultado Líquido:</span>
                <span className="text-white font-bold">
                  {formatCurrency(stats.totalPnL - stats.totalTax, 'BRL')}
                </span>
              </div>
            </div>

            {validation.duplicateCount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400 text-sm">
                ⚠️ {validation.duplicateCount} trade(s) já existente(s) serão ignorados
              </div>
            )}

            {parsedData.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                ⚠️ {parsedData.errors.length} linha(s) com dados incompletos foram ignoradas
              </div>
            )}

            {importing && (
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Importando...</span>
                  <span className="text-white">
                    {importProgress.current} / {importProgress.total}
                  </span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(importProgress.current / importProgress.total) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setParsedData(null);
                  setValidation(null);
                  setFile(null);
                }}
                variant="secondary"
                disabled={importing}
                className="flex-1"
              >
                Escolher Outro Arquivo
              </Button>
              <Button
                onClick={handleImport}
                disabled={validation.validCount === 0 || importing}
                className="flex-1"
              >
                {importing ? 'Importando...' : `Importar ${validation.validCount} Trades`}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
