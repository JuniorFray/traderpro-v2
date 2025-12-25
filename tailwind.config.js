export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#09090b',
        surfaceLight: '#18181b',
        border: '#27272a',
        win: '#00e676',
        loss: '#ff1744',
        lock: '#fbbf24',
        accent: '#2979ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 230, 118, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 230, 118, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
