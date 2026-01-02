export const Card = ({ children, className = "", hover = false }) => {
  return (
    <div className={`glass rounded-2xl p-6 border border-white/5 ${hover ? "hover:border-white/20 transition-all" : ""} ${className}`}>
      {children}
    </div>
  )
}

