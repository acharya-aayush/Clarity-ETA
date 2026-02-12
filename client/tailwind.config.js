/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          base: '#E0E5EC',
          text: '#475569',
          dark: '#1E293B',
          primary: '#2563EB',
          danger: '#EF4444',
          success: '#10B981',
        }
      },
      boxShadow: {
        'neu-xl': '12px 12px 24px #A3B1C6, -12px -12px 24px #FFFFFF',
        'neu-flat': '6px 6px 12px #A3B1C6, -6px -6px 12px #FFFFFF',
        'neu-sm': '3px 3px 6px #A3B1C6, -3px -3px 6px #FFFFFF',
        'neu-pressed': 'inset 6px 6px 10px #A3B1C6, inset -6px -6px 10px #FFFFFF',
        'neu-pressed-sm': 'inset 3px 3px 6px #b8b9be, inset -3px -3px 6px #FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
