import { useState, useEffect } from 'react';
import { Input } from '../../components/ui/Input';
import { TradeImageUpload } from './TradeImageUpload'
import { Button } from '../../components/ui/Button';
import { MARKETS, CURRENCIES } from '../../constants/markets';

export const TradeForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    asset: initialData?.asset || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    market: initialData?.market || 'b3daytrade',
    currency: initialData?.currency || 'BRL',
    quantity: initialData?.quantity || '',
    entryPrice: initialData?.entryPrice || '',
    exitPrice: initialData?.exitPrice || '',
    entryTime: initialData?.entryTime || '',
    exitTime: initialData?.exitTime || '',
    pnl: initialData?.pnl || '',
    commission: initialData?.commission || '',
    swap: initialData?.swap || '',
    strategy: initialData?.strategy || '',
    notes: initialData?.notes || '',
    tradingviewLinks: initialData?.tradingviewLinks || ['', '', ''] // ✅ NOVO
  });

  // ✅ Estados para upload de imagens
  const [images, setImages] = useState(initialData?.images || []);
  const [tempTradeId] = useState(() => initialData?.id || `temp_${Date.now()}`);

  // ✅ FUNÇÃO DE VALIDAÇÃO DO LINK - NOVA
  const isValidTradingViewLink = (url) => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('tradingview.com');
    } catch {
      return false;
    }
  };

  // ✅ CORREÇÃO: Atualizar formulário quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData({
        asset: initialData.asset || initialData.symbol || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        market: initialData.market || 'b3daytrade',
        currency: initialData.currency || 'BRL',
        quantity: initialData.quantity || '',
        entryPrice: initialData.entryPrice || '',
        exitPrice: initialData.exitPrice || '',
        entryTime: initialData.entryTime || '',
        exitTime: initialData.exitTime || '',
        pnl: initialData.pnl || '',
        commission: initialData.commission || initialData.fees || '',
        swap: initialData.swap || '',
        strategy: initialData.strategy || '',
        notes: initialData.notes || '',
        tradingviewLinks: initialData.tradingviewLinks || ['', '', ''] // ✅ NOVO
      });
      setImages(initialData.images || []);
    }
  }, [initialData]);

  // Auto-selecionar moeda baseado no mercado
  useEffect(() => {
    const selectedMarket = MARKETS.find(m => m.value === formData.market);
    if (selectedMarket) {
      setFormData(prev => ({ ...prev, currency: selectedMarket.currency }));
    }
  }, [formData.market]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ NOVA FUNÇÃO: Atualizar link específico
  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.tradingviewLinks];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, tradingviewLinks: newLinks }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação extra: verificar se moeda corresponde ao mercado
    const selectedMarket = MARKETS.find(m => m.value === formData.market);
    if (selectedMarket && selectedMarket.currency !== formData.currency) {
      alert(`⚠️ Atenção: Mercado ${selectedMarket.label} usa ${selectedMarket.currency}!\nMoeda será ajustada automaticamente.`);
      formData.currency = selectedMarket.currency;
    }
    
    // ✅ Incluir imagens no submit
    onSubmit({
      ...formData,
      images
    });
  };

  // Obter moeda esperada do mercado
  const expectedCurrency = MARKETS.find(m => m.value === formData.market)?.currency || 'BRL';
  const currencyMismatch = formData.currency !== expectedCurrency;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mercado */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Mercado *
          </label>
          <select
            name="market"
            value={formData.market}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {MARKETS.map(market => (
              <option key={market.value} value={market.value}>
                {market.icon} {market.label}
              </option>
            ))}
          </select>
        </div>

        {/* Moeda (Auto-selecionada e bloqueada) */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Moeda * <span className="text-xs text-zinc-500">(auto-selecionada)</span>
          </label>
          <div className="relative">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled
              required
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white opacity-75 cursor-not-allowed"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
              🔒
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            💡 Moeda definida automaticamente pelo mercado selecionado
          </p>
        </div>

        {/* Ativo e Data */}
        <Input
          label="Ativo"
          name="asset"
          value={formData.asset}
          onChange={handleChange}
          placeholder="Ex: PETR4, EURUSD, WINFUT"
          required
        />

        <Input
          label="Data"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        {/* Campos Novos v3.0 */}
        <Input
          label="Quantidade"
          name="quantity"
          type="number"
          step="1"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Lotes/Contratos"
        />

        <Input
          label="Preço Entrada"
          name="entryPrice"
          type="number"
          step="0.01"
          value={formData.entryPrice}
          onChange={handleChange}
          placeholder="0.00"
        />

        <Input
          label="Preço Saída"
          name="exitPrice"
          type="number"
          step="0.01"
          value={formData.exitPrice}
          onChange={handleChange}
          placeholder="0.00"
        />

        <Input
          label="Horário Entrada"
          name="entryTime"
          type="time"
          value={formData.entryTime}
          onChange={handleChange}
        />

        <Input
          label="Horário Saída"
          name="exitTime"
          type="time"
          value={formData.exitTime}
          onChange={handleChange}
        />

        {/* Campos Financeiros */}
        <div>
          <Input
            label={`Resultado (PnL) em ${formData.currency}`}
            name="pnl"
            type="number"
            step="0.01"
            value={formData.pnl}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
          <p className="text-xs text-amber-400 mt-1">
            ⚠️ Insira o valor na moeda: <strong>{formData.currency}</strong>
          </p>
        </div>

        <Input
          label="Taxas/Corretagem"
          name="commission"
          type="number"
          step="0.01"
          value={formData.commission}
          onChange={handleChange}
          placeholder="0.00"
        />

        <Input
          label="Swap"
          name="swap"
          type="number"
          step="0.01"
          value={formData.swap}
          onChange={handleChange}
          placeholder="0.00"
        />

        <Input
          label="Estratégia"
          name="strategy"
          value={formData.strategy}
          onChange={handleChange}
          placeholder="Ex: Scalping, Swing"
        />
      </div>

      {/* Alerta de Moeda */}
      {formData.market === 'forex' && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💱</span>
            <div>
              <p className="text-blue-400 font-bold mb-1">Forex - Atenção com a moeda!</p>
              <p className="text-zinc-300 text-sm">
                Os valores devem ser inseridos em <strong>USD (dólares)</strong>.
                O sistema converterá automaticamente para BRL nos relatórios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Observações
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Anotações sobre o trade..."
        />
      </div>

      {/* ✅ NOVO: 3 CAMPOS DE LINKS DO TRADINGVIEW */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Links do TradingView <span className="text-xs text-zinc-500">(até 3 links opcionais)</span>
        </label>
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <input
                type="url"
                value={formData.tradingviewLinks[index]}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={`Link ${index + 1} - https://www.tradingview.com/chart/...`}
              />
              {formData.tradingviewLinks[index] && !isValidTradingViewLink(formData.tradingviewLinks[index]) && (
                <p className="text-xs text-amber-400 mt-1">
                  ⚠️ Link {index + 1} não parece ser do TradingView
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Upload de Imagens */}
      <TradeImageUpload
        tradeId={tempTradeId}
        initialImages={images}
        onImagesChange={setImages}
      />

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? 'Atualizar' : 'Cadastrar'} Trade
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
