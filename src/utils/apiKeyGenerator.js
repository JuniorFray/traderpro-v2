// src/utils/apiKeyGenerator.js

/**
 * Gera uma API Key única e segura
 * Formato: tp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (35 caracteres)
 */
export const generateApiKey = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const randomStr2 = Math.random().toString(36).substring(2, 15);
  
  return `tp_${timestamp}${randomStr}${randomStr2}`;
};

/**
 * Valida formato da API Key
 */
export const isValidApiKey = (key) => {
  return typeof key === 'string' && key.startsWith('tp_') && key.length >= 20;
};
