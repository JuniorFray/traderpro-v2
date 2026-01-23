import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useTrades } from '../../hooks/useTrades'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { AccountSetupModal } from '../../components/onboarding/AccountSetupModal'
import { TransactionModal } from '../../components/account/TransactionModal'
import {
  getUserAccount,
  setupAccount,
  getUserTransactions,
  addTransaction,
  deleteTransaction,
  calculateCurrentBalance
} from '../../services/account'

export const CapitalPage = () => {
  const { user } = useAuth()
  const { trades } = useTrades()
  const [loading, setLoading] = useState(true)
  const [accountData, setAccountData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [savingSetup, setSavingSetup] = useState(false)
  const [savingTransaction, setSavingTransaction] = useState(false)

  useEffect(() => {
    if (user) {
      loadAccountData()
    }
  }, [user])

  const loadAccountData = async () => {
    try {
      setLoading(true)
      const accountResult = await getUserAccount(user.uid)
      const transactionsResult = await getUserTransactions(user.uid)

      setAccountData(accountResult.data)
      setTransactions(transactionsResult.data || [])

      if (!accountResult.data) {
        setShowSetupModal(true)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupAccount = async (formData) => {
    try {
      setSavingSetup(true)
      const result = await setupAccount(user.uid, formData)

      if (result.success) {
        setAccountData(result.data)
        setShowSetupModal(false)
        alert('Conta configurada com sucesso!')
      } else {
        alert('Erro ao configurar conta: ' + result.error)
      }
    } catch (error) {
      alert('Erro ao configurar conta')
      console.error(error)
    } finally {
      setSavingSetup(false)
    }
  }

  const handleAddTransaction = async (formData) => {
    try {
      setSavingTransaction(true)
      const result = await addTransaction(user.uid, formData)

      if (result.success) {
        await loadAccountData()
        setShowTransactionModal(false)
        alert('Transacao adicionada!')
      } else {
        alert('Erro: ' + result.error)
      }
    } catch (error) {
      alert('Erro ao adicionar transacao')
      console.error(error)
    } finally {
      setSavingTransaction(false)
    }
  }

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Deseja excluir?')) return

    try {
      const result = await deleteTransaction(user.uid, transactionId)
      if (result.success) {
        await loadAccountData()
        alert('Transacao excluida!')
      }
    } catch (error) {
      console.error(error)
    }
  }

  // ✅ CORREÇÃO: Incluir comissões e swaps no cálculo do PnL
  const totalPnL = trades.reduce((sum, trade) => {
    const pnl = parseFloat(trade.pnl) || 0
    const commission = parseFloat(trade.commission) || 0
    const swap = parseFloat(trade.swap) || 0
    return sum + pnl + commission + swap
  }, 0)

  const balanceData = accountData ? calculateCurrentBalance(accountData, transactions, totalPnL) : null

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: accountData?.currency || 'USD'
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-white">Carregando...</div></div>
  }

  if (!accountData) {
    return (
      <>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-white mb-2">Configure sua Conta</h2>
          <p className="text-zinc-400 mb-6">Defina seu saldo inicial</p>
          <Button onClick={() => setShowSetupModal(true)}>Configurar</Button>
        </div>
        <AccountSetupModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} onSubmit={handleSetupAccount} loading={savingSetup} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Capital</h1>
          <p className="text-zinc-400 mt-1">Acompanhe seu saldo</p>
        </div>
        <Button onClick={() => setShowTransactionModal(true)}>+ Nova Transacao</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <div className="text-sm text-blue-300 mb-1">Saldo Inicial</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(balanceData.initialBalance)}</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <div className="text-sm text-emerald-300 mb-1">Depositos</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(balanceData.deposits)}</div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
          <div className="text-sm text-red-300 mb-1">Saques</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(balanceData.withdrawals)}</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <div className="text-sm text-purple-300 mb-1">PnL Trades</div>
          <div className={'text-2xl font-bold ' + (balanceData.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>{formatCurrency(balanceData.totalPnL)}</div>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/50">
        <div className="text-center py-6">
          <div className="text-sm text-yellow-300 mb-2">Saldo Atual</div>
          <div className={'text-5xl font-bold ' + (balanceData.currentBalance >= 0 ? 'text-emerald-400' : 'text-red-400')}>{formatCurrency(balanceData.currentBalance)}</div>
          <div className="text-xs text-zinc-400 mt-3">Saldo Inicial + Depositos - Saques + PnL</div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Historico</h2>
          <span className="text-sm text-zinc-400">{transactions.length} transacoes</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <div className="text-4xl mb-2">📭</div>
            <p>Nenhuma transacao</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={'text-2xl ' + (t.type === 'deposit' ? 'text-emerald-400' : 'text-red-400')}>{t.type === 'deposit' ? '💰' : '💸'}</div>
                  <div>
                    <div className="font-medium text-white">{t.type === 'deposit' ? 'Deposito' : 'Saque'}</div>
                    <div className="text-sm text-zinc-400">{formatDate(t.date)}{t.description && ` - ${t.description}`}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={'text-xl font-bold ' + (t.type === 'deposit' ? 'text-emerald-400' : 'text-red-400')}>{t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}</div>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-400 hover:text-red-300">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AccountSetupModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} onSubmit={handleSetupAccount} loading={savingSetup} />
      <TransactionModal isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} onSubmit={handleAddTransaction} loading={savingTransaction} />
    </div>
  )
}
