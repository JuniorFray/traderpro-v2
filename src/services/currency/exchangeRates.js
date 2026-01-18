// src/services/currency/exchangeRates.js
// Serviço de Conversão de Moedas - TraderPro v3.0

const CACHE_KEY = 'traderpro_exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Busca cotação do dólar no Banco Central (fonte oficial)
 */
const fetchBacenRate = async (date) => {
  try {
    const formattedDate = date.replace(/-/g, '');
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${formattedDate}'&$format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.value && data.value.length > 0) {
      return data.value[0].cotacaoCompra;
    }

    return null;
  } catch (error) {
    console.warn('Erro ao buscar cotação do Bacen:', error);
    return null;
  }
};

/**
 * API alternativa (fallback)
 */
const fetchFawazRate = async (from = 'usd', to = 'brl') => {
  try {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`;

    const response = await fetch(url);
    const data = await response.json();

    return data[from.toLowerCase()][to.toLowerCase()] || null;
  } catch (error) {
    console.warn('Erro ao buscar cotação da API alternativa:', error);
    return null;
  }
};

/**
 * Função principal para obter taxa de câmbio
 */
export const getExchangeRate = async (from = 'USD', to = 'BRL', date = null) => {
  // Se mesma moeda, retorna 1
  if (from === to) return 1;

  // Tenta buscar do cache
  const cached = getCachedRate(from, to);
  if (cached) {
    console.log(`✅ Taxa ${from}/${to} do cache: ${cached}`);
    return cached;
  }

  let rate = null;

  // 1. Tenta Bacen (oficial) para USD/BRL
  if (from === 'USD' && to === 'BRL') {
    const targetDate = date || new Date().toISOString().split('T')[0];
    rate = await fetchBacenRate(targetDate);
    
    if (rate) {
      console.log(`✅ Taxa do Bacen: 1 USD = R$ ${rate}`);
    }
  }

  // 2. Fallback: API alternativa
  if (!rate) {
    rate = await fetchFawazRate(from.toLowerCase(), to.toLowerCase());
    
    if (rate) {
      console.log(`✅ Taxa da API alternativa: ${rate}`);
    }
  }

  // 3. Último recurso: taxa padrão estimada
  if (!rate) {
    console.warn('⚠️ Usando taxa padrão estimada');
    rate = getDefaultRate(from, to);
  }

  // Salva no cache
  if (rate) {
    cacheRate(from, to, rate);
  }

  return rate;
};

/**
 * Converte valor entre moedas
 */
export const convertCurrency = async (amount, from, to) => {
  if (from === to) return amount;

  const rate = await getExchangeRate(from, to);
  return parseFloat((amount * rate).toFixed(2));
};

/**
 * Busca taxa do cache
 */
const getCachedRate = (from, to) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const key = `${from}_${to}`;
    const cached = cache[key];

    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.rate;
    }
  } catch (error) {
    console.warn('Erro ao ler cache:', error);
  }

  return null;
};

/**
 * Salva taxa no cache
 */
const cacheRate = (from, to, rate) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[`${from}_${to}`] = {
      rate,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log(`💾 Taxa ${from}/${to} salva no cache`);
  } catch (error) {
    console.warn('Erro ao salvar cache:', error);
  }
};

/**
 * Taxas padrão (fallback final)
 */
const getDefaultRate = (from, to) => {
  const rates = {
    'USD_BRL': 5.45,
    'BRL_USD': 0.18,
    'EUR_BRL': 6.00,
    'BRL_EUR': 0.17,
    'EUR_USD': 1.10,
    'USD_EUR': 0.91
  };
  return rates[`${from}_${to}`] || 1;
};

/**
 * Limpa cache (útil para testes)
 */
export const clearExchangeCache = () => {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Cache de câmbio limpo');
};
