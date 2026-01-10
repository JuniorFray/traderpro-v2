import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { MARKETS, CURRENCIES } from '../../constants/markets';

export const TradeForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    asset: initialData?.asset || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    market: initialData?.market || 'forex',
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
    notes: initialData?.notes || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mercado e Moeda */}
        <Select
          label="Mercado"
          name="market"
          value={formData.market}
          onChange={handleChange}
          required
        >
          {MARKETS.map(market => (
            <option key={market.value} value={market.value}>
              {market.icon} {market.label}
            </option>
          ))}
        </Select>

        <Select
          label="Moeda"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
        >
          {CURRENCIES.map(curr => (
            <option key={curr.value} value={curr.value}>
              {curr.label}
            </option>
          ))}
        </Select>

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

        {/* NOVOS CAMPOS v3.0 */}
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
        <Input
          label="Resultado (PnL)"
          name="pnl"
          type="number"
          step="0.01"
          value={formData.pnl}
          onChange={handleChange}
          placeholder="0.00"
          required
        />

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

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? 'Atualizar' : 'Cadastrar'} Trade
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
