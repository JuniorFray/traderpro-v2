const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");


// Inicializar Firebase Admin
admin.initializeApp();


/**
 * Endpoint para sincronizar trades do MT5
 * POST /sync-mt5
 * Body: { userId, trades: [...] }
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
    const {userId, trades, apiKey} = req.body;


    // Validações básicas
    if (!userId) {
      return res.status(400).json({error: "userId é obrigatório"});
    }


    if (!Array.isArray(trades)) {
      return res.status(400).json({error: "trades deve ser um array"});
    }


    // TODO: Validar apiKey do usuário
    logger.info("Sincronizando trades para usuário");


    const db = admin.firestore();
    const batch = db.batch();
    let imported = 0;


    for (const trade of trades) {
      // Validar campos obrigatórios do trade
      if (!trade.ticket || !trade.symbol || !trade.type) {
        logger.warn("Trade inválido ignorado:", trade);
        continue;
      }


      // Criar documento do trade
      const tradeRef = db.collection(`users/${userId}/trades`).doc();
      batch.set(tradeRef, {
        ...trade,
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
    logger.error("Erro ao sincronizar trades:", error);
    return res.status(500).json({
      error: "Erro ao processar sincronização",
      details: error.message,
    });
  }
});
