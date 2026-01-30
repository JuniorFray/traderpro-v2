import { useState } from 'react'
import { uploadTradeImage, deleteTradeImage } from '../../services/storageService'
import { useAuth } from '../auth/AuthContext'

export const TradeImageUpload = ({ tradeId, initialImages = [], onImagesChange }) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState(initialImages)
  const [preview, setPreview] = useState(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return

    // Validar múltiplas imagens
    if (images.length + files.length > 5) {
      alert('Máximo 5 imagens por trade!')
      return
    }

    setUploading(true)

    try {
      const uploadedUrls = []
      
      for (const file of files) {
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} não é uma imagem válida`)
          continue
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} excede 5MB`)
          continue
        }

        // Upload
        const url = await uploadTradeImage(file, user.uid, tradeId)
        uploadedUrls.push(url)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesChange(newImages)

    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageUrl) => {
    if (!window.confirm('Deletar esta imagem?')) return

    try {
      await deleteTradeImage(imageUrl)
      const newImages = images.filter(url => url !== imageUrl)
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar imagem')
    }
  }

  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">
        📸 Screenshots / Imagens do Trade (opcional)
      </label>

      {/* Preview das imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Trade screenshot ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-zinc-700 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setPreview(url)}
              />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input de upload */}
      {images.length < 5 && (
        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
          <div className="text-center">
            {uploading ? (
              <div className="text-zinc-400">📤 Enviando...</div>
            ) : (
              <>
                <div className="text-2xl mb-1">🖼️</div>
                <div className="text-sm text-zinc-400">
                  Clique para adicionar imagens
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  Até {5 - images.length} imagem(ns) • Max 5MB cada
                </div>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {/* Modal de preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
