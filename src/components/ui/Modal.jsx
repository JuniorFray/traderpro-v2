import { Icons } from "../icons"

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = "md"
}) => {
  if (!isOpen) return null
  
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in no-pdf">
      <div className={`bg-surfaceLight w-full ${sizes[size]} rounded-3xl border border-white/10 shadow-2xl p-6 animate-in slide-in-from-bottom duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
