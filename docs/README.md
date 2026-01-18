# TraderPro v2 - Documentação Técnica Completa

> **Última atualização:** 04/01/2026  
> **Versão:** 2.0  
> **Status:** Sistema 100% funcional

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Funcionalidades](#funcionalidades)
4. [Arquitetura de Dados](#arquitetura-de-dados)
5. [Componentes Principais](#componentes-principais)
6. [Hooks e Serviços](#hooks-e-serviços)
7. [Sistema de Autenticação](#sistema-de-autenticação)
8. [Deploy e URLs](#deploy-e-urls)
9. [Scripts Úteis](#scripts-úteis)

---

## Visão Geral

**TraderPro v2** é uma plataforma completa de gerenciamento de trades para day traders.

### Principais Diferenciais:
- Diário de trades completo com métricas avançadas
- Sistema de notificações push em tempo real
- Suporte técnico com tickets
- Calendário econômico integrado
- Gráficos e análises detalhadas
- Exportação de relatórios (PDF/CSV)
- Simulador de trades
- Painel Admin separado
- Planos Free e PRO

---

## Estrutura do Projeto

Ver arquivo completo em: `docs/ARQUITETURA_ATUAL.md`

### Principais pastas:
- `src/features/` - Funcionalidades principais
- `src/components/` - Componentes reutilizáveis
- `src/services/` - Serviços Firebase
- `src/hooks/` - Custom hooks
- `docs/` - Documentação completa

---

## Funcionalidades

### Para Usuários (Free e PRO)

1. **Diário de Trades** - Registro completo de operações
2. **Dashboard** - Métricas e gráficos em tempo real
3. **Analytics** - Análises por ativo, estratégia e período
4. **Charts** - Gráficos avançados de performance
5. **Calendar** - Calendário econômico
6. **Reports** - Exportação PDF/CSV
7. **Tools** - Simulador e calculadoras
8. **Notifications** - Sistema de notificações em tempo real
9. **Support** - Sistema de tickets
10. **Settings** - Configurações da conta

### Para Administradores

1. **Gerenciar Usuários** - Ativar/desativar PRO
2. **Notificações** - Criar e gerenciar notificações
3. **Tickets** - Responder suporte

---

## Arquitetura de Dados

### Firestore Database

artifacts/trade-journal-public/
├── adminUsers/ # Controle admin
├── users/ # Dados dos usuários
│ └── {uid}/trades/ # Trades do usuário
├── notifications/ # Notificações
├── userNotifications/ # Status de leitura
└── tickets/ # Sistema de suporte

text

Ver detalhes completos em: `docs/ARQUITETURA_ATUAL.md`

---

## Componentes Principais

### UI Components
- Button, Card, Input, Select, Modal, Loading
- MetricCard, TradeFilters, ExportButtons

### Feature Components
- TradesPage, Dashboard, Analytics, Charts
- NotificationCenter, NotificationPopup
- SupportPage, TicketDetailModal

Ver lista completa em: `docs/ARQUITETURA_ATUAL.md`

---

## Hooks e Serviços

### Hooks
- `useTrades()` - Gerenciamento de trades

### Services
- `auth.js` - Autenticação
- `trades.js` - Operações de trades
- `notifications.js` - Sistema de notificações
- `tickets.js` - Sistema de tickets
- `firebase.js` - Configuração Firebase

Ver documentação completa em: `docs/`

---

## Sistema de Autenticação

Dois sistemas independentes:
- **AuthContext** - Usuários normais
- **AuthContextAdmin** - Administradores

Ver detalhes em: `docs/ARQUITETURA_ATUAL.md`

---

## Deploy e URLs

### URLs de Produção
- **App Principal:** https://meudiariotrade-29864.web.app
- **Painel Admin:** https://meudiariotrade-admin.web.app

### Comandos de Deploy
```bash
# Build
npm run build
npm run build:admin

# Deploy
firebase deploy --only hosting
Scripts Úteis
bash
# Desenvolvimento
npm run dev              # App principal
npm run dev:admin        # Admin

# Build
npm run build           # App principal
npm run build:admin     # Admin

# Preview
npm run preview
Documentação Adicional
ARQUITETURA_ATUAL.md - Arquitetura detalhada

NOTIFICATIONS_SYSTEM.md - Sistema de notificações

TICKETS_SYSTEM.md - Sistema de tickets

CHANGELOG.md - Histórico de mudanças

TROUBLESHOOTING.md - Solução de problemas

ADMIN_DOMAIN_SETUP.md - Setup do domínio admin

AUTH_SEPARATION_ISSUE.md - Separação de autenticação

Status Atual
Data: 04/01/2026
Versão: 2.1.0
Status: Sistema 100% funcional em produção

Desenvolvedor: Junior Fray
Projeto: TraderPro v2


