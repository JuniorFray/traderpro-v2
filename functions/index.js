const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Inicializar Firebase Admin
admin.initializeApp();

/**
 * Endpoint para sincronizar trades do MT5
 * POST /syncMT5
 * Body: { apiKey, trades: [...] }
 */
exports.syncMT5 = onRequest({
  cors: true,
  maxInstances: 10,
}, async (req, res) => {
  // Apenas aceitar POST
  if (req.method !== "POST") {
    return res.status(405).json({error: "Método não permitido"});
  }

  try {
    const {apiKey, trades} = req.body;

    // Validações básicas
    if (!apiKey) {
      return res.status(400).json({error: "apiKey é obrigatório"});
    }

    if (!Array.isArray(trades)) {
      return res.status(400).json({error: "trades deve ser um array"});
    }

    logger.info("Validando API Key...");

    // Buscar usuário pela API Key
    const db = admin.firestore();
    const usersRef = db.collection("artifacts").doc("trade-journal-public").collection("users");
    const querySnapshot = await usersRef.where("apiKey", "==", apiKey).limit(1).get();

    if (querySnapshot.empty) {
      logger.warn("API Key inválida:", apiKey);
      return res.status(401).json({error: "API Key inválida"});
    }

    // Pegar userId do documento encontrado
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    logger.info(`API Key válida. Sincronizando trades para usuário: ${userId}`);

    const batch = db.batch();
    let imported = 0;
    const duplicates = [];

    for (const trade of trades) {
      // Validar campos obrigatórios do trade
      if (!trade.ticket || !trade.symbol || !trade.type) {
        logger.warn("Trade inválido ignorado:", trade);
        continue;
      }

      // Verificar se trade já existe (evitar duplicatas)
      const existingTradeQuery = await db
        .collection("artifacts")
        .doc("trade-journal-public")
        .collection("users")
        .doc(userId)
        .collection("trades")
        .where("mt5Ticket", "==", trade.ticket)
        .limit(1)
        .get();

      if (!existingTradeQuery.empty) {
        duplicates.push(trade.ticket);
        logger.info(`Trade duplicado ignorado: ${trade.ticket}`);
        continue;
      }

      // Criar documento do trade
      const tradeRef = db
        .collection("artifacts")
        .doc("trade-journal-public")
        .collection("users")
        .doc(userId)
        .collection("trades")
        .doc();
        
      batch.set(tradeRef, {
        // Campos do MT5
        mt5Ticket: trade.ticket,
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice || 0,
        exitPrice: trade.exitPrice || 0,
        quantity: trade.quantity || 0,
        pnl: trade.pnl || 0,
        commission: trade.commission || 0,
        swap: trade.swap || 0,
        
        // Campos padrão TraderPro
        asset: trade.symbol,
        market: trade.market || "forex",
        currency: trade.currency || "USD",
        date: trade.date || new Date().toISOString().split("T")[0],
        strategy: trade.strategy || "",
        notes: trade.notes || "Sincronizado do MT5",
        
        // Metadados
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
      duplicates: duplicates.length,
      message: `${imported} trades importados com sucesso`,
    });
  } catch (error) {
    logger.error("Erro ao sincronizar trades:", error);
    return res.status(500).json({
      error: "Erro ao processar sincronização",
      details: error.message,
    });
  }
});
