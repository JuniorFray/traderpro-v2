\# 🔌 INTEGRAÇÃO MT5 / TRADINGVIEW - TRADERPRO



> \*\*Status:\*\* 🔜 Planejado para implementação futura

> \*\*Data:\*\* 19/01/2026



---



\## 📋 RESUMO



Sistema de sincronização automática de trades do MetaTrader 5 e TradingView para o TraderPro, eliminando entrada manual de dados.



---



\## 🎯 FUNCIONALIDADES



\### MetaTrader 5

\- ✅ Expert Advisor (EA) envia trades fechados automaticamente

\- ✅ Sincronização ao abrir MT5 (trades pendentes)

\- ✅ Funciona com trades abertos/fechados pelo celular

\- ✅ Proteção contra duplicatas (via ticket MT5)

\- ✅ Timer de backup (verifica a cada 15min)

\- ✅ Sistema de fila (envia depois se falhar)



\### TradingView

\- ✅ Webhook nativo (requer plano Pro+)

\- ⚠️ Email Alerts (alternativa grátis, com delay)

\- ✅ Configuração visual nos alertas

\- ✅ Compatível com qualquer estratégia Pine Script



---



\## 🔐 AUTENTICAÇÃO



\### Sistema de API Key

Usuário gera no TraderPro:

├─ API\_KEY: tpk\_random123...

├─ USER\_ID: uid\_firebase...

└─ Cole no EA/Webhook



text



\### Segurança

\- ✅ API Key única por usuário

\- ✅ Validação no backend (Firebase Function)

\- ✅ Regeneração a qualquer momento

\- ✅ Logs de sincronização



---



\## 🛠️ IMPLEMENTAÇÃO



\### Backend (Firebase Functions)



\*\*Arquivo:\*\* `functions/src/mt5Integration.js`



\*\*Endpoints:\*\*

1\. `syncMT5Trade` - Recebe e salva trades

2\. `testMT5Connection` - Testa credenciais



\*\*Estrutura Firestore:\*\*

users/

├── {userId}/

│ ├── apiKey: "tpk\_..."

│ ├── mt5Integration: true

│ └── trades/

│ └── {tradeId}/

│ ├── mt5Ticket: 12345

│ ├── source: "mt5"

│ ├── pnl: 150.00

│ └── syncedAt: timestamp



text



\### Frontend (React)



\*\*Nova página:\*\* `src/features/integrations/Integrations.jsx`



\*\*Funcionalidades:\*\*

\- Gerar/Regenerar API Key

\- Copiar credenciais (botão de copiar)

\- Download do EA MT5

\- Tutorial de configuração

\- Status da integração (ativo/inativo)

\- Log de últimas sincronizações



\### Expert Advisor MT5



\*\*Arquivo:\*\* `TraderProSync.mq5`



\*\*Inputs:\*\*

```mql5

input string API\_KEY = "";

input string USER\_ID = "";

input bool AUTO\_SYNC = true;

input int CHECK\_INTERVAL = 15; // minutos

Funcionamento:



OnInit() - Valida credenciais



OnTradeTransaction() - Detecta trades fechados



Timer - Verifica pendentes a cada X min



SendTrade() - POST para Firebase Function



📦 ESTRUTURA DE DADOS

Trade enviado pelo MT5:

json

{

&nbsp; "mt5Ticket": 12345,

&nbsp; "mt5Magic": 0,

&nbsp; "symbol": "XAUUSD",

&nbsp; "market": "forex",

&nbsp; "currency": "USD",

&nbsp; "entryPrice": 2050.50,

&nbsp; "exitPrice": 2055.80,

&nbsp; "quantity": 1.0,

&nbsp; "pnl": 530.00,

&nbsp; "commission": 5.30,

&nbsp; "swap": 0.00,

&nbsp; "date": "2026-01-19",

&nbsp; "strategy": "",

&nbsp; "notes": ""

}

Response:

json

{

&nbsp; "success": true,

&nbsp; "message": "Trade sincronizado com sucesso",

&nbsp; "tradeId": "abc123",

&nbsp; "mt5Ticket": 12345

}

🚀 PASSOS DE IMPLEMENTAÇÃO

1\. Backend

&nbsp;Inicializar Firebase Functions (firebase init functions)



&nbsp;Criar functions/src/mt5Integration.js



&nbsp;Adicionar exports no index.js



&nbsp;Deploy: firebase deploy --only functions



2\. Frontend - Página Integrações

&nbsp;Criar src/features/integrations/Integrations.jsx



&nbsp;Adicionar rota no AppRoutes.jsx



&nbsp;Criar hook useIntegration.js



&nbsp;Adicionar no menu lateral



3\. Expert Advisor MT5

&nbsp;Criar TraderProSync.mq5



&nbsp;Implementar validação de credenciais



&nbsp;Sistema de sincronização



&nbsp;Compilar e testar



4\. TradingView

&nbsp;Criar exemplo Pine Script



&nbsp;Documentar configuração webhook



&nbsp;Guia de alertas por email



5\. Testes

&nbsp;Testar autenticação



&nbsp;Testar envio de trade



&nbsp;Testar duplicatas



&nbsp;Testar reconexão



&nbsp;Testar com celular



📚 REFERÊNCIAS

TradingView Webhooks: https://br.tradingview.com/support/solutions/43000529348/



MT5 HTTP Requests: https://www.mql5.com/en/docs/network/webrequest



Firebase Functions: https://firebase.google.com/docs/functions



💡 MELHORIAS FUTURAS

&nbsp;Suporte para múltiplas contas MT5



&nbsp;Dashboard de status de sincronização



&nbsp;Notificações push quando trade sincroniza



&nbsp;Backup automático em caso de falha



&nbsp;Estatísticas de sincronização (taxa de sucesso)



&nbsp;Importação histórica de trades antigos

