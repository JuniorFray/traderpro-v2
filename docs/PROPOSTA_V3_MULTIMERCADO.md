# 🚀 TraderPro v3.0 - Sistema Híbrido Multi-Mercado

**Versão:** 3.0.0  
**Data:** 05/01/2026  
**Status:** Proposta Aprovada  
**Custo Total:** R$ 0,00/mês (APIs gratuitas)

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Objetivos](#objetivos)
3. [Mercados Suportados](#mercados-suportados)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [Fases de Implementação](#fases-de-implementação)
6. [Sistema de Impostos](#sistema-de-impostos)
7. [Conversão de Moedas](#conversão-de-moedas)
8. [Interface e UX](#interface-e-ux)
9. [Cronograma](#cronograma)
10. [Próximos Passos](#próximos-passos)

---

## 🎯 VISÃO GERAL

O TraderPro v3.0 será uma evolução para um sistema híbrido que suporta múltiplos mercados (Forex e B3), multi-moeda (USD, BRL, EUR), com cálculo automático de impostos e relatórios fiscais completos.

### Diferenciais da v3.0:
- ✅ Multi-mercado (Forex + B3)
- ✅ Multi-moeda com conversão automática
- ✅ Cálculo de impostos por categoria
- ✅ Relatórios fiscais (DARF, IRPF)
- ✅ Dashboards separados por mercado
- ✅ **Aba exclusiva para impostos** (privacidade para prints)
- ✅ Manutenção do design atual
- ✅ **Custo zero** com APIs gratuitas

---

## 🎯 OBJETIVOS

### Objetivo Principal:
Criar uma ferramenta única que atenda traders de **Forex** e **B3**, oferecendo visão estratégica consolidada sem perder a identidade visual atual.

### Objetivos Específicos:
1. Suportar operações em USD (Forex) e BRL (B3)
2. Calcular impostos automaticamente por categoria
3. Gerar relatórios fiscais (DARF) prontos para pagamento
4. Manter privacidade fiscal (impostos em aba separada)
5. Permitir conversão visual entre BRL ↔ USD

---

## 💼 MERCADOS SUPORTADOS

### 1. **Forex (Mercado Internacional)**
- **Moedas:** USD, EUR, GBP, JPY, etc
- **Impostos:** 15% trimestral sobre ganho de capital
- **Características:** Alavancagem, 24h, liquidez alta

### 2. **B3 Day Trade (Bovespa)**
- **Ativos:** Mini-índice, Mini-dólar, Ações
- **Moeda:** BRL
- **Impostos:** 20% mensal sobre lucro líquido
- **Características:** Abertura e fechamento no mesmo dia

### 3. **B3 Swing Trade**
- **Ativos:** Ações, FIIs
- **Moeda:** BRL
- **Impostos:** 15% mensal (isento até R$ 20.000)
- **Características:** Posições mantidas por dias/semanas

### 4. **B3 Opções**
- **Ativos:** Calls, Puts
- **Moeda:** BRL
- **Impostos:** 15% mensal (isento até R$ 20.000)
- **Características:** Derivativos com vencimento

---

## 🏗️ ARQUITETURA TÉCNICA

### Nova Estrutura de Trade (Firestore)

\`\`\`javascript
// Modelo de Trade v3.0
{
  // Campos atuais (mantidos)
  asset: "PETR4",
  date: "2026-01-05",
  pnl: 150.00,
  strategy: "Scalping",
  notes: "Trade perfeito",
  userId: "abc123",

  // NOVOS CAMPOS v3.0
  market: "b3_day_trade", // b3_day_trade | b3_swing | forex | b3_options
  currency: "BRL", // BRL | USD | EUR

  // Detalhes da operação
  quantity: 100,
  entryPrice: 28.50,
  exitPrice: 30.00,
  entryTime: "09:15:00",
  exitTime: "16:45:00",

  // Custos
  fees: 5.00,
  feesCurrency: "BRL",

  // Conversão automática
  exchangeRate: 5.45, // Taxa USD/BRL do dia
  pnlBRL: 150.00, // PnL em reais
  pnlUSD: 27.52, // PnL em dólar

  // Impostos (calculado automaticamente)
  taxes: {
    rate: 0.20, // 20% (day trade)
    amount: 30.00, // R$ 30,00
    category: "day_trade_b3",
    dueDate: "2026-02-28",
    isPaid: false
  },

  // Metadata
  createdAt: "2026-01-05T10:30:00Z",
  updatedAt: "2026-01-05T10:30:00Z"
}
\`\`\`

### Configurações de Usuário

\`\`\`javascript
// artifacts/trade-journal-public/users/{userId}/config/preferences
{
  defaultCurrency: "BRL", // Moeda padrão de exibição
  markets: ["b3_day_trade", "forex"], // Mercados que opera
  taxCountry: "BR", // País para cálculos fiscais
  taxId: "123.456.789-00", // CPF/CNPJ
  timezone: "America/Sao_Paulo",

  // Preferências de exibição
  showTaxAlerts: true,
  dashboardView: "consolidated", // consolidated | by_market
}
\`\`\`

---

## 📊 FASES DE IMPLEMENTAÇÃO

### **FASE 1: Estrutura Base (2 semanas)**

#### Tarefas:
- [x] Atualizar modelo de Trade no Firestore
- [x] Criar migration script para trades existentes
- [x] Atualizar TradeForm com novos campos
- [x] Adicionar seletor de mercado
- [x] Implementar campos de quantidade, preços, taxas

#### Entregáveis:
- Novo modelo de dados
- Form de cadastro completo
- Migration dos trades atuais

---

### **FASE 2: Dashboard Multi-Mercado (1 semana)**

#### Layout do Menu:

\`\`\`
📊 Dashboard (Geral - todos os mercados)
  └─ [R$ BRL] [$ USD] <-- Toggle de moeda

💰 Mercados (Novo submenu)
  ├─ 🇧🇷 B3 Day Trade
  ├─ 📈 B3 Swing
  ├─ 🌎 Forex
  └─ 📉 Opções

📋 Trades (existente)
📅 Calendário (existente)
📊 Análises (existente)
📈 Gráficos (existente)
📄 Relatórios (existente)

💵 IMPOSTOS (NOVA ABA - SEPARADA)
  ├─ Cálculo Mensal
  ├─ DARF Gerador
  ├─ Histórico de Pagamentos
  └─ Auxiliar IRPF

⚙️ Configurações (existente)
🛠️ Ferramentas (existente)
\`\`\`

#### Dashboard Geral (Consolidado):

\`\`\`
┌─────────────────────────────────────────────────────┐
│  📊 TraderPro v3.0         [R$ BRL] [$ USD]    👤   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Lucro BRL  │ │ Lucro USD  │ │ Líquido    │      │
│  │ R$ 5.200   │ │ $ 952      │ │ R$ 4.000   │      │
│  │ +12.5% ↑   │ │ +12.5% ↑   │ │ -23% tax   │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                     │
│  📊 Performance por Mercado                         │
│  ┌─────────────────────────────────────────────┐   │
│  │  Day Trade B3: R$ 2.400 (46%)              │   │
│  │  Swing B3:     R$ 1.200 (23%)              │   │
│  │  Forex:        $ 320 / R$ 1.600 (31%)      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📈 Gráfico de Evolução Patrimonial                │
│  [Gráfico de linhas com múltiplas séries]         │
│                                                     │
│  🏆 Top 5 Trades do Mês                            │
│  1. PETR4 - Day Trade - R$ 450 ⭐                  │
│  2. EUR/USD - Forex - $ 85 / R$ 463                │
│  ...                                                │
└─────────────────────────────────────────────────────┘
\`\`\`

#### Dashboard Específico (Ex: B3 Day Trade):

\`\`\`
┌─────────────────────────────────────────────────────┐
│  🇧🇷 B3 - Day Trade                                  │
├─────────────────────────────────────────────────────┤
│  Janeiro/2026                                       │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Lucro      │ │ Win Rate   │ │ Trades     │      │
│  │ R$ 2.400   │ │ 68%        │ │ 45         │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                     │
│  📊 Distribuição por Ativo                         │
│  [Gráfico de pizza]                                │
│  PETR4: 35% | VALE3: 25% | WINFUT: 40%             │
│                                                     │
│  📈 Evolução do Mês                                │
│  [Gráfico de área]                                 │
│                                                     │
│  📋 Últimos Trades                                 │
│  [Tabela filtrada apenas day trade B3]            │
└─────────────────────────────────────────────────────┘
\`\`\`

#### Entregáveis:
- Sistema de tabs por mercado
- Dashboard consolidado
- Dashboards específicos
- Toggle BRL/USD global

---

### **FASE 3: Sistema de Impostos (2 semanas)**

#### 3.1 - Regras de Cálculo

\`\`\`javascript
// src/utils/taxes.js

export const TAX_RULES = {
  b3_day_trade: {
    name: "B3 Day Trade",
    rate: 0.20, // 20%
    type: 'monthly',
    exemptionLimit: 0, // Sem isenção
    dueDay: 'last_business_day_next_month',
    darfCode: '6015',
    description: 'IR 20% sobre lucro líquido mensal de day trade'
  },

  b3_swing: {
    name: "B3 Swing Trade",
    rate: 0.15, // 15%
    type: 'monthly',
    exemptionLimit: 20000, // Isento até R$ 20.000/mês em vendas
    dueDay: 'last_business_day_next_month',
    darfCode: '3317',
    description: 'IR 15% sobre lucro (isento se vendas < R$ 20k/mês)'
  },

  forex: {
    name: "Forex",
    rate: 0.15, // 15%
    type: 'quarterly',
    exemptionLimit: 0,
    dueMonth: [3, 6, 9, 12], // Trimestral
    dueDay: 31,
    darfCode: '8523',
    description: 'IR 15% trimestral sobre ganho de capital'
  },

  b3_options: {
    name: "Opções B3",
    rate: 0.15, // 15%
    type: 'monthly',
    exemptionLimit: 20000,
    dueDay: 'last_business_day_next_month',
    darfCode: '3317',
    description: 'IR 15% sobre lucro (isento se vendas < R$ 20k/mês)'
  }
}

// Função principal de cálculo
export const calculateMonthlyTaxes = (trades, month, year) => {
  const tradesByMarket = groupBy(
    trades.filter(t => {
      const tradeDate = new Date(t.date)
      return tradeDate.getMonth() + 1 === month && 
             tradeDate.getFullYear() === year
    }),
    'market'
  )

  return Object.entries(tradesByMarket).map(([market, marketTrades]) => {
    const rule = TAX_RULES[market]
    const totalPnL = sumPnL(marketTrades, 'BRL')
    const totalFees = sumFees(marketTrades, 'BRL')
    const netPnL = totalPnL - totalFees

    // Aplicar isenção se houver
    let taxableAmount = netPnL
    if (rule.exemptionLimit > 0) {
      const totalSales = calculateTotalSales(marketTrades)
      if (totalSales <= rule.exemptionLimit) {
        taxableAmount = 0 // Isento
      }
    }

    const taxAmount = taxableAmount > 0 ? taxableAmount * rule.rate : 0

    return {
      market,
      marketName: rule.name,
      totalPnL,
      totalFees,
      netPnL,
      taxableAmount,
      taxAmount,
      taxRate: rule.rate * 100,
      dueDate: calculateDueDate(rule, month, year),
      darfCode: rule.darfCode,
      description: rule.description,
      isExempt: taxableAmount === 0 && netPnL > 0,
      trades: marketTrades.length
    }
  })
}
\`\`\`

#### 3.2 - Componente de Alertas (Dashboard Principal)

\`\`\`jsx
// src/components/TaxAlertWidget.jsx

export const TaxAlertWidget = () => {
  const { trades } = useTrades()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const taxes = calculateMonthlyTaxes(trades, currentMonth, currentYear)
  const totalTax = taxes.reduce((sum, t) => sum + t.taxAmount, 0)

  if (totalTax === 0) return null

  return (
    <Card className="bg-yellow-500/10 border-yellow-500/30">
      <div className="flex items-center gap-3">
        <span className="text-3xl">💰</span>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-300">
            Impostos Estimados - {currentMonth}/{currentYear}
          </h3>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(totalTax)} BRL
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {taxes.filter(t => t.taxAmount > 0).length} mercados com impostos devidos
          </p>
        </div>
        <Button 
          onClick={() => navigate('/impostos')}
          className="bg-yellow-500 text-black"
        >
          Ver Detalhes →
        </Button>
      </div>
    </Card>
  )
}
\`\`\`

#### 3.3 - Página de Impostos (Nova Aba Separada)

\`\`\`jsx
// src/features/taxes/TaxesPage.jsx

export const TaxesPage = () => {
  const { trades } = useTrades()
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const taxes = calculateMonthlyTaxes(trades, selectedMonth, selectedYear)
  const totalTax = taxes.reduce((sum, t) => sum + t.taxAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">💵 Impostos e Declarações</h2>
        <p className="text-zinc-400">
          Cálculos automáticos baseados na legislação brasileira vigente
        </p>
      </div>

      {/* Alerta de privacidade */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-bold text-purple-300">Privacidade Garantida</h4>
            <p className="text-sm text-zinc-400">
              Esta aba é exclusiva para cálculos fiscais. 
              Use o Dashboard para prints e compartilhamentos públicos.
            </p>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <div className="flex gap-4">
        <Select label="Mês" value={selectedMonth} onChange={setSelectedMonth}>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
        <Select label="Ano" value={selectedYear} onChange={setSelectedYear}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>

      {/* Resumo Geral */}
      <Card>
        <h3 className="text-lg font-bold mb-4">Resumo - {selectedMonth}/{selectedYear}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-zinc-400">Lucro Bruto Total</p>
            <p className="text-2xl font-bold text-win">
              {formatCurrency(taxes.reduce((s, t) => s + t.totalPnL, 0))} BRL
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Taxas/Corretagens</p>
            <p className="text-2xl font-bold text-zinc-300">
              {formatCurrency(taxes.reduce((s, t) => s + t.totalFees, 0))} BRL
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Impostos Devidos</p>
            <p className="text-2xl font-bold text-yellow-300">
              {formatCurrency(totalTax)} BRL
            </p>
          </div>
        </div>
      </Card>

      {/* Detalhamento por Mercado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {taxes.map(tax => (
          <Card key={tax.market} className={tax.taxAmount > 0 ? 'border-yellow-500/30' : ''}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-white">{tax.marketName}</h4>
                <p className="text-xs text-zinc-400">{tax.description}</p>
              </div>
              {tax.isExempt && (
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                  Isento
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Lucro Bruto:</span>
                <span className="text-white">{formatCurrency(tax.totalPnL)} BRL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Taxas:</span>
                <span className="text-white">-{formatCurrency(tax.totalFees)} BRL</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400">Lucro Líquido:</span>
                <span className="text-white">{formatCurrency(tax.netPnL)} BRL</span>
              </div>

              {!tax.isExempt && (
                <>
                  <div className="border-t border-zinc-700 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Alíquota:</span>
                    <span className="text-white">{tax.taxRate}%</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-yellow-300 font-bold">Imposto:</span>
                    <span className="text-yellow-300 font-bold">
                      {formatCurrency(tax.taxAmount)} BRL
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Vencimento:</span>
                    <span className="text-white">{tax.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Código DARF:</span>
                    <span className="text-white">{tax.darfCode}</span>
                  </div>
                </>
              )}

              <div className="text-xs text-zinc-500 mt-2">
                {tax.trades} trades neste período
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Botões de Exportação */}
      {totalTax > 0 && (
        <Card className="bg-zinc-800">
          <h3 className="font-bold mb-4">Gerar Documentos</h3>
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={() => generateDARFPDF(taxes, selectedMonth, selectedYear)}>
              📄 DARF (PDF)
            </Button>
            <Button onClick={() => generateTaxExcel(taxes, selectedMonth, selectedYear)}>
              📊 Relatório Excel
            </Button>
            <Button onClick={() => generateIRPFHelper(trades, selectedYear)}>
              📋 Auxiliar IRPF
            </Button>
          </div>
        </Card>
      )}

      {/* Avisos Legais */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <div className="flex gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-zinc-400 space-y-2">
            <p className="font-bold text-blue-300">Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Os cálculos são estimativas baseadas na legislação atual</li>
              <li>Consulte um contador para validação final</li>
              <li>Prazos de vencimento consideram dias úteis</li>
              <li>Day Trade: 20% sobre lucro líquido mensal</li>
              <li>Swing Trade: 15% (isento se vendas < R$ 20k/mês)</li>
              <li>Forex: 15% trimestral sobre ganho de capital</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
\`\`\`

#### Entregáveis:
- Sistema de cálculo de impostos
- Página de impostos completa (aba separada)
- Widget de alerta no dashboard
- Geração de DARF em PDF

---

### **FASE 4: Conversão de Moedas (1 semana)**

#### 4.1 - Estratégia Híbrida Gratuita

\`\`\`javascript
// src/services/exchangeRate.js

// ===== API 1: Banco Central do Brasil (USD/BRL oficial) =====
export const getBacenRate = async (date) => {
  try {
    // Formato esperado: '05-01-2026' (DD-MM-YYYY)
    const formattedDate = date.split('-').reverse().join('-')

    const url = \`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='\${formattedDate}'&$format=json\`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.value || data.value.length === 0) {
      throw new Error('Taxa não disponível para esta data')
    }

    return {
      date,
      buy: data.value[0].cotacaoCompra,
      sell: data.value[0].cotacaoVenda,
      avg: (data.value[0].cotacaoCompra + data.value[0].cotacaoVenda) / 2,
      source: 'BCB'
    }
  } catch (error) {
    console.error('Erro ao buscar taxa Bacen:', error)
    return null
  }
}

// ===== API 2: Fawazahmed0 (Multi-moeda gratuita) =====
export const getFreeExchangeRate = async (from = 'usd', to = 'brl') => {
  try {
    const url = \`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/\${from.toLowerCase()}.json\`

    const response = await fetch(url)
    const data = await response.json()

    return {
      date: data.date,
      rate: data[from.toLowerCase()][to.toLowerCase()],
      source: 'Fawazahmed0'
    }
  } catch (error) {
    console.error('Erro ao buscar taxa gratuita:', error)
    return null
  }
}

// ===== Sistema de Cache (24h) =====
const rateCache = new Map()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

const getCacheKey = (from, to, date) => \`\${from}_\${to}_\${date}\`

const saveToCache = (key, data) => {
  rateCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

const getFromCache = (key) => {
  const cached = rateCache.get(key)
  if (!cached) return null

  // Verificar se expirou
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    rateCache.delete(key)
    return null
  }

  return cached.data
}

// ===== Função Principal (com fallback automático) =====
export const getExchangeRate = async (from, to, date = new Date().toISOString().split('T')[0]) => {
  // 1. Verificar cache
  const cacheKey = getCacheKey(from, to, date)
  const cached = getFromCache(cacheKey)
  if (cached) {
    console.log(\`📦 Taxa \${from}/\${to} do cache\`)
    return cached
  }

  // 2. Se for USD/BRL, tentar Banco Central primeiro (oficial)
  if (from === 'USD' && to === 'BRL') {
    const bacenRate = await getBacenRate(date)
    if (bacenRate) {
      saveToCache(cacheKey, bacenRate.avg)
      console.log(\`🏛️ Taxa USD/BRL do Banco Central: \${bacenRate.avg}\`)
      return bacenRate.avg
    }
  }

  // 3. Fallback: API gratuita multi-moeda
  const freeRate = await getFreeExchangeRate(from.toLowerCase(), to.toLowerCase())
  if (freeRate) {
    saveToCache(cacheKey, freeRate.rate)
    console.log(\`🌐 Taxa \${from}/\${to} de API gratuita: \${freeRate.rate}\`)
    return freeRate.rate
  }

  // 4. Se tudo falhar, retornar taxa padrão (última conhecida)
  console.warn(\`⚠️ Usando taxa padrão para \${from}/\${to}\`)
  return from === 'USD' && to === 'BRL' ? 5.45 : 1.0
}

// ===== Função de Conversão =====
export const convertCurrency = async (amount, from, to, date) => {
  if (from === to) return amount

  const rate = await getExchangeRate(from, to, date)
  return amount * rate
}

// ===== Hook para componentes React =====
export const useExchangeRate = (from, to) => {
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true)
      const r = await getExchangeRate(from, to)
      setRate(r)
      setLoading(false)
    }

    fetchRate()
  }, [from, to])

  return { rate, loading }
}
\`\`\`

#### 4.2 - Conversão Automática nos Trades

\`\`\`javascript
// src/hooks/useTrades.js (atualizado)

const createTrade = async (tradeData) => {
  const userId = auth.currentUser.uid

  // Obter taxa de câmbio do dia
  let exchangeRate = 1.0
  let pnlBRL = tradeData.pnl
  let pnlUSD = tradeData.pnl

  if (tradeData.currency === 'USD') {
    exchangeRate = await getExchangeRate('USD', 'BRL', tradeData.date)
    pnlBRL = tradeData.pnl * exchangeRate
    pnlUSD = tradeData.pnl
  } else if (tradeData.currency === 'BRL') {
    exchangeRate = await getExchangeRate('USD', 'BRL', tradeData.date)
    pnlBRL = tradeData.pnl
    pnlUSD = tradeData.pnl / exchangeRate
  }

  // Calcular impostos
  const taxInfo = calculateTaxForTrade(tradeData.market, pnlBRL, tradeData.date)

  const trade = {
    ...tradeData,
    userId,
    exchangeRate,
    pnlBRL,
    pnlUSD,
    taxes: taxInfo,
    createdAt: new Date().toISOString()
  }

  await addDoc(collection(db, \`artifacts/trade-journal-public/users/\${userId}/trades\`), trade)
}
\`\`\`

#### Entregáveis:
- Sistema de conversão de moedas
- Cache de 24h
- APIs gratuitas integradas
- Conversão automática no cadastro

---

### **FASE 5: Form de Trade Atualizado (1 semana)**

\`\`\`jsx
// src/features/trades/TradeForm.jsx (v3.0)

export const TradeForm = ({ editingTrade, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Campos obrigatórios
    market: 'b3_day_trade',
    currency: 'BRL',
    asset: '',
    date: new Date().toISOString().split('T')[0],

    // Detalhes da operação
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    entryTime: '',
    exitTime: '',

    // Custos
    fees: 0,

    // Outros
    strategy: '',
    notes: ''
  })

  // Auto-definir moeda baseado no mercado
  useEffect(() => {
    const currency = formData.market === 'forex' ? 'USD' : 'BRL'
    setFormData(prev => ({ ...prev, currency }))
  }, [formData.market])

  // Calcular PnL automaticamente
  const pnl = useMemo(() => {
    const qty = parseFloat(formData.quantity) || 0
    const entry = parseFloat(formData.entryPrice) || 0
    const exit = parseFloat(formData.exitPrice) || 0
    const fees = parseFloat(formData.fees) || 0

    const gross = (exit - entry) * qty
    return gross - fees
  }, [formData.quantity, formData.entryPrice, formData.exitPrice, formData.fees])

  // Buscar taxa de câmbio se USD
  const { rate: exchangeRate } = useExchangeRate('USD', 'BRL')
  const pnlBRL = formData.currency === 'USD' && exchangeRate ? pnl * exchangeRate : pnl

  // Calcular imposto estimado
  const taxEstimate = useMemo(() => {
    if (pnl <= 0) return 0
    const rule = TAX_RULES[formData.market]
    return pnlBRL * rule.rate
  }, [pnl, pnlBRL, formData.market])

  return (
    <Card>
      <h3 className="text-lg font-bold mb-4">
        {editingTrade ? '✏️ Editar Trade' : '➕ Novo Trade'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mercado */}
        <Select
          label="Mercado"
          value={formData.market}
          onChange={(e) => setFormData({ ...formData, market: e.target.value })}
          required
        >
          <option value="b3_day_trade">🇧🇷 B3 - Day Trade</option>
          <option value="b3_swing">📈 B3 - Swing Trade</option>
          <option value="forex">🌎 Forex</option>
          <option value="b3_options">📉 B3 - Opções</option>
        </Select>

        {/* Moeda (auto-preenchida) */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-zinc-400">Moeda</label>
            <div className="mt-1 px-4 py-2 bg-zinc-800 rounded-lg text-white">
              {formData.currency === 'USD' ? '$ USD' : 'R$ BRL'}
            </div>
          </div>

          {/* Data */}
          <div className="flex-1">
            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Ativo */}
        <Input
          label="Ativo"
          placeholder="Ex: PETR4, WIN, EUR/USD"
          value={formData.asset}
          onChange={(e) => setFormData({ ...formData, asset: e.target.value.toUpperCase() })}
          required
        />

        {/* Detalhes da Operação */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            step="1"
            placeholder="100"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />

          <Input
            label="Preço de Entrada"
            type="number"
            step="0.01"
            placeholder="28.50"
            value={formData.entryPrice}
            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
            required
          />

          <Input
            label="Preço de Saída"
            type="number"
            step="0.01"
            placeholder="30.00"
            value={formData.exitPrice}
            onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
            required
          />

          <Input
            label="Taxas/Corretagem"
            type="number"
            step="0.01"
            placeholder="5.00"
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
          />
        </div>

        {/* Horários (opcional) */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Horário de Entrada (opcional)"
            type="time"
            value={formData.entryTime}
            onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
          />

          <Input
            label="Horário de Saída (opcional)"
            type="time"
            value={formData.exitTime}
            onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
          />
        </div>

        {/* Estratégia e Notas */}
        <Input
          label="Estratégia (opcional)"
          placeholder="Scalping, Breakout, etc"
          value={formData.strategy}
          onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
        />

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Notas (opcional)</label>
          <textarea
            className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-white"
            rows="3"
            placeholder="Anotações sobre o trade..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Resumo do Trade */}
        <Card className="bg-zinc-800 border-zinc-700">
          <h4 className="font-bold mb-3">📊 Resumo do Trade</h4>

          <div className="space-y-2">
            {/* PnL */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Resultado:</span>
              <span className={\`text-2xl font-bold \${pnl > 0 ? 'text-win' : pnl < 0 ? 'text-loss' : 'text-zinc-400'}\`}>
                {formatCurrency(pnl)} {formData.currency}
              </span>
            </div>

            {/* Conversão USD → BRL */}
            {formData.currency === 'USD' && exchangeRate && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Equivalente em BRL:</span>
                <span className="text-zinc-300">
                  ≈ {formatCurrency(pnlBRL)} BRL
                  <span className="text-xs text-zinc-500 ml-2">
                    (Taxa: {exchangeRate.toFixed(2)})
                  </span>
                </span>
              </div>
            )}

            {/* Imposto Estimado */}
            {pnl > 0 && (
              <>
                <div className="border-t border-zinc-700 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Imposto Estimado:</span>
                  <span className="text-yellow-400 font-bold">
                    {formatCurrency(taxEstimate)} BRL
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Alíquota:</span>
                  <span className="text-zinc-400">
                    {(TAX_RULES[formData.market].rate * 100).toFixed(0)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Botões */}
        <div className="flex gap-3">
          <Button type="button" onClick={onCancel} variant="secondary" className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {editingTrade ? 'Salvar Alterações' : 'Adicionar Trade'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
\`\`\`

#### Entregáveis:
- Form completo com novos campos
- Cálculo automático de PnL
- Conversão USD → BRL em tempo real
- Estimativa de impostos
- Validações e UX melhorada

---

### **FASE 6: Relatórios Atualizados (1 semana)**

#### Exportação DARF (PDF)

\`\`\`javascript
// src/utils/exportDARF.js

import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateDARFPDF = (taxes, month, year, user) => {
  const doc = new jsPDF()

  // Cabeçalho
  doc.setFontSize(18)
  doc.text('DARF - Documento de Arrecadação', 20, 20)
  doc.text('de Receitas Federais', 20, 28)

  doc.setFontSize(10)
  doc.text(\`Período de Apuração: \${month.toString().padStart(2, '0')}/\${year}\`, 20, 40)

  // Dados do Contribuinte
  doc.setFontSize(12)
  doc.text('Dados do Contribuinte', 20, 55)
  doc.setFontSize(10)
  doc.text(\`Nome: \${user.name || user.email}\`, 20, 65)
  doc.text(\`CPF/CNPJ: \${user.taxId || 'Não informado'}\`, 20, 72)

  // Tabela de Impostos
  const tableData = taxes
    .filter(t => t.taxAmount > 0)
    .map(t => [
      t.marketName,
      t.darfCode,
      \`R$ \${t.taxableAmount.toFixed(2)}\`,
      \`\${t.taxRate.toFixed(0)}%\`,
      \`R$ \${t.taxAmount.toFixed(2)}\`,
      t.dueDate
    ])

  doc.autoTable({
    startY: 85,
    head: [['Mercado', 'Código', 'Base Cálculo', 'Alíquota', 'Valor', 'Vencimento']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] }
  })

  // Total
  const totalTax = taxes.reduce((sum, t) => sum + t.taxAmount, 0)
  const finalY = doc.lastAutoTable.finalY + 10

  doc.setFontSize(14)
  doc.text(\`Total a Pagar: R$ \${totalTax.toFixed(2)}\`, 20, finalY)

  // Avisos
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Este documento é apenas uma estimativa. Consulte um contador para validação.', 20, finalY + 15)
  doc.text(\`Gerado em: \${new Date().toLocaleString('pt-BR')}\`, 20, finalY + 20)

  // Salvar
  doc.save(\`DARF_\${month.toString().padStart(2, '0')}_\${year}.pdf\`)
}
\`\`\`

#### Entregáveis:
- Geração de DARF em PDF
- Relatório Excel com impostos
- Auxiliar IRPF

---

### **FASE 7: Testes e Deploy (1 semana)**

#### Checklist de Testes:

- [ ] Cadastro de trade em todos os mercados
- [ ] Conversão USD ↔ BRL funcionando
- [ ] Cálculo de impostos correto
- [ ] Dashboard consolidado exibindo dados
- [ ] Dashboards específicos por mercado
- [ ] Aba de impostos separada
- [ ] Toggle BRL/USD global
- [ ] Exportação de relatórios
- [ ] Geração de DARF
- [ ] Responsividade mobile
- [ ] Performance (cache funcionando)

---

## 🎨 INTERFACE E UX

### Princípios de Design:

1. **Sem mudanças visuais drásticas**
   - Manter paleta atual: zinc-900, emerald-500, red-500
   - Manter tipografia e espaçamento
   - Componentes UI atuais (Card, Button, Input)

2. **Adições sutis**
   - Badges de moeda (🇧🇷 BRL, $ USD)
   - Toggle BRL/USD no header
   - Nova aba "💵 Impostos" no menu
   - Alertas amarelos para impostos

3. **Privacidade em primeiro lugar**
   - Impostos em aba separada
   - Dashboard "limpo" para prints
   - Alerta discreto de impostos devidos

---

## 📅 CRONOGRAMA COMPLETO

| Fase | Duração | Início | Término |
|------|---------|--------|---------|
| **Fase 1: Estrutura Base** | 2 semanas | Semana 1 | Semana 2 |
| **Fase 2: Dashboard Multi-Mercado** | 1 semana | Semana 3 | Semana 3 |
| **Fase 3: Sistema de Impostos** | 2 semanas | Semana 4 | Semana 5 |
| **Fase 4: Conversão de Moedas** | 1 semana | Semana 6 | Semana 6 |
| **Fase 5: Form Atualizado** | 1 semana | Semana 7 | Semana 7 |
| **Fase 6: Relatórios** | 1 semana | Semana 8 | Semana 8 |
| **Fase 7: Testes e Deploy** | 1 semana | Semana 9 | Semana 9 |
| **Buffer (imprevistos)** | 1 semana | Semana 10 | Semana 10 |

**Total:** 10 semanas (~2,5 meses)

---

## 💰 ORÇAMENTO FINAL

### Desenvolvimento:
- 400 horas × R$ 100/hora = **R$ 40.000**

### APIs (Custo Zero):
- ✅ Banco Central Brasil: **Gratuita** (USD/BRL oficial)
- ✅ Fawazahmed0: **Gratuita ilimitada** (multi-moeda)
- ✅ Backup: ExchangeRate-API **Gratuita** (1.500 req/mês)

### Infraestrutura (Sem mudanças):
- Firebase Firestore: Plano atual
- Firebase Hosting: Plano atual
- Firebase Authentication: Plano atual

**CUSTO TOTAL MENSAL:** **R$ 0,00** 🎉

---

## 🚀 PRÓXIMOS PASSOS

### Imediatos:

1. **Aprovação da proposta** ✅
2. **Definir data de início**
3. **Criar branch `feature/v3.0-multi-market`**
4. **Iniciar Fase 1: Estrutura Base**

### Primeira Entrega (Semana 2):

- Modelo de Trade v3.0 implementado
- Migration de trades existentes
- Form atualizado funcionando
- Testes com dados reais

### Segunda Entrega (Semana 5):

- Dashboard multi-mercado completo
- Sistema de impostos funcionando
- Aba de impostos separada

### Entrega Final (Semana 9):

- Sistema completo em produção
- Documentação atualizada
- Treinamento para uso

---

## 📞 CONTATO E SUPORTE

Para dúvidas durante a implementação:
- **Email:** [seu-email]
- **GitHub:** [repositório]
- **Documentação:** `/docs/`

---

## 📄 ANEXOS

### A. Legislação Tributária (Resumo)

**Day Trade:**
- Alíquota: 20%
- Base: Lucro líquido mensal
- Vencimento: Último dia útil do mês seguinte
- DARF: Código 6015

**Swing Trade:**
- Alíquota: 15%
- Base: Lucro líquido mensal
- Isenção: Vendas < R$ 20.000/mês
- Vencimento: Último dia útil do mês seguinte
- DARF: Código 3317

**Forex:**
- Alíquota: 15%
- Base: Ganho de capital trimestral
- Vencimento: Último dia do mês (março, junho, setembro, dezembro)
- DARF: Código 8523

### B. APIs Utilizadas

1. **Banco Central do Brasil**
   - URL: https://olinda.bcb.gov.br
   - Custo: Gratuito
   - Limite: Ilimitado
   - Uso: USD/BRL oficial

2. **Fawazahmed0 Currency API**
   - URL: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api
   - Custo: Gratuito
   - Limite: Ilimitado
   - Uso: Multi-moeda

### C. Glossário

- **B3:** Bolsa de Valores brasileira (Brasil, Bolsa, Balcão)
- **DARF:** Documento de Arrecadação de Receitas Federais
- **Day Trade:** Operação iniciada e encerrada no mesmo dia
- **Forex:** Foreign Exchange (mercado de câmbio)
- **IRPF:** Imposto de Renda Pessoa Física
- **PnL:** Profit and Loss (lucro e prejuízo)
- **PTAX:** Taxa de câmbio oficial do Banco Central
- **Swing Trade:** Operação mantida por dias/semanas

---

**Documento criado em:** 05/01/2026  
**Última atualização:** 05/01/2026  
**Versão:** 1.0  
**Status:** ✅ Aprovado para implementação

---

**TraderPro v3.0 - Sua jornada de trading, nossa tecnologia.** 🚀
