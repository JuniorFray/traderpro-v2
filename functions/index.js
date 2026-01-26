const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Inicializar Firebase Admin
admin.initializeApp();

// ✅ FUNÇÃO PARA DETECTAR MERCADO (MELHORADA)
function detectMarket(asset) {
  if (!asset) {
    logger.warn("⚠️ Asset vazio, retornando forex padrão");
    return 'forex';
  }
  
  // Limpar sufixos e normalizar
  const clean = String(asset)
    .toUpperCase()
    .replace(/\.H$/i, '')
    .replace(/\.HI$/i, '')
    .replace(/\s+/g, '')  // Remove espaços
    .trim();
  
  logger.info('🔍 [detectMarket] Asset original:', asset, '→ Limpo:', clean);
  
  // ✅ PRIORIDADE 1: METAIS PRECIOSOS (XAU, XAG = FOREX)
  if (clean.match(/XAU|GOLD|XAG|SILVER/)) {
    logger.info('✅ METAL PRECIOSO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 2: CRYPTO (BTC, ETH = FOREX)
  if (clean.match(/^BTC|^ETH|^LTC|^XRP|^DOGE|^ADA|^SOL|^DOT|^MATIC|^AVAX|^LINK/)) {
    logger.info('✅ CRYPTO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 3: B3 Futuros (WIN, WDO, IND, DOL)
  if (clean.match(/^WIN|^WDO|^IND|^DOL/) || clean.includes('FUT')) {
    logger.info('✅ FUTURO B3 detectado:', clean, '→ B3DAYTRADE');
    return 'b3daytrade';
  }
  
  // ✅ PRIORIDADE 4: B3 Ações (4 letras + número, ex: PETR4)
  if (clean.match(/^[A-Z]{4}\d$/)) {
    logger.info('✅ AÇÃO B3 detectada:', clean, '→ B3SWING');
    return 'b3swing';
  }
  
  // ✅ PRIORIDADE 5: Pares forex clássicos (EURUSD, GBPJPY, etc)
  if (clean.match(/^(EUR|GBP|AUD|NZD|USD|CAD|CHF|JPY)[A-Z]{3}$/)) {
    logger.info('✅ PAR FOREX detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 6: Forex genérico (6-8 letras)
  if (clean.match(/^[A-Z]{6,8}$/)) {
    logger.info('✅ FOREX GENÉRICO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  logger.warn('⚠️ [detectMarket] Nenhum padrão identificado para:', clean, '→ Retornando FOREX padrão');
  return 'forex'; // Padrão seguro
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
 * POST /syncMT5
 * Body: { apiKey, trades: [...] }
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
      const { trades, apiKey } = req.body;

      // ✅ VALIDAR API KEY PRIMEIRO
      if (!apiKey) {
        logger.warn("❌ API Key não fornecida");
        return res.status(400).json({ error: "apiKey obrigatória" });
      }

      if (!Array.isArray(trades)) {
        logger.warn("❌ Trades não é um array");
        return res.status(400).json({ error: "trades deve ser um array" });
      }

      if (trades.length === 0) {
        logger.warn("❌ Array de trades vazio");
        return res.status(400).json({ error: "Nenhum trade para sincronizar" });
      }

      // ✅ BUSCAR USERID PELA API KEY
      const db = admin.firestore();
      
      logger.info("🔍 Buscando usuário com API Key:", apiKey.substring(0, 10) + "...");
      
      const usersSnapshot = await db
        .collection("artifacts/trade-journal-public/users")
        .where("apiKey", "==", apiKey)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        logger.warn("❌ API Key inválida:", apiKey.substring(0, 10) + "...");
        return res.status(401).json({ error: "API Key inválida" });
      }

      const userId = usersSnapshot.docs[0].id;
      logger.info("✅ Usuário encontrado:", userId);

      // ✅ PROCESSAR TRADES
      const batch = db.batch();
      let imported = 0;
      let skipped = 0;

      for (const trade of trades) {
        // Validar campos obrigatórios do trade
        if (!trade.ticket || !trade.symbol || !trade.type) {
          logger.warn("⚠️ Trade inválido ignorado (faltam campos):", {
            ticket: trade.ticket,
            symbol: trade.symbol,
            type: trade.type
          });
          skipped++;
          continue;
        }

        // ✅ LIMPAR SUFIXO .h DO SYMBOL
        const cleanSymbol = trade.symbol
          .replace(/\.h$/i, "")
          .replace(/\.hi$/i, "")
          .trim();
        
        logger.info("📊 Processando trade:", {
          ticket: trade.ticket,
          symbolOriginal: trade.symbol,
          symbolLimpo: cleanSymbol,
          marketEnviadoPeloEA: trade.market || 'não enviado'
        });

        // ✅✅✅ SEMPRE DETECTAR, IGNORAR O EA ✅✅✅
        const market = detectMarket(cleanSymbol);
        
        logger.info("🎯 Mercado detectado pela Cloud Function:", {
          asset: cleanSymbol,
          marketDetectado: market,
          marketIgnoradoDoEA: trade.market || 'nenhum'
        });

        // ✅ DETECTAR MOEDA BASEADO NO MERCADO CORRETO
        const currency = detectCurrency(market);

        logger.info("💰 Moeda definida:", {
          market: market,
          currency: currency
        });

        // ✅ MAPEAMENTO EXPLÍCITO MT5 → TRADERPRO V3.0
        const tradeData = {
          // ✅ CAMPOS OBRIGATÓRIOS TRADERPRO
          asset: cleanSymbol,                    // symbol → asset (SEM .h)
          date: trade.date || new Date().toISOString().split("T")[0],
          market: market,                        // ✅ SEMPRE DETECTADO, NUNCA DO EA
          currency: currency,
          
          // ✅ OPERAÇÃO
          type: trade.type,                      // BUY ou SELL
          quantity: trade.quantity || 0,
          entryPrice: trade.entryPrice || 0,
          exitPrice: trade.exitPrice || 0,
          
          // ✅ RESULTADO
          pnl: trade.pnl || 0,
          commission: trade.commission || 0,
          swap: trade.swap || 0,
          
          // ✅ METADATA MT5
          ticket: String(trade.ticket),          // Garantir que é string
          source: "MT5",
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // ✅ CAMPOS OPCIONAIS
          strategy: trade.strategy || "",
          notes: trade.notes || `Sincronizado do MT5 - Ticket ${trade.ticket}`,
        };

        logger.info("✅ Trade mapeado (dados finais que serão salvos):", {
          asset: tradeData.asset,
          market: tradeData.market,
          currency: tradeData.currency,
          type: tradeData.type,
          pnl: tradeData.pnl,
          ticket: tradeData.ticket
        });

        // ✅ VERIFICAR DUPLICATA POR TICKET
        const existingTradeQuery = await db
          .collection(`artifacts/trade-journal-public/users/${userId}/trades`)
          .where("ticket", "==", String(trade.ticket))
          .limit(1)
          .get();

        if (!existingTradeQuery.empty) {
          logger.warn("⚠️ Trade duplicado ignorado (ticket já existe):", trade.ticket);
          skipped++;
          continue;
        }

        // ✅ CRIAR DOCUMENTO DO TRADE
        const tradeRef = db.collection(`artifacts/trade-journal-public/users/${userId}/trades`).doc();
        batch.set(tradeRef, tradeData);

        imported++;
      }

      // ✅ SALVAR TODOS OS TRADES
      if (imported > 0) {
        await batch.commit();
        logger.info(`✅ ${imported} trades sincronizados com sucesso`);
      } else {
        logger.warn("⚠️ Nenhum trade foi importado");
      }

      return res.status(200).json({
        success: true,
        imported: imported,
        skipped: skipped,
        total: trades.length,
        message: `${imported} trades sincronizados, ${skipped} ignorados`
      });

    } catch (error) {
      logger.error("❌ Erro ao sincronizar trades:", error);
      return res.status(500).json({
        error: "Erro ao processar sincronização",
        details: error.message,
      });
    }
  }
);
