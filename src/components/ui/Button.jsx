export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md",
  className = "", 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-accent hover:bg-blue-600 text-white shadow-lg shadow-accent/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    success: "bg-win hover:bg-emerald-400 text-black shadow-lg shadow-win/20",
    danger: "bg-loss/10 hover:bg-loss/20 text-loss border border-loss/30",
    ghost: "hover:bg-white/5 text-zinc-400 hover:text-white"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
