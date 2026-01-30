import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload de imagem para o Firebase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} userId - ID do usuário
 * @param {string} tradeId - ID do trade
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadTradeImage = async (file, userId, tradeId) => {
  try {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas imagens são permitidas');
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Imagem deve ter no máximo 5MB');
    }

    // Gerar nome único para a imagem
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // Caminho: users/{userId}/trades/{tradeId}/images/{fileName}
    const storageRef = ref(storage, `users/${userId}/trades/${tradeId}/images/${fileName}`);

    // Upload
    await uploadBytes(storageRef, file);

    // Retornar URL pública
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

/**
 * Deletar imagem do Storage
 * @param {string} imageUrl - URL completa da imagem
 */
export const deleteTradeImage = async (imageUrl) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    throw error;
  }
};

/**
 * Upload múltiplo de imagens
 * @param {FileList} files - Lista de arquivos
 * @param {string} userId - ID do usuário
 * @param {string} tradeId - ID do trade
 * @returns {Promise<string[]>} Array de URLs
 */
export const uploadMultipleTradeImages = async (files, userId, tradeId) => {
  const uploadPromises = Array.from(files).map(file => 
    uploadTradeImage(file, userId, tradeId)
  );
  
  return await Promise.all(uploadPromises);
};
