\# Guia de Troubleshooting - TraderPro



\## Erros Comuns e Soluções



\### 1. "Cannot access 'Dl' before initialization"



\*\*Sintoma:\*\*

\- Página fica preta após refresh (F5)

\- Console mostra erro: `Uncaught ReferenceError: Cannot access 'Dl' before initialization`

\- Ocorre principalmente em `/trades`



\*\*Causa:\*\*

Dependência circular causada por barrel exports (`index.jsx`) que re-exportam componentes.



\*\*Solução:\*\*

Usar imports diretos em vez de barrel exports:



```javascript

// ❌ EVITAR (causa dependência circular)

import { Card, Button } from "../../components/ui"



// ✅ CORRETO (import direto)

import { Card } from "../../components/ui/Card"

import { Button } from "../../components/ui/Button"

Arquivos corrigidos:



src/features/trades/TradesPage.jsx ✅



2\. Página preta após deploy

Sintoma:



Site funciona localmente mas não em produção



Console vazio ou erro de chunk loading



Solução:



powershell

Remove-Item -Recurse -Force dist

npm run build

firebase deploy

3\. Trades não aparecem após cadastro

Sintoma:



Trade é criado mas lista não atualiza



Precisa dar F5 para ver



Solução:

Verificar se onSnapshot está implementado em src/hooks/useTrades.js



4\. Firebase Auth "CORS error"

Sintoma:



Login com Google não funciona



Erro de CORS no console



Solução:



Verificar domínio autorizado no Firebase Console



Trocar signInWithPopup por signInWithRedirect



Adicionar domínio em Authentication > Settings > Authorized domains



5\. Build falha com "memory exceeded"

Solução:



powershell

$env:NODE\_OPTIONS="--max-old-space-size=4096"

npm run build

Comandos Úteis

Limpar tudo e recomeçar

powershell

Remove-Item -Recurse -Force dist, node\_modules

npm install

npm run build

Testar build localmente

powershell

npm run preview

Ver logs detalhados

powershell

firebase deploy --debug

Checklist de Deploy

Antes de fazer deploy:



&nbsp;npm run build executa sem erros



&nbsp;Teste local com npm run preview



&nbsp;Commits salvos no Git



&nbsp;CHANGELOG.md atualizado



&nbsp;Remover console.log() de debug



&nbsp;Hard refresh após deploy (Ctrl + Shift + R)

