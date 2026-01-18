// src/features/analytics/Analytics.jsx
import { useState } from "react";
import { useTrades } from "../../hooks/useTrades";
import { Card } from "../../components/ui/Card";
import { TradeFilters } from "../../components/filters/TradeFilters";
import { formatCurrency } from "../../utils/metrics";

export const Analytics = () => {
  const { trades, loading } = useTrades();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all"
  });

  if (loading) {
    return <div className="text-center p-8 text-zinc-400">Carregando...</div>;
  }

  // Aplicar filtros
  const filteredTrades = trades.filter(trade => {
    const tradePnl = parseFloat(trade.pnl) || 0;
    if (filters.startDate && trade.date < filters.startDate) return false;
    if (filters.endDate && trade.date > filters.endDate) return false;
    if (filters.symbol && !(trade.asset || trade.symbol || "").toLowerCase().includes(filters.symbol.toLowerCase())) return false;
    if (filters.strategy && !(trade.strategy || "").toLowerCase().includes(filters.strategy.toLowerCase())) return false;
    if (filters.result === "win" && tradePnl <= 0) return false;
    if (filters.result === "loss" && tradePnl >= 0) return false;
    return true;
  });

  // NOVO: Calcular taxa de câmbio média dos trades USD
  const getAverageExchangeRate = (tradesArray) => {
    const usdTrades = tradesArray.filter(t => (t.currency || (t.market === 'forex' ? 'USD' : 'BRL')) === 'USD');
    if (usdTrades.length === 0) return 5.45; // Taxa padrão se não houver trades USD
    
    const totalRate = usdTrades.reduce((sum, t) => {
      const rate = parseFloat(t.exchangeRate) || 5.45;
      return sum + rate;
    }, 0);
    
    return totalRate / usdTrades.length;
  };

  const avgExchangeRate = getAverageExchangeRate(filteredTrades);

  // Análise por Ativo
  const bySymbol = filteredTrades.reduce((acc, trade) => {
    const symbol = trade.asset || trade.symbol || "NA";
    const tradePnl = parseFloat(trade.pnl) || 0;
    
    if (!acc[symbol]) {
      acc[symbol] = { 
        trades: [], 
        pnl: 0, 
        wins: 0, 
        losses: 0,
        currency: trade.currency || (trade.market === 'forex' ? 'USD' : 'BRL')
      };
    }
    
    acc[symbol].trades.push(trade);
    acc[symbol].pnl += tradePnl;
    if (tradePnl > 0) acc[symbol].wins++;
    else if (tradePnl < 0) acc[symbol].losses++;
    return acc;
  }, {});

  // Análise por Estratégia separada por moeda
  const byStrategyRaw = filteredTrades.reduce((acc, trade) => {
    const strategy = trade.strategy || "Sem Estratégia";
    const tradePnl = parseFloat(trade.pnl) || 0;
    const currency = trade.currency || (trade.market === 'forex' ? 'USD' : 'BRL');
    
    const key = `${strategy}|${currency}`;
    
    if (!acc[key]) {
      acc[key] = { 
        strategy, 
        currency,
        trades: [], 
        pnl: 0, 
        wins: 0, 
        losses: 0 
      };
    }
    
    acc[key].trades.push(trade);
    acc[key].pnl += tradePnl;
    if (tradePnl > 0) acc[key].wins++;
    else if (tradePnl < 0) acc[key].losses++;
    return acc;
  }, {});

  const byStrategyBRL = {};
  const byStrategyUSD = {};
  
  Object.entries(byStrategyRaw).forEach(([key, value]) => {
    if (value.currency === 'USD') {
      byStrategyUSD[value.strategy] = value;
    } else {
      byStrategyBRL[value.strategy] = value;
    }
  });

  // Análise por Dia da Semana separada por moeda
  const byWeekdayRaw = filteredTrades.reduce((acc, trade) => {
    const date = new Date(trade.date + "T12:00:00");
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const tradePnl = parseFloat(trade.pnl) || 0;
    const currency = trade.currency || (trade.market === 'forex' ? 'USD' : 'BRL');
    
    const key = `${weekday}|${currency}`;
    
    if (!acc[key]) {
      acc[key] = { 
        weekday,
        currency,
        trades: [], 
        pnl: 0, 
        wins: 0, 
        losses: 0, 
        order: date.getDay() 
      };
    }
    
    acc[key].trades.push(trade);
    acc[key].pnl += tradePnl;
    if (tradePnl > 0) acc[key].wins++;
    else if (tradePnl < 0) acc[key].losses++;
    return acc;
  }, {});

  const byWeekdayBRL = {};
  const byWeekdayUSD = {};
  
  Object.entries(byWeekdayRaw).forEach(([key, value]) => {
    if (value.currency === 'USD') {
      byWeekdayUSD[value.weekday] = value;
    } else {
      byWeekdayBRL[value.weekday] = value;
    }
  });

  // Versão Desktop - Tabela
  const renderTable = (data, title, icon, sortByPnl = true, currency = null) => {
    if (Object.keys(data).length === 0) return null;
    
    const items = Object.entries(data)
      .map(([key, value]) => ({
        name: value.strategy || value.weekday || key,
        ...value,
        winRate: (value.wins + value.losses) > 0 
          ? (value.wins / (value.wins + value.losses)) * 100 
          : 0
      }))
      .sort((a, b) => {
        if (sortByPnl) {
          return b.pnl - a.pnl;
        } else {
          return a.order - b.order;
        }
      });

    return (
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">
          {icon} {title}
          {currency && <span className="text-sm ml-2 text-zinc-400">({currency === 'BRL' ? 'R$ BRL' : '$ USD'})</span>}
        </h3>

        {/* Versão Desktop - Tabela */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-2 text-zinc-400 font-medium text-sm">Nome</th>
                <th className="text-right py-2 px-2 text-zinc-400 font-medium text-sm">Trades</th>
                <th className="text-right py-2 px-2 text-zinc-400 font-medium text-sm">Vitórias</th>
                <th className="text-right py-2 px-2 text-zinc-400 font-medium text-sm">Derrotas</th>
                <th className="text-right py-2 px-2 text-zinc-400 font-medium text-sm">Win Rate</th>
                <th className="text-right py-2 px-2 text-zinc-400 font-medium text-sm">P&L Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.name} className="border-b border-zinc-900">
                  <td className="py-3 px-2 text-white font-medium">{item.name}</td>
                  <td className="py-3 px-2 text-right text-zinc-300">{item.trades.length}</td>
                  <td className="py-3 px-2 text-right text-win">{item.wins}</td>
                  <td className="py-3 px-2 text-right text-loss">{item.losses}</td>
                  <td className="py-3 px-2 text-right text-zinc-300">{item.winRate.toFixed(1)}%</td>
                  <td className={`py-3 px-2 text-right font-bold ${item.pnl > 0 ? "text-win" : "text-loss"}`}>
                    <div>
                      {currency 
                        ? formatCurrency(item.pnl, currency)
                        : formatCurrency(item.pnl, item.currency)
                      }
                    </div>
                    {/* NOVO: Conversão para BRL se for USD */}
                    {(currency === 'USD' || item.currency === 'USD') && (
                      <div className="text-xs text-zinc-500 font-normal mt-0.5">
                        ≈ {formatCurrency(item.pnl * avgExchangeRate, 'BRL')}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão Mobile - Cards */}
        <div className="md:hidden space-y-3">
          {items.map(item => (
            <div key={item.name} className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold text-base">{item.name}</h4>
                <div className="text-right">
                  <span className={`text-lg font-bold block ${item.pnl > 0 ? "text-win" : "text-loss"}`}>
                    {currency 
                      ? formatCurrency(item.pnl, currency)
                      : formatCurrency(item.pnl, item.currency)
                    }
                  </span>
                  {/* NOVO: Conversão para BRL se for USD */}
                  {(currency === 'USD' || item.currency === 'USD') && (
                    <span className="text-xs text-zinc-500 block mt-0.5">
                      ≈ {formatCurrency(item.pnl * avgExchangeRate, 'BRL')}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total de Trades</p>
                  <p className="text-white font-semibold">{item.trades.length}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
                  <p className="text-white font-semibold">{item.winRate.toFixed(1)}%</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1">Vitórias</p>
                  <p className="text-win font-semibold">{item.wins}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1">Derrotas</p>
                  <p className="text-loss font-semibold">{item.losses}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Análises Detalhadas</h2>
        <p className="text-sm md:text-base text-zinc-400">
          Análise profunda por ativo, estratégia e padrões • {filteredTrades.length} trades
        </p>
      </div>

      <TradeFilters onFilterChange={setFilters} />

      {filteredTrades.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-zinc-500">
            Nenhum trade encontrado com os filtros aplicados
          </div>
        </Card>
      ) : (
        <>
          {renderTable(bySymbol, "Desempenho por Ativo", "📈", true)}
          {renderTable(byStrategyBRL, "Desempenho por Estratégia", "🎯", true, 'BRL')}
          {renderTable(byStrategyUSD, "Desempenho por Estratégia", "🎯", true, 'USD')}
          {renderTable(byWeekdayBRL, "Desempenho por Dia da Semana", "📅", false, 'BRL')}
          {renderTable(byWeekdayUSD, "Desempenho por Dia da Semana", "📅", false, 'USD')}
        </>
      )}
    </div>
  );
};
