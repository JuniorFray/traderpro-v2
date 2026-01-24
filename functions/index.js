const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Inicializar Firebase Admin
admin.initializeApp();

// ✅ FUNÇÃO PARA DETECTAR MERCADO (igual ao frontend)
function detectMarket(asset) {
  if (!asset) return 'forex';
  
  // Limpar sufixos
  const clean = asset.toUpperCase()
    .replace(/\.H$/i, '')
    .replace(/\.h$/i, '')
    .trim();
  
  console.log('🔍 [Cloud Function] Detectando mercado para:', clean);
  
  // ✅ PRIORIDADE 1: CRYPTO = FOREX (ANTES DE TUDO!)
  if (clean.match(/^BTC|^ETH|^LTC|^XRP|^DOGE|^ADA|^SOL|^DOT|^MATIC|^AVAX|^LINK/)) {
    console.log('✅ CRYPTO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 2: B3 Futuros (WIN, WDO, etc)
  if (clean.match(/^WIN|^WDO|^IND|^DOL/) || clean.includes('FUT')) {
    console.log('✅ FUTURO B3 detectado:', clean, '→ B3DAYTRADE');
    return 'b3daytrade';
  }
  
  // ✅ PRIORIDADE 3: B3 Ações (4 letras + número)
  if (clean.match(/^[A-Z]{4}\d/)) {
    console.log('✅ AÇÃO B3 detectada:', clean, '→ B3SWING');
    return 'b3swing';
  }
  
  // ✅ PRIORIDADE 4: Metais preciosos
  if (clean.match(/^XAU|^XAG|^GOLD|^SILVER/)) {
    console.log('✅ METAL detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 5: Pares forex clássicos (EURUSD, GBPJPY, etc)
  if (clean.match(/^(EUR|USD|GBP|JPY|AUD|CAD|CHF|NZD)[A-Z]{3}$/)) {
    console.log('✅ PAR FOREX detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 6: Forex genérico (6-8 letras)
  if (clean.match(/^[A-Z]{6,8}$/)) {
    console.log('✅ FOREX GENÉRICO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  console.log('⚠️ Nenhum match, retornando FOREX padrão');
  return 'forex'; // Padrão
}


function detectCurrency(market) {
  const map = { 
    b3daytrade: 'BRL', 
    b3swing: 'BRL', 
    b3options: 'BRL', 
    forex: 'USD'
  };
  return map[market] || 'USD';
}

/**
 * Endpoint para sincronizar trades do MT5
 * POST /sync-mt5
 * Body: { userId, trades: [...] }
 */
exports.syncMT5 = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // Apenas aceitar POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    try {
      const { userId, trades, apiKey } = req.body;

      // Validações básicas
      if (!userId) {
        return res.status(400).json({ error: "userId obrigatório" });
      }

      if (!Array.isArray(trades)) {
        return res.status(400).json({ error: "trades deve ser um array" });
      }

      // TODO: Validar apiKey do usuário
      logger.info("Sincronizando trades para usuário", { userId });

      const db = admin.firestore();
      const batch = db.batch();
      let imported = 0;

      for (const trade of trades) {
        // Validar campos obrigatórios do trade
        if (!trade.ticket || !trade.symbol || !trade.type) {
          logger.warn("Trade inválido (ignorado)", trade);
          continue;
        }

        // ✅ FORÇAR DETECÇÃO DE MERCADO
        let market = trade.market || 'forex';
        
        // ✅ CONVERTER "crypto" → "forex"
        if (market === 'crypto') {
          market = 'forex';
        }
        
        // ✅ SE NÃO VEIO MARKET, DETECTAR PELO ASSET
        if (!trade.market) {
          market = detectMarket(trade.symbol);
        }
        
        // ✅ CURRENCY CORRETO
        const currency = trade.currency || detectCurrency(market);

        // Criar documento do trade
        const tradeRef = db.collection(`artifacts/trade-journal-public/users/${userId}/trades`).doc();
        batch.set(tradeRef, {
          ...trade,
          market,        // ✅ FORÇADO
          currency,      // ✅ FORÇADO
          source: "MT5",
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        imported++;
      }

      // Salvar todos os trades
      await batch.commit();

      logger.info(`${imported} trades sincronizados com sucesso`);

      return res.status(200).json({
        success: true,
        imported: imported,
        total: trades.length,
      });
    } catch (error) {
      logger.error("Erro ao sincronizar trades", error);
      return res.status(500).json({
        error: "Erro ao processar sincronização",
        details: error.message,
      });
    }
  }
);
