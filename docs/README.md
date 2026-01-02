# TraderPro v2 - Documentação Técnica

## Estrutura do Projeto

\\\
src/
├── features/
│   ├── auth/              # Autenticação
│   ├── trades/            # Diário de trades
│   ├── dashboard/         # Dashboard principal
│   ├── analytics/         # Análises detalhadas
│   └── charts/            # Gráficos avançados
├── hooks/
│   └── useTrades.js       # Hook principal de trades
├── utils/
│   └── metrics.js         # Cálculos de métricas
└── services/
    └── firebase.js        # Configuração Firebase
\\\

## Dados no Firestore

**Caminho**: \/artifacts/trade-journal-public/users/{uid}/trades/{tradeId}\

**Estrutura de um Trade**:
\\\javascript
{
  asset: "WIN",           // string
  date: "2025-12-03",     // string (YYYY-MM-DD)
  pnl: "28.00",          // string (convertido para number)
  fees: "2.00",          // string (convertido para number)
  strategy: "",          // string
  type: "TRADE",         // string
  createdAt: timestamp,  // Firestore timestamp
  userId: "xxx"          // string
}
\\\

## Funções Principais

### useTrades()
- \loadTrades()\: Carrega trades do Firestore
- \createTrade(tradeData)\: Cria um trade
- \updateTrade(tradeId, tradeData)\: Atualiza trade
- \deleteTrade(tradeId)\: Remove trade
- \clearAllTrades()\: Remove todos os trades (batch)
- \importTrades(tradesArray)\: Importa múltiplos trades (batch)

### calculateMetrics(trades)
Calcula métricas convertendo strings para números:
- Total de Trades
- Win Rate
- Lucro/Prejuízo Líquido
- Profit Factor
- Melhor/Pior Trade

## Deploy

\\\ash
npm run build
firebase deploy --only hosting
\\\

**URLs**:
- Principal: https://meudiariotrade-29864.web.app
- Admin: https://meudiariotrade-admin.web.app
