# Changelog TraderPro

Todas as mudanças notáveis do projeto serão documentadas aqui.

---

## [3.0.0-beta] - 2026-01-15

### ✨ Adicionado
- **Sistema Multi-Mercado**
  - Suporte a B3 Day Trade, B3 Swing, Forex, Opções B3
  - Detecção automática de mercado por ativo
  - Moeda específica por mercado (BRL/USD/EUR)

- **Cálculo Automático de Impostos**
  - Day Trade: 20%
  - Swing Trade: 15%
  - Forex: 15%
  - Armazenamento em objeto taxes

- **Importação Universal**
  - Parser inteligente para Excel/CSV
  - Detecção automática de colunas
  - Suporta qualquer plataforma (MT5, B3, XP, Clear)
  - Preview antes de importar
  - Validação de duplicatas

- **Relatórios v3.0**
  - PDF com 4 páginas incluindo breakdown por mercado
  - Excel com 3 abas (Resumo, Por Mercado, Trades)
  - CSV completo com impostos
  - Resultado líquido em destaque

### 🔧 Modificado
- TradeForm com novos campos v3.0
- ImportMT5Modal com parser universal
- Reports com breakdown financeiro
- Métricas com cálculos de resultado líquido

### 🐛 Corrigido
- Médias de perda calculando incorretamente
- Estratégias não aparecendo nos relatórios
- Total em Perdas mostrando zero
- Tabelas muito largas no PDF

---

## [2.0.0] - 2025-11-XX

### ✨ Inicial
- Sistema de autenticação Firebase
- Dashboard com métricas
- Importação MT5 básica
- Exportação básica
