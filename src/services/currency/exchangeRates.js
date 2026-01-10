// src/services/currency/exchangeRates.js
// Serviço de Conversão de Moedas - TraderPro v3.0

const CACHE_KEY = 'traderpro_exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

const fetchBacenRate = async (date) => {
  try {
    const formattedDate = date.replace(/-/g, '');
    const url = \https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='\'&\$\=json\;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.value && data.value.length > 0) {
      return data.value[0].cotacaoCompra;
    }
    
    return null;
  } catch (error) {
    console.warn('Erro Bacen:', error);
    return null;
  }
};

const fetchFawazRate = async (from = 'usd', to = 'brl') => {
  try {
    const url = \https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/\.json\;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data[from.toLowerCase()][to.toLowerCase()] || null;
  } catch (error) {
    console.warn('Erro API alternativa:', error);
    return null;
  }
};

export const getExchangeRate = async (from = 'USD', to = 'BRL', date = null) => {
  if (from === to) return 1;
  
  const cached = getCachedRate(from, to);
  if (cached) {
    console.log('Taxa em cache:', cached);
    return cached;
  }
  
  let rate = null;
  
  if (from === 'USD' && to === 'BRL') {
    const targetDate = date || new Date().toISOString().split('T')[0];
    rate = await fetchBacenRate(targetDate);
  }
  
  if (!rate) {
    rate = await fetchFawazRate(from.toLowerCase(), to.toLowerCase());
  }
  
  if (!rate) {
    console.warn('Usando taxa padrão estimada');
    rate = getDefaultRate(from, to);
  }
  
  if (rate) {
    cacheRate(from, to, rate);
  }
  
  return rate;
};

export const convertCurrency = async (amount, from, to) => {
  if (from === to) return amount;
  
  const rate = await getExchangeRate(from, to);
  return parseFloat((amount * rate).toFixed(2));
};

const getCachedRate = (from, to) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const key = \\_\\;
    const cached = cache[key];
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.rate;
    }
  } catch (error) {
    console.warn('Erro ao ler cache:', error);
  }
  
  return null;
};

const cacheRate = (from, to, rate) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[\\_\\] = {
      rate,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Erro ao salvar cache:', error);
  }
};

const getDefaultRate = (from, to) => {
  const rates = {
    'USD_BRL': 5.45,
    'BRL_USD': 0.18,
    'EUR_BRL': 6.00,
    'BRL_EUR': 0.17
  };
  return rates[\\_\\] || 1;
};

export const clearExchangeCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
