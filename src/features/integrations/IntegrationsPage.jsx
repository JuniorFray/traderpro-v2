import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { db } from '../../services/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export const IntegrationsPage = () => {
  const { user } = useAuth()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingToken, setLoadingToken] = useState(true)

  // Carregar token existente ao montar componente
  useEffect(() => {
    loadExistingToken()
  }, [user])

  const loadExistingToken = async () => {
    if (!user) return
    
    try {
      const tokenDoc = await getDoc(doc(db, 'artifacts/trade-journal-public/apiTokens', user.uid))
      
      if (tokenDoc.exists()) {
        setApiToken(tokenDoc.data().token)
      }
    } catch (error) {
      console.error('Erro ao carregar token:', error)
    } finally {
      setLoadingToken(false)
    }
  }

  const generateApiToken = async () => {
    setLoading(true)
    try {
      // Gera token aleatório seguro
      const token = `tpk_${user.uid.slice(0, 8)}_${crypto.randomUUID()}`
      
      // Salva no Firestore
      await setDoc(doc(db, 'artifacts/trade-journal-public/apiTokens', user.uid), {
        token,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        active: true
      })
      
      setApiToken(token)
      alert('✅ Token gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar token:', error)
      alert('❌ Erro ao gerar token: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('📋 Copiado para área de transferência!')
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
        <h2 className="text-2xl font-bold text-white">🔗 Integração MT5</h2>
        <p className="text-zinc-400 mt-1">Configure a sincronização automática de trades</p>
      </div>

      {/* Card: API Token */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">🔑 Token de Acesso</h3>
        
        {!apiToken ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Você precisa gerar um token de acesso para conectar o MT5 ao TraderPro.
            </p>
            <Button
              onClick={generateApiToken}
              disabled={loading}
            >
              {loading ? 'Gerando...' : '🔓 Gerar Token de Acesso'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-500 mb-2">Seu Token:</p>
              <code className="text-primary text-sm break-all font-mono">
                {apiToken}
              </code>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(apiToken)}
              >
                📋 Copiar Token
              </Button>
              <Button
                variant="outline"
                onClick={generateApiToken}
                className="hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400"
              >
                🔄 Regenerar Token
              </Button>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-yellow-300">
                ⚠️ <strong>Importante:</strong> Nunca compartilhe seu token! 
                Ele dá acesso total aos seus trades.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Card: Credenciais para MT5 */}
      {apiToken && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">📊 Credenciais para MT5</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">User ID:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={user.uid}
                  readOnly
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(user.uid)}
                >
                  📋
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-2">API Token:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiToken}
                  readOnly
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(apiToken)}
                >
                  📋
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Card: Instruções */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">📖 Como Configurar</h3>
        <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm">
          <li>Gere seu Token de Acesso no card acima</li>
          <li>Baixe o Expert Advisor <code className="bg-zinc-800 px-2 py-1 rounded">TraderProSync.mq5</code> (em breve)</li>
          <li>Cole o arquivo na pasta <code className="bg-zinc-800 px-2 py-1 rounded">MQL5/Experts</code> do MT5</li>
          <li>Compile o EA no MetaEditor</li>
          <li>Arraste o EA para qualquer gráfico no MT5</li>
          <li>Cole suas credenciais (User ID e API Token) nos inputs</li>
          <li>Ative "AutoTrading" no MT5 e pronto! ✅</li>
        </ol>
      </Card>

      {/* Card: Status */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">📡 Status da Integração</h3>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${apiToken ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
          <span className="text-zinc-300">
            {apiToken ? '✅ Token configurado - Pronto para sincronizar' : '⚪ Aguardando configuração'}
          </span>
        </div>
      </Card>
    </div>
  )
}
