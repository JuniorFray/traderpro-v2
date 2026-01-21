// src/components/ApiKeyManager.jsx
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { generateApiKey } from '../utils/apiKeyGenerator';
import './ApiKeyManager.css';

export default function ApiKeyManager() {
  const { currentUser } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Buscar API Key existente
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!currentUser) return;
      
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().apiKey) {
          setApiKey(docSnap.data().apiKey);
        }
      } catch (error) {
        console.error('Erro ao buscar API Key:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [currentUser]);

  // Gerar nova API Key
  const handleGenerateKey = async () => {
    if (!currentUser) return;
    
    const confirmed = window.confirm(
      'Tem certeza? A chave antiga deixará de funcionar e você precisará atualizar o EA no MT5.'
    );
    
    if (!confirmed) return;
    
    setGenerating(true);
    
    try {
      const newKey = generateApiKey();
      
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { apiKey: newKey },
        { merge: true }
      );
      
      setApiKey(newKey);
      alert('✅ Nova API Key gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar API Key:', error);
      alert('❌ Erro ao gerar API Key. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  // Copiar para clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="api-key-loading">Carregando...</div>;
  }

  return (
    <div className="api-key-manager">
      <h2>🔑 API Key para MT5</h2>
      <p className="api-key-description">
        Use esta chave no Expert Advisor do MetaTrader 5 para sincronizar seus trades automaticamente.
      </p>

      {apiKey ? (
        <div className="api-key-display">
          <div className="api-key-box">
            <code>{apiKey}</code>
          </div>
          
          <div className="api-key-actions">
            <button onClick={handleCopy} className="btn-copy">
              {copied ? '✅ Copiado!' : '📋 Copiar'}
            </button>
            
            <button 
              onClick={handleGenerateKey} 
              className="btn-regenerate"
              disabled={generating}
            >
              {generating ? 'Gerando...' : '🔄 Gerar Nova Chave'}
            </button>
          </div>
        </div>
      ) : (
        <div className="api-key-empty">
          <p>Você ainda não tem uma API Key.</p>
          <button 
            onClick={handleGenerateKey} 
            className="btn-generate"
            disabled={generating}
          >
            {generating ? 'Gerando...' : '✨ Gerar API Key'}
          </button>
        </div>
      )}

      <div className="api-key-instructions">
        <h3>📖 Como usar:</h3>
        <ol>
          <li>Copie a API Key acima</li>
          <li>Abra o MetaTrader 5</li>
          <li>Instale o Expert Advisor "TraderPro Sync"</li>
          <li>Cole a API Key no campo de configuração</li>
          <li>Seus trades serão sincronizados automaticamente!</li>
        </ol>
      </div>
    </div>
  );
}
