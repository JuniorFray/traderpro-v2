# ðŸ”§ Guia de Troubleshooting - TraderPro v2

> **VersÃ£o:** 2.1.0  
> **Ãšltima atualizaÃ§Ã£o:** 04/01/2026  
> **Status:** âœ… ProduÃ§Ã£o

---

## ðŸ“‹ Ãndice

1. [Erros Comuns](#-erros-comuns)
2. [Problemas de Build](#-problemas-de-build)
3. [Problemas de Deploy](#-problemas-de-deploy)
4. [Problemas de AutenticaÃ§Ã£o](#-problemas-de-autenticaÃ§Ã£o)
5. [Problemas de NotificaÃ§Ãµes](#-problemas-de-notificaÃ§Ãµes)
6. [Problemas de Tickets](#-problemas-de-tickets)
7. [Comandos Ãšteis](#-comandos-Ãºteis)
8. [Checklist de Deploy](#-checklist-de-deploy)

---

## ðŸš¨ Erros Comuns

### **1. "Cannot access 'Dl' before initialization"**

**Sintoma:**
- âŒ PÃ¡gina fica preta apÃ³s refresh (F5)
- âŒ Console mostra: `Uncaught ReferenceError: Cannot access 'Dl' before initialization`
- âŒ Ocorre principalmente em `/trades`

**Causa:**
DependÃªncia circular causada por barrel exports (`index.jsx`) que re-exportam componentes.

**SoluÃ§Ã£o:**
Usar imports diretos em vez de barrel exports:

```javascript
// âŒ EVITAR (causa dependÃªncia circular)
import { Card, Button } from "../../components/ui"

// âœ… CORRETO (import direto)
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
Arquivos jÃ¡ corrigidos:

âœ… src/features/trades/TradesPage.jsx

âœ… src/features/analytics/Analytics.jsx

âœ… src/features/dashboard/Dashboard.jsx

2. Trades nÃ£o aparecem apÃ³s cadastro
Sintoma:

âŒ Trade Ã© criado mas lista nÃ£o atualiza

âŒ Precisa dar F5 para ver

Causa:
Listener onSnapshot nÃ£o implementado corretamente.

SoluÃ§Ã£o:
Verificar src/hooks/useTrades.js:

javascript
// âœ… CORRETO - Com onSnapshot
useEffect(() => {
  if (!user) return

  const tradesRef = collection(db, `artifacts/trade-journal-public/users/${user.uid}/trades`)
  const q = query(tradesRef, orderBy('date', 'desc'))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tradesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setTrades(tradesData)
  })

  return () => unsubscribe()
}, [user])
3. MÃ©tricas mostram valores errados
Sintoma:

âŒ Win Rate = NaN%

âŒ Lucro LÃ­quido = NaN

âŒ Profit Factor = Infinity

Causa:
Strings nÃ£o convertidas para nÃºmeros com parseFloat().

SoluÃ§Ã£o:
Sempre converter antes de calcular:

javascript
// âŒ ERRADO
const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)

// âœ… CORRETO
const totalPnl = trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0)
Status: âœ… Corrigido em 02/01/2026

4. NotificaÃ§Ãµes nÃ£o aparecem para usuÃ¡rio
Sintoma:

âŒ Admin cria notificaÃ§Ã£o mas usuÃ¡rio nÃ£o recebe

âŒ Contador no sino = 0

Causas possÃ­veis:

Causa 1: Tipo de notificaÃ§Ã£o errado

javascript
// UsuÃ¡rio Free nÃ£o recebe notificaÃ§Ãµes "pro"
// UsuÃ¡rio PRO nÃ£o recebe notificaÃ§Ãµes "free"
Causa 2: NotificaÃ§Ã£o agendada

javascript
// Verificar se scheduledFor Ã© futuro
Causa 3: NotificaÃ§Ã£o desativada

javascript
// Verificar isActive = true
SoluÃ§Ã£o:

powershell
# No console do navegador (F12):
# Verificar dados do usuÃ¡rio
console.log(user.uid, isPro)

# Buscar notificaÃ§Ãµes manualmente
const notifs = await getUserNotifications(user.uid, isPro)
console.log(notifs)
5. Popup de notificaÃ§Ã£o nÃ£o fecha
Sintoma:

âŒ Popup fica preso na tela

âŒ BotÃ£o X nÃ£o funciona

Causa:
State popupNotifications nÃ£o atualizado corretamente.

SoluÃ§Ã£o:
Verificar MainLayout.jsx:

javascript
// âœ… CORRETO
<NotificationPopup
  key={notif.id}
  notification={notif}
  onClose={() => {
    setPopupNotifications(prev => prev.filter(n => n.id !== notif.id))
  }}
  onMarkAsRead={handleMarkAsRead}
/>
6. Ticket criado mas nÃ£o aparece na lista
Sintoma:

âŒ UsuÃ¡rio cria ticket

âŒ SupportPage mostra "Nenhum ticket"

âŒ Admin tambÃ©m nÃ£o vÃª

Causa:
Path do Firestore incorreto ou falta de permissÃ£o.

SoluÃ§Ã£o:

javascript
// âœ… CORRETO - Path completo
const ticketsRef = collection(db, 'artifacts/trade-journal-public/tickets')

// Verificar Firestore Rules
// UsuÃ¡rio deve ter permissÃ£o de read/create
7. Admin nÃ£o consegue responder ticket
Sintoma:

âŒ Admin clica "Enviar resposta"

âŒ Mensagem nÃ£o Ã© adicionada

Causa:
Email do admin nÃ£o autorizado nas regras.

SoluÃ§Ã£o:
Verificar firestore.rules:

javascript
allow update: if request.auth != null &&
  (resource.data.userId == request.auth.uid ||
   get(/databases/$(database)/documents/artifacts/trade-journal-public/adminUsers/$(request.auth.uid)).data.email == 'juniorfray944@gmail.com');
ðŸ—ï¸ Problemas de Build
1. Build falha com "memory exceeded"
Sintoma:

text
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
SoluÃ§Ã£o:

powershell
# Aumentar memÃ³ria do Node.js
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
npm run build:admin
2. Build falha com "Module not found"
Sintoma:

text
Error: Cannot find module './components/ui/Card'
Causa:
Import com caminho errado ou componente nÃ£o existe.

SoluÃ§Ã£o:

javascript
// Verificar caminho relativo correto
import { Card } from "../../components/ui/Card"

// Verificar se arquivo existe
dir src\components\ui\Card.jsx
3. Build gera arquivos corrompidos
Sintoma:

âŒ Build termina sem erros

âŒ Deploy OK mas pÃ¡gina preta

SoluÃ§Ã£o:

powershell
# Limpar cache e reconstruir
Remove-Item -Recurse -Force dist, dist-admin, node_modules\.vite
npm run build
npm run build:admin
ðŸš€ Problemas de Deploy
1. PÃ¡gina preta apÃ³s deploy
Sintoma:

âœ… Funciona localmente (npm run dev)

âŒ ProduÃ§Ã£o mostra pÃ¡gina preta

âŒ Console vazio ou erro de chunk loading

SoluÃ§Ã£o:

powershell
# 1. Limpar builds antigos
Remove-Item -Recurse -Force dist, dist-admin

# 2. Rebuild completo
npm run build
npm run build:admin

# 3. Preview local antes de deploy
npm run preview

# 4. Deploy
firebase deploy --only hosting
2. Deploy falha com "Invalid hosting configuration"
Sintoma:

text
Error: Invalid hosting configuration
Causa:
firebase.json com erro de sintaxe.

SoluÃ§Ã£o:
Verificar firebase.json:

json
{
  "hosting": [
    {
      "site": "meudiariotrade-29864",
      "public": "dist",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "site": "meudiariotrade-admin",
      "public": "dist-admin",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index-admin.html"
        }
      ]
    }
  ]
}
3. Deploy sÃ³ atualiza uma das aplicaÃ§Ãµes
Sintoma:

âœ… App principal atualiza

âŒ Admin continua antigo (ou vice-versa)

Causa:
Build de apenas uma aplicaÃ§Ã£o.

SoluÃ§Ã£o:

powershell
# SEMPRE fazer build de ambas antes do deploy
npm run build
npm run build:admin
firebase deploy --only hosting

# Ou deploy separado:
firebase deploy --only hosting:meudiariotrade-29864
firebase deploy --only hosting:meudiariotrade-admin
ðŸ” Problemas de AutenticaÃ§Ã£o
1. Firebase Auth "CORS error"
Sintoma:

âŒ Login com Google nÃ£o funciona

âŒ Erro de CORS no console

SoluÃ§Ã£o:

Verificar domÃ­nio autorizado no Firebase Console:

Authentication â†’ Settings â†’ Authorized domains

Adicionar: meudiariotrade-29864.web.app

Adicionar: meudiariotrade-admin.web.app

Trocar popup por redirect:

javascript
// Se popup falhar, usar redirect
import { signInWithRedirect } from 'firebase/auth'

await signInWithRedirect(auth, googleProvider)
2. Admin nÃ£o consegue fazer login
Sintoma:

âŒ Email/senha corretos

âŒ Redireciona de volta para login

Causa:
Email nÃ£o autorizado no Firestore.

SoluÃ§Ã£o:

javascript
// Verificar no Firestore:
// artifacts/trade-journal-public/adminUsers/{uid}
// email: "juniorfray944@gmail.com"

// Se nÃ£o existir, criar manualmente no console
3. UsuÃ¡rio deslogado automaticamente
Sintoma:

âœ… Login OK

âŒ ApÃ³s alguns segundos, volta para tela de login

Causa:
Token expirado ou sessÃ£o invÃ¡lida.

SoluÃ§Ã£o:

javascript
// Limpar cache do navegador
// Ou forÃ§ar novo login:
await signOut(auth)
await signInWithEmailAndPassword(auth, email, password)
ðŸ”” Problemas de NotificaÃ§Ãµes
1. Contador do sino nÃ£o atualiza
Sintoma:

âœ… NotificaÃ§Ã£o existe

âŒ Contador = 0

Causa:
Status de leitura nÃ£o sincronizado.

SoluÃ§Ã£o:

javascript
// ForÃ§ar reload de notificaÃ§Ãµes
await loadNotifications()

// Verificar status no Firestore:
// artifacts/trade-journal-public/userNotifications/{userId}/{notifId}
2. Popup aparece para notificaÃ§Ã£o jÃ¡ lida
Sintoma:

âŒ Popup mostra notificaÃ§Ã£o antiga

Causa:
shownPopupIds nÃ£o persistido entre sessÃµes.

SoluÃ§Ã£o atual:

Estado resetado ao fazer logout/login (comportamento esperado)

Melhoria futura:

Salvar shownPopupIds no localStorage

ðŸŽ« Problemas de Tickets
1. Mensagens nÃ£o aparecem em ordem
Sintoma:

âŒ Mensagens fora de ordem cronolÃ³gica

Causa:
Array messages sem sort.

SoluÃ§Ã£o:

javascript
// Ordenar mensagens por timestamp
const sortedMessages = ticket.messages.sort((a, b) => 
  a.createdAt - b.createdAt
)
2. Status do ticket nÃ£o atualiza
Sintoma:

âœ… Admin muda status

âŒ UsuÃ¡rio ainda vÃª status antigo

Causa:
Cache local ou falta de listener em tempo real.

SoluÃ§Ã£o:

javascript
// Implementar onSnapshot para tickets
const unsubscribe = onSnapshot(ticketDoc, (doc) => {
  setTicket(doc.data())
})
ðŸ› ï¸ Comandos Ãšteis
Desenvolvimento
powershell
# Rodar app principal
npm run dev

# Rodar admin
npm run dev:admin

# Rodar ambos (2 terminais)
# Terminal 1:
npm run dev
# Terminal 2:
npm run dev:admin
Build
powershell
# Build app principal
npm run build

# Build admin
npm run build:admin

# Preview local
npm run preview
Deploy
powershell
# Deploy completo (ambas as apps)
firebase deploy --only hosting

# Deploy app principal
firebase deploy --only hosting:meudiariotrade-29864

# Deploy admin
firebase deploy --only hosting:meudiariotrade-admin

# Deploy com logs detalhados
firebase deploy --debug
Limpeza
powershell
# Limpar builds
Remove-Item -Recurse -Force dist, dist-admin

# Limpar node_modules
Remove-Item -Recurse -Force node_modules

# Limpar tudo e reinstalar
Remove-Item -Recurse -Force dist, dist-admin, node_modules
npm install
Git
powershell
# Status
git status

# Add tudo
git add .

# Commit
git commit -m "AtualizaÃ§Ã£o da documentaÃ§Ã£o"

# Push
git push
Firestore (via Console)
javascript
// Buscar todos os trades de um usuÃ¡rio
db.collection('artifacts/trade-journal-public/users/USER_ID/trades').get()

// Buscar notificaÃ§Ãµes ativas
db.collection('artifacts/trade-journal-public/notifications')
  .where('isActive', '==', true).get()

// Buscar tickets abertos
db.collection('artifacts/trade-journal-public/tickets')
  .where('status', '==', 'open').get()
âœ… Checklist de Deploy
Antes de fazer deploy:
text
[ ] npm run build executa sem erros
[ ] npm run build:admin executa sem erros
[ ] Teste local com npm run preview
[ ] Commits salvos no Git
[ ] CHANGELOG.md atualizado
[ ] README.md atualizado (se necessÃ¡rio)
[ ] Remover console.log() de debug
[ ] Verificar arquivo .env (nÃ£o deve estar no Git)
[ ] Testar notificaÃ§Ãµes (criar uma de teste)
[ ] Testar tickets (criar e responder)
[ ] Testar mÃ©tricas (criar trade e verificar cÃ¡lculos)
ApÃ³s deploy:
text
[ ] Hard refresh (Ctrl + Shift + R) no navegador
[ ] Testar login usuÃ¡rio
[ ] Testar login admin
[ ] Verificar notificaÃ§Ãµes aparecem
[ ] Verificar tickets funcionam
[ ] Verificar mÃ©tricas corretas
[ ] Testar em mobile (Chrome DevTools)
[ ] Verificar console sem erros (F12)
ðŸ› Reportar Bugs
Se encontrar um bug nÃ£o listado aqui:

Reproduzir o erro em ambiente local

Copiar mensagem de erro completa do console (F12)

Anotar passos para reproduzir

Verificar se afeta apenas uma aplicaÃ§Ã£o ou ambas

Documentar neste arquivo para referÃªncia futura

ðŸ“ž Contato
Desenvolvedor: Junior Fray
Email: juniorfray944@gmail.com
Projeto: TraderPro v2

Ãšltima atualizaÃ§Ã£o: 04/01/2026
VersÃ£o: 2.1.0

text