# TraderPro - Changelog v3.0.1

## Versao 3.0.1 - 17/01/2026

### Aba Analises - Correcoes e Melhorias

#### Correcao de Moedas por Ativo
- Ativos Forex (USDJPY, EURUSD, GBPUSD, etc.) agora exibem valores em USD
- Ativos B3 (WINFUT, PETR4, VALE3, etc.) continuam em BRL
- Deteccao automatica de moeda baseada em trade.currency ou trade.market

#### Separacao de Analises por Moeda
- Desempenho por Estrategia (R$" BRL) - Apenas trades em BRL
- Desempenho por Estrategia ($" USD) - Apenas trades em USD
- Desempenho por Dia da Semana (R$" BRL) - Apenas trades em BRL
- Desempenho por Dia da Semana ($" USD) - Apenas trades em USD

#### Conversao Automatica USD para BRL
- Valores em USD agora mostram conversao em tempo real
- Taxa de cambio calculada pela media dos trades USD
- Fonte menor e em cinza para nao poluir a visualizacao

#### Responsividade
- Desktop: Tabelas completas com conversao
- Mobile: Cards otimizados com conversao

---

Desenvolvedor: Junior Fray
Data: 17/01/2026
Versao: 3.0.1
Status: Producao
