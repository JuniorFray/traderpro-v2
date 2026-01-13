import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { ConsolidatedDashboard } from './ConsolidatedDashboard';
import { DayTradeDashboard } from './DayTradeDashboard';
import { ForexDashboard } from './ForexDashboard';
import { Loading } from '../../components/ui/Loading';

const TABS = [
  { id: 'all', label: 'Consolidado', icon: '📈' },
  { id: 'b3daytrade', label: 'Day Trade', icon: '📊' },
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'b3swing', label: 'Swing Trade', icon: '📉' },
  { id: 'b3options', label: 'Opções', icon: '🎯' }
];

export const MarketsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const tradesRef = collection(db, 'artifacts/trade-journal-public/users', user.uid, 'trades');
    const q = query(tradesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrades(tradesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  const renderDashboard = () => {
    switch (activeTab) {
      case 'all':
        return <ConsolidatedDashboard trades={trades} />;
      case 'b3daytrade':
        return <DayTradeDashboard trades={trades} />;
      case 'forex':
        return <ForexDashboard trades={trades} />;
      case 'b3swing':
        return (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📉</span>
            <h2 className="text-2xl font-bold text-white mb-2">Swing Trade - Em Breve</h2>
            <p className="text-zinc-400">Dashboard específico em desenvolvimento</p>
          </div>
        );
      case 'b3options':
        return (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎯</span>
            <h2 className="text-2xl font-bold text-white mb-2">Opções - Em Breve</h2>
            <p className="text-zinc-400">Dashboard específico em desenvolvimento</p>
          </div>
        );
      default:
        return <ConsolidatedDashboard trades={trades} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 bg-zinc-900 rounded-lg p-2 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="animate-fadeIn">
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
};
