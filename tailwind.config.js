/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        chambers: {
          bg: '#0A0B0D',
          sidebar: '#0E0F12',
          surface: '#131518',
          elevated: '#17191E',
          card: '#131518',
          border: '#202227',
          borderHover: '#2E313A',
          borderLight: '#2A2C34',
          accent: '#D97706',
          accentHover: '#B45309',
          accentLight: 'rgba(217, 119, 6, 0.12)',
          text: '#F4F3EF',
          textMuted: '#8E8D88',
          textDim: '#575652',
          safe: '#10B981',
          caution: '#D97706',
          risky: '#E11D48',
        }
      }
    },
  },
  plugins: [],
}
