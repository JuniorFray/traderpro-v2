# Changelog - TraderPro v2

## [2.0.1] - 02/01/2026

### Corrigido ✅
- **CRÍTICO**: Corrigido parseFloat() em todos os cálculos de métricas
  - Dashboard agora exibe corretamente: Lucro Líquido, Win Rate, Profit Factor
  - Analytics exibe análises corretas por Ativo, Estratégia e Dia da Semana
  - Charts exibe gráficos corretos: Equity Curve, Drawdown, P&L Mensal
- Corrigido caminho do Firestore de /users/ para /artifacts/trade-journal-public/users/
- Corrigido imports de AuthContext e firebase.js em useTrades.js

### Adicionado 🚀
- **Importação de Trades MT5 em Lote**: Importa múltiplos trades de uma vez usando batch write
- **Função Zerar Conta**: Remove todos os trades com confirmação
- **Modal ImportMT5Modal**: Interface melhorada para importação
- **Modal ClearAccountModal**: Confirmação de limpeza de conta
- **Função importTrades()**: Importação otimizada usando Firestore batch

### Estrutura de Dados 📊
- pnl: string (convertido para number com parseFloat)
- ees: string (convertido para number com parseFloat)
- Caminho Firestore: /artifacts/trade-journal-public/users/{uid}/trades

## [2.0.0] - Dezembro 2025
- Versão inicial do TraderPro v2
