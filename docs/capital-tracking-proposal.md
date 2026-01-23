# 💰 Proposta: Rastreamento de Capital e Transações

**Data:** 22/01/2026  
**Status:** Proposta  
**Prioridade:** Alta

---

## 📋 Problema Identificado

Atualmente o TraderPro não possui:
- **Saldo inicial** configurável
- **Controle de depósitos/saques**
- **Visão do saldo atual** (inicial + P&L + transações)
- **Onboarding** para novos usuários definirem capital inicial
- **Histórico de transações** (entradas e saídas de capital)

---

## 🎯 Objetivo

Implementar sistema completo de gerenciamento de capital que permita ao usuário:
1. Definir saldo inicial ao criar conta
2. Registrar depósitos e saques
3. Visualizar saldo atual calculado dinamicamente
4. Importar histórico de trades com saldo já existente
5. Acompanhar evolução do capital ao longo do tempo

---

## 📊 Estrutura de Dados (Firestore)

### Coleção: `users/{userId}/account`
```javascript
{
  initialBalance: 10000,      // Saldo inicial
  currency: "USD",            // Moeda da conta
  createdAt: "2026-01-22",    // Data de criação
  updatedAt: "2026-01-22"     // Última atualização
}
```

### Coleção: `users/{userId}/transactions`
```javascript
{
  id: "tx_123",
  type: "deposit" | "withdrawal", // Tipo de transação
  amount: 5000,                    // Valor
  currency: "USD",                 // Moeda
  date: "2026-01-22",              // Data da transação
  description: "Depósito mensal",  // Descrição (opcional)
  createdAt: timestamp             // Timestamp de criação
}
```

---

## 🧮 Fórmula de Cálculo

```
Saldo Atual = Saldo Inicial 
            + Σ(Depósitos) 
            - Σ(Saques) 
            + Σ(P&L dos Trades)
```

**Detalhamento:**
- **Saldo Inicial:** Definido pelo usuário
- **Depósitos:** Soma de todas transações tipo "deposit"
- **Saques:** Soma de todas transações tipo "withdrawal"
- **P&L Total:** Soma do netProfit de todos os trades

---

## 🎨 Opções de Interface

### **OPÇÃO A: Card no Dashboard Principal**

```
┌─────────────────────────────────────┐
│ 💰 Sua Conta                        │
│                                     │
│ Saldo Atual:  $ 45,320.50          │
│ Saldo Inicial: $ 10,000.00         │
│ P&L Total:     $ +32,500.00        │
│ Depósitos:     $ +5,000.00         │
│ Saques:        $ -2,179.50         │
│                                     │
│ [💵 Depósito] [💸 Saque]           │
└─────────────────────────────────────┘
```

**Vantagens:**
- ✅ Sempre visível
- ✅ Acesso rápido para transações
- ✅ Visão imediata do capital

**Desvantagens:**
- ❌ Ocupa espaço no dashboard
- ❌ Pode sobrecarregar visualmente

---

### **OPÇÃO B: Nova Página "Conta" no Menu**

```
Navegação:
- Dashboard
- Trades
- Mercados
- 💰 Conta (NOVO)
- Impostos
- Relatórios
```

**Vantagens:**
- ✅ Espaço dedicado para detalhes
- ✅ Não polui o dashboard
- ✅ Permite gráficos e análises

**Desvantagens:**
- ❌ Menos visível
- ❌ Requer clique extra

---

### **OPÇÃO C: Híbrida (Recomendada)**

**Dashboard:**
```
┌──────────────────────────────┐
│ 💰 Saldo: $ 45,320.50       │
│ P&L: +$32,500 (+45.2%)      │
└──────────────────────────────┘
```

**Página "Conta":**
- Detalhamento completo
- Histórico de transações
- Gráficos de evolução
- Gerenciamento de depósitos/saques

---

## 🚀 Fluxo de Onboarding

### **Novo Usuário (Sem Trades)**

1. **Login pela primeira vez**
2. **Modal aparece:**
   ```
   ┌─────────────────────────────────┐
   │ 👋 Bem-vindo ao TraderPro!      │
   │                                 │
   │ Para começar, informe seu       │
   │ saldo inicial:                  │
   │                                 │
   │ Moeda: [USD ▼]                 │
   │ Valor: [$ 10,000.00]           │
   │                                 │
   │ [Começar] →                     │
   └─────────────────────────────────┘
   ```
3. **Redireciona para Dashboard**

---

### **Usuário com Histórico**

1. **Login pela primeira vez**
2. **Modal aparece:**
   ```
   ┌─────────────────────────────────┐
   │ 👋 Bem-vindo ao TraderPro!      │
   │                                 │
   │ Você já tinha um histórico de   │
   │ trades antes? Informe seu saldo │
   │ inicial ANTES dos trades:       │
   │                                 │
   │ Moeda: [USD ▼]                 │
   │ Valor: [$ 10,000.00]           │
   │                                 │
   │ ☑️ Tenho histórico para importar│
   │                                 │
   │ [Continuar] →                   │
   └─────────────────────────────────┘
   ```
