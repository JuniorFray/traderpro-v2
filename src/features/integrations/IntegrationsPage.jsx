import { useState, useEffect } from "react"
import { useAuth } from "../auth/AuthContext"
import { db } from "../../services/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"

export const IntegrationsPage = () => {
  const { user } = useAuth()
  const [apiToken, setApiToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingToken, setLoadingToken] = useState(true)

  // Carregar token existente ao montar componente
  useEffect(() => {
    loadExistingToken()
  }, [user])

  const loadExistingToken = async () => {
    if (!user) return

    try {
      const tokenDoc = await getDoc(doc(db, "artifacts/trade-journal-public/apiTokens", user.uid))

      if (tokenDoc.exists()) {
        setApiToken(tokenDoc.data().token)
      }
    } catch (error) {
      console.error("Erro ao carregar token", error)
    } finally {
      setLoadingToken(false)
    }
  }

  const generateApiToken = async () => {
    if (apiToken && !window.confirm("⚠️ Gerar nova chave irá invalidar a anterior. Deseja continuar?")) {
      return
    }

    setLoading(true)
    try {
      // Gera token aleatório seguro
      const token = `tp_${user.uid.slice(0, 8)}_${crypto.randomUUID()}`

      // Salva no Firestore
      await setDoc(doc(db, "artifacts/trade-journal-public/apiTokens", user.uid), {
        token,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        active: true
      })

      setApiToken(token)
      alert("✅ Token gerado com sucesso!")
    } catch (error) {
      console.error("Erro ao gerar token", error)
      alert("❌ Erro ao gerar token: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("📋 Copiado para área de transferência!")
  }

  if (loadingToken) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">🔗 Integrações</h2>
        <p className="text-zinc-400 mt-1">Configure a sincronização automática com MT5</p>
      </div>

      {/* 🔑 Card API Token - TEMA ESCURO */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔑</span>
          <h3 className="text-lg font-bold text-white">API Key para MT5</h3>
        </div>

        <p className="text-sm text-zinc-400 mb-6">
          Use esta chave no Expert Advisor do MetaTrader 5 para sincronizar seus trades automaticamente.
        </p>

        {!apiToken ? (
          <div className="space-y-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-sm text-zinc-300">
                ⚠️ Você precisa gerar um token de acesso para conectar o MT5 ao TraderPro.
              </p>
            </div>
            <Button
              onClick={generateApiToken}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
            >
              {loading ? "Gerando..." : "🔐 Gerar Nova Chave"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Token Display */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-zinc-300">Sua API Key</label>
                <button
                  onClick={() => copyToClipboard(apiToken)}
                  className="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
              <input
                type="text"
                value={apiToken}
                readOnly
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm font-mono"
              />
            </div>

            {/* User ID */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-zinc-300">User ID</label>
                <button
                  onClick={() => copyToClipboard(user.uid)}
                  className="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
              <input
                type="text"
                value={user.uid}
                readOnly
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white text-sm font-mono"
              />
            </div>

            {/* ✨ BOTÃO PARA REGENERAR */}
            <Button
              onClick={generateApiToken}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
            >
              {loading ? "Gerando..." : "🔄 Gerar Nova Chave"}
            </Button>
          </div>
        )}
      </Card>

      {/* 📖 Card Instruções */}
      <Card className="bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-bold text-white mb-4">📖 Como usar</h3>
        
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="flex gap-3">
            <span className="text-primary font-bold">1.</span>
            <span>Copie a API Key acima</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">2.</span>
            <span>Abra o MetaTrader 5</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">3.</span>
            <span>Instale o Expert Advisor "TraderPro Sync"</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">4.</span>
            <span>Cole a API Key no campo de configuração</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">5.</span>
            <span>Seus trades serão sincronizados automaticamente!</span>
          </div>
        </div>
      </Card>

      {/* ✅ Card Status */}
      <Card className="bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-bold text-white mb-4">📊 Status da Integração</h3>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${apiToken ? "bg-green-500" : "bg-zinc-600"}`}></div>
          <span className="text-zinc-300">
            {apiToken ? "✅ Token configurado - Pronto para sincronizar" : "⏳ Aguardando configuração"}
          </span>
        </div>
      </Card>
    </div>
  )
}
