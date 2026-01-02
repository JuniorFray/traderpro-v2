export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md",
  className = "", 
  ...props 
}) => {
  const baseStyles = "font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-win hover:bg-green-600 text-black",
    success: "bg-win hover:bg-green-600 text-black",
    outline: "bg-transparent border-2 border-zinc-700 hover:border-zinc-600 text-white"
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg"
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
