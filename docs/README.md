\# 📊 TraderPro v2 - Documentação Completa



> Sistema profissional de gerenciamento de trades com análises avançadas e painel administrativo.



\## 🎯 Visão Geral



O TraderPro é uma plataforma web completa para traders que desejam registrar, analisar e otimizar suas operações no mercado financeiro. O sistema oferece dashboards interativos, relatórios profissionais, gráficos de performance e ferramentas de análise.



\*\*URL Produção:\*\* https://www.diariotraderpro.com.br



---



\## 📋 Índice



1\. \[Arquitetura do Sistema](#-arquitetura-do-sistema)

2\. \[Tecnologias Utilizadas](#-tecnologias-utilizadas)

3\. \[Estrutura de Pastas](#-estrutura-de-pastas)

4\. \[Funcionalidades](#-funcionalidades)

5\. \[Firebase \& Firestore](#-firebase--firestore)

6\. \[Regras de Segurança](#-regras-de-segurança)

7\. \[Autenticação](#-autenticação)

8\. \[Rotas do Sistema](#-rotas-do-sistema)

9\. \[Painel Admin](#-painel-admin)

10\. \[Deploy](#-deploy)

11\. \[Desenvolvimento Local](#-desenvolvimento-local)



---



\## 🏗️ Arquitetura do Sistema



\### Diagrama de Alto Nível



┌─────────────────────────────────────────────────────────┐

│ USUÁRIO FINAL │

└───────────────────┬─────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────┐

│ FIREBASE HOSTING (CDN) │

│ https://www.diariotraderpro.com.br │

└───────────────────┬─────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────┐

│ REACT SPA (Vite) │

│ ┌─────────────┐ ┌──────────────┐ ┌────────────────┐ │

│ │ Sistema │ │ Painel Admin │ │ Autenticação │ │

│ │ Principal │ │ (/admin) │ │ (Firebase) │ │

│ └─────────────┘ └──────────────┘ └────────────────┘ │

└───────────────────┬─────────────────────────────────────┘

│

▼

┌─────────────────────────────────────────────────────────┐

│ FIREBASE SERVICES │

│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │

│ │ Firestore DB │ │ Auth │ │ Storage │ │

│ └──────────────┘ └──────────────┘ └──────────────┘ │

└─────────────────────────────────────────────────────────┘





\### Componentes Principais



\- \*\*Frontend:\*\* React 18 + Vite 5

\- \*\*Backend:\*\* Firebase (Serverless)

\- \*\*Banco de Dados:\*\* Cloud Firestore

\- \*\*Autenticação:\*\* Firebase Authentication

\- \*\*Hospedagem:\*\* Firebase Hosting

\- \*\*Região:\*\* southamerica-east1 (São Paulo)



---



\## 🛠️ Tecnologias Utilizadas



\### Core

\- \*\*React\*\* 18.3.1 - Biblioteca UI

\- \*\*Vite\*\* 5.4.21 - Build tool

\- \*\*React Router DOM\*\* 7.1.1 - Roteamento

\- \*\*Tailwind CSS\*\* 3.4.17 - Estilização



\### Firebase

\- \*\*firebase\*\* 11.1.0 - SDK completo

\- \*\*Firebase Authentication\*\* - Login Google + Email/Senha

\- \*\*Cloud Firestore\*\* - Banco de dados NoSQL

\- \*\*Firebase Hosting\*\* - Hospedagem CDN



\### Gráficos \& Visualização

\- \*\*recharts\*\* 2.15.0 - Gráficos React

\- \*\*react-calendar\*\* 5.1.0 - Calendário interativo



\### Relatórios

\- \*\*jspdf\*\* 2.5.2 - Geração de PDF

\- \*\*jspdf-autotable\*\* 3.8.4 - Tabelas em PDF

\- \*\*xlsx\*\* 0.18.5 - Exportação Excel



\### Utilitários

\- \*\*date-fns\*\* 4.1.0 - Manipulação de datas

\- \*\*dompurify\*\* 3.2.2 - Sanitização HTML



---



\## 📁 Estrutura de Pastas



traderpro-v2/

├── docs/ # 📚 Documentação

│ ├── README.md # Documentação principal

│ ├── ARCHITECTURE.md # Arquitetura detalhada

│ ├── API.md # Documentação da API Firebase

│ └── DEPLOYMENT.md # Guia de deploy

│

├── public/ # Arquivos estáticos

│

├── src/

│ ├── components/ # 🧩 Componentes reutilizáveis

│ │ ├── exports/ # Botões de exportação

│ │ ├── filters/ # Filtros de trades

│ │ ├── icons/ # Ícones SVG

│ │ ├── layout/ # Layout principal

│ │ ├── trades/ # Componentes de trades

│ │ ├── ui/ # Componentes UI base

│ │ ├── AdminPrivateRoute.jsx # Proteção rota admin

│ │ ├── AdminRoute.jsx # Validação admin

│ │ └── ProRoute.jsx # Proteção features PRO

│ │

│ ├── features/ # 🎯 Funcionalidades principais

│ │ ├── admin/ # Painel administrativo

│ │ │ ├── Admin.jsx

│ │ │ └── AdminLogin.jsx

│ │ ├── analytics/ # Análises avançadas

│ │ ├── auth/ # Autenticação

│ │ │ ├── AuthContext.jsx

│ │ │ ├── Login.jsx

│ │ │ ├── Register.jsx

│ │ │ ├── ForgotPassword.jsx

│ │ │ └── PrivateRoute.jsx

│ │ ├── calendar/ # Calendário de trades

│ │ ├── charts/ # Gráficos de performance

│ │ ├── dashboard/ # Dashboard principal

│ │ ├── reports/ # Relatórios

│ │ ├── settings/ # Configurações

│ │ ├── tools/ # Ferramentas auxiliares

│ │ └── trades/ # Gestão de trades

│ │

│ ├── hooks/ # 🪝 Hooks customizados

│ │ └── useTrades.js

│ │

│ ├── services/ # 🔧 Serviços

│ │ ├── auth.js # Serviços de autenticação

│ │ ├── firebase.js # Configuração Firebase

│ │ ├── firestore.js # Operações Firestore

│ │ └── trades.js # Lógica de trades

│ │

│ ├── styles/ # 🎨 Estilos globais

│ │ └── globals.css

│ │

│ ├── utils/ # 🛠️ Utilitários

│ │ ├── exportReports.js # Exportação de relatórios

│ │ └── metrics.js # Cálculos de métricas

│ │

│ ├── App.jsx # Componente raiz

│ ├── main.jsx # Entry point

│ └── routes.jsx # Configuração de rotas

│

├── scripts/ # 📜 Scripts auxiliares

│ └── importUsers.mjs # Importação de usuários

│

├── .env.example # Exemplo de variáveis de ambiente

├── .firebaserc # Configuração Firebase CLI

├── .gitignore # Arquivos ignorados pelo Git

├── firebase.json # Configuração Firebase Hosting

├── firestore.rules # Regras de segurança Firestore

├── index.html # HTML base

├── package.json # Dependências do projeto

├── postcss.config.js # Configuração PostCSS

├── tailwind.config.js # Configuração Tailwind

└── vite.config.js # Configuração Vite





---



\## ⚡ Funcionalidades



\### Sistema Principal (Usuários)



\#### 📊 Dashboard

\- Visão geral de métricas (Win Rate, P\&L, Payoff Ratio)

\- Cards com indicadores principais

\- Resumo de performance do mês



\#### 💹 Trades

\- Cadastro completo de trades

\- Campos: Ativo, Data, P\&L, Comissão, Swap, Estratégia, Observações

\- Edição e exclusão de trades

\- Filtros avançados (data, ativo, estratégia, resultado)

\- Listagem com paginação



\#### 📅 Calendário

\- Visualização de trades por dia

\- Heatmap de performance (verde = lucro, vermelho = prejuízo)

\- Clique no dia para ver detalhes



\#### 📈 Análises (PRO)

\- Gráficos de evolução da banca

\- Análise por ativo

\- Análise por estratégia

\- Distribuição win/loss



\#### 📉 Gráficos (PRO)

\- Gráfico de linha: Evolução do P\&L

\- Gráfico de área: Crescimento acumulado

\- Gráfico de barras: Performance por período



\#### 📄 Relatórios

\- Exportação PDF (PRO) - Relatório completo formatado

\- Exportação Excel - Planilha com todos os dados

\- Exportação CSV - Arquivo de texto separado por vírgulas



\#### ⚙️ Configurações

\- Dados do perfil

\- Preferências do sistema

\- Gerenciamento de conta



\#### 🧮 Ferramentas

\- Calculadora de risco

\- Calculadora de posição

\- Conversor de moedas

\- Simulador de lucro



---



\### Painel Admin



\#### 👥 Gestão de Usuários

\- Listagem completa de usuários

\- Busca por email

\- Filtros: Todos / PRO / Free

\- Estatísticas em tempo real



\#### 👑 Controle de Planos

\- Ativar/Desativar plano PRO

\- Histórico de alterações

\- Data de última atualização



\#### ➕ Adicionar Usuários

\- Cadastro manual de usuários

\- Definição de UID e email



\#### 🗑️ Remover Usuários

\- Exclusão de usuários do sistema

\- Confirmação de segurança



\#### 📊 Estatísticas

\- Total de usuários

\- Usuários PRO

\- Usuários Free

\- Cards visuais com métricas



---



\## 🔥 Firebase \& Firestore



\### Estrutura do Banco de Dados



firestore/

└── artifacts/

└── trade-journal-public/

├── adminUsers/ # Controle de usuários

│ └── {userId}/

│ ├── email: string

│ ├── isPro: boolean

│ ├── displayName: string

│ ├── createdAt: timestamp

│ └── lastLogin: timestamp

│

└── users/ # Dados dos usuários

└── {userId}/

├── email: string

├── isPro: boolean

├── displayName: string

├── photoURL: string

├── createdAt: timestamp

│

└── trades/ # Trades do usuário

└── {tradeId}/

├── asset: string # Ex: "XAUUSD"

├── date: string # "YYYY-MM-DD"

├── type: string # "TRADE"

├── pnl: number # Resultado

├── commission: number # Comissão

├── swap: number # Swap

├── strategy: string # Estratégia usada

├── notes: string # Observações

├── createdAt: timestamp

└── updatedAt: timestamp



text



\### Índices Necessários



\*\*Collection: `artifacts/trade-journal-public/users/{userId}/trades`\*\*

\- `date` ASC

\- `createdAt` DESC

\- `asset` ASC + `date` ASC



---



\## 🔒 Regras de Segurança



O arquivo `firestore.rules` define:



\### Função Admin

function isAdmin() {

return (request.auth.token.admin == true) ||

(request.auth.token.email == 'juniorfray944@gmail.com');

}



text



\### Proteção de Dados

\- ✅ Usuários só acessam seus próprios trades

\- ✅ Admin tem acesso total

\- ✅ Validação de campos obrigatórios

\- ✅ Validação de tipos de dados



---



\## 🔐 Autenticação



\### Métodos Disponíveis



\#### 1. Google Sign-In

\- Login via conta Google

\- Mais rápido e seguro

\- Disponível em ambos os sistemas



\#### 2. Email/Senha

\- Cadastro tradicional

\- Recuperação de senha disponível

\- Validação de email



\### Fluxos de Autenticação



\*\*Sistema Principal:\*\*

/login → Login.jsx → Firebase Auth → Dashboard



text



\*\*Painel Admin:\*\*

/admin/login → AdminLogin.jsx → Validação Email → Painel Admin



text



\### Context API

O `AuthContext.jsx` gerencia:

\- Estado de autenticação

\- Dados do usuário

\- Status PRO

\- Funções de login/logout



---



\## 🛣️ Rotas do Sistema



\### Rotas Públicas

| Rota | Componente | Descrição |

|------|-----------|-----------|

| `/login` | Login.jsx | Login do sistema principal |

| `/cadastro` | Register.jsx | Cadastro de novos usuários |

| `/recuperar-senha` | ForgotPassword.jsx | Recuperação de senha |

| `/admin/login` | AdminLogin.jsx | Login do painel admin |



\### Rotas Privadas (Autenticação Necessária)

| Rota | Componente | Proteção |

|------|-----------|----------|

| `/` | Dashboard.jsx | PrivateRoute |

| `/trades` | TradesPage.jsx | PrivateRoute |

| `/calendar` | Calendar.jsx | PrivateRoute |

| `/analytics` | Analytics.jsx | PrivateRoute + ProRoute |

| `/charts` | Charts.jsx | PrivateRoute + ProRoute |

| `/reports` | Reports.jsx | PrivateRoute |

| `/settings` | Settings.jsx | PrivateRoute |

| `/tools` | Tools.jsx | PrivateRoute |



\### Rota Admin

| Rota | Componente | Proteção |

|------|-----------|----------|

| `/admin` | Admin.jsx | AdminPrivateRoute |



\### Proteções de Rota



\*\*PrivateRoute:\*\*

\- Verifica se usuário está autenticado

\- Redireciona para `/login` se não estiver



\*\*ProRoute:\*\*

\- Verifica se usuário é PRO

\- Mostra tela de upgrade se não for



\*\*AdminPrivateRoute:\*\*

\- Verifica autenticação

\- Valida email `juniorfray944@gmail.com`

\- Redireciona para `/admin/login` ou `/`



---



\## 🔧 Painel Admin



\### Acesso Restrito

\- \*\*Email autorizado:\*\* `juniorfray944@gmail.com`

\- \*\*Rota:\*\* `/admin/login`

\- \*\*Visual:\*\* Tema roxo/roxo-escuro



\### Funcionalidades Administrativas



\#### Gestão de Usuários

// Adicionar usuário

await setDoc(doc(db, 'artifacts/trade-journal-public/adminUsers', userId), {

email,

isPro: false,

addedAt: new Date().toISOString()

})



// Ativar/Desativar PRO

await setDoc(adminRef, { isPro: !currentStatus }, { merge: true })

await setDoc(userRef, { isPro: !currentStatus }, { merge: true })



// Remover usuário

await deleteDoc(doc(db, 'artifacts/trade-journal-public/adminUsers', userId))



text



\#### Estatísticas em Tempo Real

\- Total de usuários

\- Usuários PRO vs Free

\- Atualização automática



\#### Filtros e Busca

\- Busca por email

\- Filtro: Todos / PRO / Free

\- Listagem responsiva



---



\## 🚀 Deploy



\### Pré-requisitos

npm install -g firebase-tools

firebase login



text



\### Build Local

cd C:\\Users\\junio\\Desktop\\traderpro-v2

npm run build



text



\### Deploy para Produção

firebase deploy



text



\### Deploy Específico

Apenas Hosting

firebase deploy --only hosting



Apenas Rules

firebase deploy --only firestore:rules



text



\### Configuração Firebase Hosting

{

"hosting": {

"public": "dist",

"ignore": \["firebase.json", "/.\*", "/node\_modules/"],

"rewrites": \[

{

"source": "",

"destination": "/index.html"

}

]

}

}



text



---



\## 💻 Desenvolvimento Local



\### 1. Instalar Dependências

cd C:\\Users\\junio\\Desktop\\traderpro-v2

npm install



text



\### 2. Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz:

VITE\_FIREBASE\_API\_KEY=your\_api\_key

VITE\_FIREBASE\_AUTH\_DOMAIN=your\_auth\_domain

VITE\_FIREBASE\_PROJECT\_ID=your\_project\_id

VITE\_FIREBASE\_STORAGE\_BUCKET=your\_storage\_bucket

VITE\_FIREBASE\_MESSAGING\_SENDER\_ID=your\_sender\_id

VITE\_FIREBASE\_APP\_ID=your\_app\_id



text



\### 3. Rodar Localmente

npm run dev



text



Acesse: `http://localhost:5173`



\### 4. Build de Produção

npm run build



text



\### 5. Preview do Build

npm run preview



text



---



\## 📦 Scripts Disponíveis



| Comando | Descrição |

|---------|-----------|

| `npm run dev` | Inicia servidor de desenvolvimento |

| `npm run build` | Gera build de produção |

| `npm run preview` | Preview do build localmente |

| `npm run lint` | Verifica código com ESLint |



---



\## 🎨 Tailwind CSS - Classes Customizadas



\### Cores Principais

colors: {

background: '#0a0a0a',

surface: '#111111',

surfaceLight: '#1a1a1a',

primary: '#10b981',

win: '#10b981',

loss: '#ef4444',

accent: '#6366f1'

}



text



\### Classe Glass

.glass {

background: rgba(17, 17, 17, 0.8);

backdrop-filter: blur(10px);

}



text



---



\## 🔄 Fluxo de Dados



\### Criação de Trade

Usuário preenche formulário (TradeForm.jsx)



Submete dados



trades.js → createTrade()



Firestore adiciona documento em users/{uid}/trades



Hook useTrades detecta mudança



UI atualiza automaticamente



text



\### Cálculo de Métricas

trades são carregados do Firestore



utils/metrics.js → calculateMetrics()



Retorna: winRate, payoffRatio, totalPnL, etc



Dashboard exibe com MetricsCard



text



\### Exportação de Relatórios

Usuário clica em "Exportar PDF"



Verifica se é PRO



utils/exportReports.js → exportToPDF()



jsPDF gera documento



Download automático



text



---



\## 🐛 Troubleshooting



\### Problema: Service Worker Caching

\*\*Solução:\*\*

F12 → Application → Service Workers → Unregister



Application → Clear Storage → Clear site data



Ctrl + Shift + R (hard reload)



text



\### Problema: Firebase Rules Negando Acesso

\*\*Solução:\*\*

Verificar firestore.rules



firebase deploy --only firestore:rules



Verificar Authentication no console



text



\### Problema: Build Muito Grande

\*\*Solução:\*\*

\- Chunks estão otimizados

\- PDF e Chart libraries são pesadas (esperado)

\- Considere lazy loading futuro



---



\## 📞 Suporte



\*\*Desenvolvedor:\*\* juniorfray944@gmail.com  

\*\*Sistema:\*\* https://www.diariotraderpro.com.br  

\*\*Repositório:\*\* GitHub (privado)



---



\## 📝 Changelog



\### v2.0.0 (Dezembro 2025)

\- ✅ Sistema de login admin separado

\- ✅ Autenticação Google no admin

\- ✅ Deploy Firebase Hosting

\- ✅ Documentação completa

\- ✅ Firestore rules configuradas

\- ✅ PWA configurado



---



\*\*Última atualização:\*\* 30 de Dezembro de 2025

