# 🏗️ Arquitetura do Sistema - TraderPro v2

> **Versão:** 2.1.0  
> **Última atualização:** 04/01/2026  
> **Status:** ✅ Produção

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura de Aplicações](#-arquitetura-de-aplicações)
3. [Estrutura de Rotas](#-estrutura-de-rotas)
4. [Autenticação e Segurança](#-autenticação-e-segurança)
5. [Fluxo de Dados](#-fluxo-de-dados)
6. [Sistema de Notificações](#-sistema-de-notificações)
7. [Sistema de Tickets](#-sistema-de-tickets)
8. [Componentes e Arquitetura](#-componentes-e-arquitetura)
9. [Deploy e Hosting](#-deploy-e-hosting)

---

## 🎯 Visão Geral

O **TraderPro v2** utiliza uma arquitetura **separada por domínios**, com **duas aplicações independentes**:

1. **App Principal (Usuários)** - `meudiariotrade-29864.web.app`
2. **App Admin** - `meudiariotrade-admin.web.app`

### **Características Principais:**
- ✅ **Autenticação separada** (contextos independentes)
- ✅ **Build separado** (Vite com configurações distintas)
- ✅ **Deploy independente** (Firebase Hosting com 2 sites)
- ✅ **Roteamento isolado** (sem conflitos entre apps)
- ✅ **Segurança aprimorada** (admin com verificação de email)

---

## 🏢 Arquitetura de Aplicações

traderpro-v2/
│
├── 📱 APP PRINCIPAL (Usuários)
│ ├── Entry Point: src/main.jsx
│ ├── Root: src/App.jsx
│ ├── HTML: index.html
│ ├── Config: vite.config.js
│ └── Build: dist/
│
└── ⚙️ APP ADMIN (Administradores)
├── Entry Point: src/main-admin.jsx
├── Root: src/App.jsx (reutilizado)
├── HTML: index-admin.html
├── Config: vite.config.admin.js
└── Build: dist-admin/

text

### **Separação de Builds**

#### **1. App Principal (main.jsx)**
```javascript
// src/main.jsx
import { CustomerRoutes } from './routes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>           // ← AuthContext.jsx (usuários)
      <BrowserRouter>
        <CustomerRoutes />   // ← Rotas de usuários
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
2. App Admin (main-admin.jsx)
javascript
// src/main-admin.jsx
import { AdminRoutes } from './routes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProviderAdmin>      // ← AuthContextAdmin.jsx (admins)
      <BrowserRouter>
        <AdminRoutes />      // ← Rotas de admin
      </BrowserRouter>
    </AuthProviderAdmin>
  </React.StrictMode>
)
🛤️ Estrutura de Rotas
CustomerRoutes (Usuários)
javascript
// src/routes.jsx
export const CustomerRoutes = () => (
  <Routes>
    {/* Rotas Públicas */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/landing" element={<LandingPage />} />

    {/* Rotas Protegidas */}
    <Route element={<PrivateRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>
    </Route>
  </Routes>
)
AdminRoutes (Administradores)
javascript
// src/routes.jsx
export const AdminRoutes = () => (
  <Routes>
    {/* Login Admin */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Rotas Protegidas Admin */}
    <Route element={<AdminPrivateRouteForAdminApp />}>
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/tickets" element={<AdminTicketsPage />} />
    </Route>

    {/* Redirecionar tudo para /admin */}
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Routes>
)
🔐 Autenticação e Segurança
Dois Sistemas de Autenticação Independentes
1. AuthContext.jsx (Usuários)
javascript
// src/features/auth/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isPro, setIsPro] = useState(false)
  
  // Monitora mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Verifica se é PRO no Firestore
        const userData = await getDoc(doc(db, 'artifacts/trade-journal-public/users', firebaseUser.uid))
        setIsPro(userData.data()?.isPro || false)
      }
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, isPro, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
2. AuthContextAdmin.jsx (Admins)
javascript
// src/features/auth/AuthContextAdmin.jsx
export const AuthProviderAdmin = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ⚠️ VERIFICAÇÃO CRÍTICA: Apenas email específico
        const adminRef = doc(db, 'artifacts/trade-journal-public/adminUsers', firebaseUser.uid)
        const adminSnap = await getDoc(adminRef)
        
        if (adminSnap.exists() && adminSnap.data().email === 'juniorfray944@gmail.com') {
          setAdminUser(firebaseUser)
        } else {
          // Força logout se não for admin autorizado
          await signOut(auth)
          setAdminUser(null)
        }
      }
    })
    return unsubscribe
  }, [])

  return (
    <AuthContextAdmin.Provider value={{ adminUser, signInAdmin, signOutAdmin }}>
      {children}
    </AuthContextAdmin.Provider>
  )
}
Rotas Protegidas
PrivateRoute (Usuários)
javascript
// src/features/auth/PrivateRoute.jsx
export const PrivateRoute = () => {
  const { user, loading } = useAuth()
  
  if (loading) return <Loading />
  
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
AdminPrivateRoute (Admins)
javascript
// src/components/AdminPrivateRouteForAdminApp.jsx
export const AdminPrivateRouteForAdminApp = () => {
  const { adminUser, loading } = useAuthAdmin()
  
  if (loading) return <Loading />
  
  return adminUser ? <Outlet /> : <Navigate to="/admin/login" replace />
}
🔄 Fluxo de Dados
Arquitetura de Dados no Firestore
text
Firestore Database
│
└── artifacts/
    └── trade-journal-public/
        │
        ├── 👥 adminUsers/          # Controle de acesso admin
        │   └── {uid}/
        │       ├── email
        │       └── isPro
        │
        ├── 👤 users/               # Dados dos usuários
        │   └── {uid}/
        │       ├── email
        │       ├── isPro
        │       ├── createdAt
        │       └── 💹 trades/      # Subcoleção de trades
        │           └── {tradeId}/
        │               ├── asset
        │               ├── date
        │               ├── pnl
        │               ├── fees
        │               └── strategy
        │
        ├── 🔔 notifications/       # Notificações globais
        │   └── {notificationId}/
        │       ├── title, message
        │       ├── type, category, style
        │       ├── targetUserId
        │       ├── actionButton
        │       └── stats
        │
        ├── 📖 userNotifications/   # Status de leitura
        │   └── {uid}/
        │       └── {notificationId}/
        │           ├── read
        │           └── readAt
        │
        └── 🎫 tickets/             # Sistema de suporte
            └── {ticketId}/
                ├── userId, userEmail
                ├── subject, category
                ├── priority, status
                └── messages[]
Fluxo de Leitura/Escrita
text
USER → Component → Hook (useTrades) → Service (trades.js) → Firestore
                      ↓                        ↓
                   useState              Firebase SDK
                      ↓                        ↓
                  Re-render  ←────────  Real-time Updates
🔔 Sistema de Notificações
Arquitetura do Sistema
text
┌─────────────────────────────────────────────────────┐
│                   ADMIN CRIA                        │
│              NotificationManager.jsx                │
│         (Cria notificação no Firestore)            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              FIRESTORE DATABASE                     │
│         /notifications/{notificationId}            │
│                                                     │
│  -  type: "global" | "individual" | "pro" | "free"  │
│  -  category: "news" | "warning" | "promotion"      │
│  -  style: "info" | "success" | "warning" | "error" │
│  -  targetUserId (opcional para individual)         │
│  -  actionButton { text, url }                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                USUÁRIO ACESSA                       │
│              MainLayout.jsx                         │
│                                                     │
│  useEffect(() => {                                  │
│    loadNotifications() // A cada 30s               │
│  }, [user, isPro])                                  │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ NOTIFICATION │   │ NOTIFICATION     │
│   POPUP      │   │   CENTER         │
│              │   │                  │
│ (Automático) │   │ (Clica no 🔔)   │
└──────────────┘   └──────────────────┘
Componentes
NotificationCenter - Modal com lista completa

NotificationPopup - Popup individual automático

NotificationManager - Interface admin para criar/editar

🎫 Sistema de Tickets
Fluxo de Tickets
text
USUÁRIO                          FIRESTORE                        ADMIN
   │                                 │                              │
   │  1. Criar Ticket               │                              │
   ├──────────────────────────────► │                              │
   │     (SupportPage.jsx)          │                              │
   │                                 │                              │
   │                                 │  2. Notifica Admin          │
   │                                 ├─────────────────────────────►│
   │                                 │                              │
   │                                 │  3. Admin Responde          │
   │                                 │◄─────────────────────────────┤
   │                                 │   (AdminTicketsPage.jsx)    │
   │  4. Atualização em tempo real  │                              │
   │◄────────────────────────────────┤                              │
   │     (TicketDetailModal.jsx)    │                              │
Estados do Ticket
open - Aberto (novo ticket criado)

in_progress - Em andamento (admin respondeu)

resolved - Resolvido (problema solucionado)

closed - Fechado (ticket arquivado)

🧩 Componentes e Arquitetura
Hierarquia de Componentes
text
App.jsx (Root)
│
├── AuthProvider / AuthProviderAdmin
│   │
│   └── BrowserRouter
│       │
│       ├── CustomerRoutes
│       │   │
│       │   ├── PublicRoutes (Login, Register)
│       │   │
│       │   └── PrivateRoute
│       │       │
│       │       └── MainLayout
│       │           ├── Header (com NotificationButton)
│       │           ├── Sidebar (Menu de navegação)
│       │           ├── Outlet (Conteúdo da página)
│       │           ├── NotificationCenter (Modal)
│       │           └── NotificationPopup (Popup)
│       │
│       └── AdminRoutes
│           │
│           ├── AdminLogin
│           │
│           └── AdminPrivateRoute
│               │
│               └── Admin.jsx
│                   ├── Tabs (Usuários / Notificações / Tickets)
│                   ├── NotificationManager
│                   └── AdminTicketsPage
Componentes Reutilizáveis (UI)
text
src/components/ui/
├── Button.jsx          # Botões customizados
├── Card.jsx            # Container de conteúdo
├── Input.jsx           # Campo de input
├── Select.jsx          # Dropdown select
├── Modal.jsx           # Modal genérico
├── Loading.jsx         # Indicador de carregamento
└── MetricCard.jsx      # Card de métrica
🚀 Deploy e Hosting
Configuração do Firebase Hosting
json
// firebase.json
{
  "hosting": [
    {
      "site": "meudiariotrade-29864",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
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
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index-admin.html"
        }
      ]
    }
  ]
}
Scripts de Build e Deploy
json
// package.json
{
  "scripts": {
    "dev": "vite",                              // App principal (dev)
    "dev:admin": "vite --config vite.config.admin.js --port 5174",  // Admin (dev)
    "build": "vite build",                      // Build app principal
    "build:admin": "vite build --config vite.config.admin.js",      // Build admin
    "preview": "vite preview"
  }
}
Processo de Deploy
bash
# 1. Build de ambas as aplicações
npm run build
npm run build:admin

# 2. Deploy no Firebase Hosting
firebase deploy --only hosting

# Ou deploy específico:
firebase deploy --only hosting:meudiariotrade-29864      # App principal
firebase deploy --only hosting:meudiariotrade-admin      # Admin
🔒 Segurança
Firestore Rules
javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin Users (apenas leitura)
    match /artifacts/trade-journal-public/adminUsers/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas via console
    }
    
    // Users e Trades
    match /artifacts/trade-journal-public/users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /trades/{tradeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Notifications (todos podem ler)
    match /artifacts/trade-journal-public/notifications/{notifId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas admin via app
    }
    
    // User Notifications Status
    match /artifacts/trade-journal-public/userNotifications/{userId}/{notifId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tickets
    match /artifacts/trade-journal-public/tickets/{ticketId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      get(/databases/$(database)/documents/artifacts/trade-journal-public/adminUsers/$(request.auth.uid)).data.email == 'juniorfray944@gmail.com');
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       (resource.data.userId == request.auth.uid ||
                        get(/databases/$(database)/documents/artifacts/trade-journal-public/adminUsers/$(request.auth.uid)).data.email == 'juniorfray944@gmail.com');
    }
  }
}
📊 Métricas e Performance
Otimizações Implementadas
Lazy Loading - Componentes carregados sob demanda

Batch Operations - Importação de trades em lote

Memoization - useMemo/useCallback em cálculos pesados

Code Splitting - Build separado por aplicação

Firestore Indexes - Queries otimizadas

Métricas de Bundle
text
App Principal (dist/):
├── index.html         ~2 KB
├── assets/
│   ├── index.js      ~350 KB (minificado + gzipped)
│   └── index.css     ~50 KB

App Admin (dist-admin/):
├── index-admin.html   ~2 KB
├── assets/
│   ├── index-admin.js  ~320 KB
│   └── index-admin.css ~45 KB
🔄 Fluxo de Desenvolvimento
text
1. Desenvolvimento Local
   ├── npm run dev (App Principal)
   └── npm run dev:admin (Admin)

2. Testes
   ├── Testar funcionalidades
   └── Verificar responsividade

3. Build
   ├── npm run build
   └── npm run build:admin

4. Deploy
   └── firebase deploy --only hosting

5. Verificação
   ├── Testar App Principal
   └── Testar Admin
📝 Notas Importantes
⚠️ Pontos de Atenção
Autenticação Separada: Nunca compartilhar contextos entre apps

UID Consistente: Mesmo usuário tem mesmo UID em ambas as apps

Build Separado: Sempre fazer build das duas apps antes do deploy

Admin Email: Hardcoded como juniorfray944@gmail.com

Firestore Path: Sempre usar /artifacts/trade-journal-public/

✅ Boas Práticas
Sempre testar localmente antes do deploy

Fazer backup do Firestore antes de mudanças grandes

Documentar mudanças no CHANGELOG.md

Manter componentes pequenos e reutilizáveis

Usar TypeScript para maior segurança (futuro)

Última atualização: 04/01/2026
Versão: 2.1.0
Desenvolvedor: Junior Fray