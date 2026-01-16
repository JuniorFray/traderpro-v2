# Relatórios TraderPro v3.0

## 📊 Visão Geral

Sistema completo de exportação de dados com suporte a PDF, Excel e CSV, incluindo cálculo automático de impostos e breakdown por mercado.

---

## 📄 Exportação PDF

### Estrutura do Relatório

#### Página 1: Capa e Resumo Executivo
- Header verde com logo TraderPro
- Período do relatório
- Data de geração
- **Resultado Líquido** (destaque principal)
- Cards de métricas:
  - Win Rate
  - Profit Factor
  - Vitórias/Derrotas
  - Maior Ganho/Perda
  - **Impostos** (novo v3.0)
  - **Custos Operacionais** (novo v3.0)

#### Página 2: Breakdown Financeiro
- **Tabela de Breakdown:**
  - Resultado Bruto
  - (-) Corretagem
  - (-) Swap
  - (-) Impostos
  - **(=) Resultado Líquido**
  
- **Métricas Detalhadas:**
  - Total de Trades
  - Win Rate
  - Profit Factor
  - Trades Vencedores/Perdedores
  - Total em Lucros/Perdas
  - Maior Ganho/Perda
  - Média de Ganho/Perda
  - Expectativa

#### Página 3: Desempenho por Mercado
- Tabela com breakdown de cada mercado:
  - Mercado (B3 Day Trade, B3 Swing, Forex, etc)
  - Quantidade de Trades
  - Win Rate específico
  - PnL Bruto
  - Impostos pagos
  - **Resultado Líquido** por mercado

#### Página 4: Histórico Completo
- Tabela detalhada de todos os trades:
  - Data
  - Ativo
  - Mercado
  - Estratégia
  - P&L
  - Impostos
  - **Líquido** (com destaque)

### Características
- ✅ Layout profissional
- ✅ Cores diferenciadas (verde/vermelho)
- ✅ Formatação de moeda brasileira
- ✅ Rodapé com numeração de páginas
- ✅ Otimizado para impressão A4

---

## 📊 Exportação Excel

### Estrutura das Abas

#### Aba 1: Resumo
TraderPro - Relatório de Trading v3.0
Gerado em: [data/hora]

RESUMO GERAL
Total de Trades: 20
Resultado Bruto: R$ 169.500,00
Corretagem: R$ -13.230,00
Swap: R$ -2.720,00
Impostos: R$ -46.385,00
Resultado Líquido: R$ 107.165,00

MÉTRICAS
Win Rate: 0.7000
Profit Factor: 2.86
Vitórias: 14
Derrotas: 6
Maior Ganho: R$ 40.500,00
Maior Perda: R$ -28.000,00
Média de Ganho: R$ 18.600,00
Expectativa: R$ 8.475,00

text

#### Aba 2: Por Mercado
| Mercado | Trades | Win Rate | PnL Bruto | Impostos | Custos | Líquido |
|---------|--------|----------|-----------|----------|--------|---------|
| B3 Day  | 7      | 0.7143   | 93.500    | 29.300   | 5.230  | 58.970  |
| Forex   | 6      | 0.8333   | 68.000    | 11.250   | 3.540  | 53.210  |

#### Aba 3: Trades
| Data | Ativo | Mercado | Estratégia | Qtd | Entrada | Saída | PnL | Corret | Swap | Impostos | Líquido |
|------|-------|---------|------------|-----|---------|-------|-----|--------|------|----------|---------|

### Características
- ✅ Formatação profissional
- ✅ Porcentagens em formato decimal
- ✅ Valores numéricos puros (sem formatação)
- ✅ Compatível com análises em Python/R
- ✅ Fórmulas podem ser adicionadas manualmente

---

## 📋 Exportação CSV

### Estrutura
```csv
Data,Ativo,Mercado,Estratégia,Quantidade,Preço Entrada,Preço Saída,PnL,Corretagem,Swap,Impostos,Taxa Imposto,Líquido
2025-11-15,WINFUT,B3 Day Trade,Scalping,3,125850.50,126120.00,405.00,8.50,2.30,81.00,0.20,313.20
Características
✅ Separador por vírgula

✅ BOM (Byte Order Mark) para UTF-8

✅ Headers em português

✅ Aspas em campos com vírgula

✅ Compatível com Excel/Google Sheets

🔧 Como Usar
Via Interface
Acesse Relatórios no menu

Aplique filtros (opcional)

Clique em Exportar PDF/Excel/CSV

Arquivo será baixado automaticamente

Filtros Disponíveis
Data: Período específico

Ativo: Símbolo do ativo

Estratégia: Nome da estratégia

Resultado: Vencedores/Perdedores/Todos

Mercado: B3 Day/Swing/Forex/Opções

Via Código
javascript
import { exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportReports'
import { calculateMetrics } from '@/utils/metrics'

// PDF
const metrics = calculateMetrics(trades)
exportToPDF(trades, metrics, 'Janeiro 2026')

// Excel
exportToExcel(trades, metrics)

// CSV
exportToCSV(trades)
💡 Dicas
Melhor Formato para Cada Situação
PDF:

📌 Apresentações para clientes

📌 Relatórios fiscais

📌 Documentação oficial

📌 Impressão

Excel:

📌 Análises avançadas

📌 Gráficos personalizados

📌 Cruzamento de dados

📌 Compartilhamento com contador

CSV:

📌 Importação em outras plataformas

📌 Análise em Python/R

📌 Backup de dados

📌 Máxima compatibilidade

🎨 Personalização
Cores do PDF
javascript
// Verde (lucro)
fillColor: 

// Vermelho (prejuízo)
fillColor: 

// Cinza (neutro)
fillColor: 
Layout
Margens: 14mm

Fonte: Helvetica

Tamanho padrão: 10-12pt

Headers: 16-18pt

🐛 Troubleshooting
PDF não baixa
Verifique se tem trades no período

Limpe o cache do navegador

Verifique console (F12) para erros

Excel abre com caracteres estranhos
Abra via "Dados → De Texto/CSV"

Selecione encoding UTF-8

OU use Google Sheets (detecta automaticamente)

CSV com valores errados
Verifique separador regional do Windows

Use ponto (.) para decimais

Não use vírgula em campos de texto

📈 Estatísticas
Limites
PDF: Até 500 trades por arquivo

Excel: Até 1.000.000 linhas

CSV: Sem limite (depende da RAM)

Performance
PDF 50 trades: ~3s

Excel 100 trades: ~1s

CSV 1000 trades: ~2s

Versão: 3.0.0
Última atualização: 15/01/2026
Autor: TraderPro Team