3. **Se marcou checkbox:**
   - Redireciona para página de Trades
   - Exibe instrução de importação
4. **Saldo é ajustado automaticamente** após importação

---

## 📝 Interface de Transações

```
┌─────────────────────────────────────┐
│ 📝 Nova Transação                   │
│                                     │
│ Tipo:                               │
│ (•) 💵 Depósito  ( ) 💸 Saque      │
│                                     │
│ Valor:    [$ 5,000.00]             │
│ Data:     [22/01/2026]             │
│ Nota:     [Aporte mensal]          │
│           (opcional)                │
│                                     │
│ [Cancelar]  [💰 Salvar]            │
└─────────────────────────────────────┘
```

---

## 📊 Histórico de Transações

```
┌──────────────────────────────────────────────────┐
│ 📜 Histórico de Transações                       │
├──────────────────────────────────────────────────┤
│ Data       │ Tipo      │ Valor       │ Nota     │
├──────────────────────────────────────────────────┤
│ 22/01/2026 │ 💵 Depósito│ +$ 5,000.00│ Mensal   │
│ 15/01/2026 │ 💸 Saque   │ -$ 2,179.50│ IOF      │
│ 01/01/2026 │ 💵 Depósito│ +$10,000.00│ Inicial  │
└──────────────────────────────────────────────────┘
```

**Funcionalidades:**
- ✏️ Editar transação
- 🗑️ Excluir transação
- 📥 Exportar histórico (CSV)
- 🔍 Filtrar por tipo/período

---

## 🔧 Componentes a Criar

### 1. **AccountSetupModal.jsx**
- Modal de onboarding
- Captura saldo inicial
- Opção de importar histórico

### 2. **AccountCard.jsx**
- Card resumido para Dashboard
- Exibe saldo atual
- Botões de ação rápida

### 3. **AccountPage.jsx**
- Página completa de conta
- Gráficos de evolução
- Gerenciamento de transações

### 4. **TransactionModal.jsx**
- Modal para adicionar/editar transação
- Validação de valores
- Seleção de data

### 5. **TransactionHistory.jsx**
- Tabela de histórico
- Filtros e ordenação
- Ações de edição/exclusão

---

## 🎯 Decisões Pendentes

### 1. **Localização da Interface**
- [ ] A) Card no Dashboard (sempre visível)
- [ ] B) Página "Conta" no menu (dedicada)
- [ ] C) Híbrida (card + página detalhada) ⭐

### 2. **Onboarding**
- [ ] A) Modal obrigatório (primeiro login)
- [ ] B) Banner opcional (pode pular) ⭐
- [ ] C) Nenhum (usuário configura depois)

### 3. **Histórico de Transações**
- [ ] A) Tabela completa com CRUD ⭐
- [ ] B) Lista simples (view-only)
- [ ] C) Apenas resumo numérico

### 4. **Multi-moeda**
- [ ] A) Contas separadas (USD + BRL)
- [ ] B) Conta única com conversão ⭐
- [ ] C) Multi-moeda completa (USD/BRL/EUR)

### 5. **Gráficos de Evolução**
- [ ] A) Gráfico de linha (saldo ao longo do tempo) ⭐
- [ ] B) Gráfico de barras (depósitos vs saques)
- [ ] C) Ambos
- [ ] D) Nenhum (apenas números)

---

## 📅 Roadmap Sugerido

### **Fase 1: MVP** (1-2 dias)
- ✅ Estrutura Firestore
- ✅ AccountSetupModal (onboarding)
- ✅ Salvar saldo inicial
- ✅ Cálculo básico de saldo atual
- ✅ Exibição no Dashboard

### **Fase 2: Transações** (2-3 dias)
- ✅ TransactionModal
- ✅ CRUD de depósitos/saques
- ✅ TransactionHistory
- ✅ Atualização automática do saldo

### **Fase 3: Visualizações** (2-3 dias)
- ✅ AccountPage completa
- ✅ Gráfico de evolução
- ✅ Análises estatísticas
- ✅ Exportação CSV

### **Fase 4: Refinamentos** (1-2 dias)
- ✅ Multi-moeda
- ✅ Validações avançadas
- ✅ Responsividade mobile
- ✅ Testes e ajustes

---

## 🔗 Referências

- [Firestore Collections](https://firebase.google.com/docs/firestore/data-model)
- [React Modal Best Practices](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Financial Dashboard UX](https://www.nngroup.com/articles/financial-services-design/)

---

## 📝 Notas Adicionais

- Considerar adicionar **categorias de transações** (aporte, IOF, taxa de corretagem, etc.)
- Implementar **alertas de saldo baixo**
- Opção de **meta de capital** (ex: chegar a $50k)
- **Histórico de alterações** (audit log) para transparência
- **Backup automático** de transações críticas

---

**Criado em:** 22/01/2026  
**Última atualização:** 22/01/2026  
**Responsável:** Junior Fray
