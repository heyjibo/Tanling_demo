/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4', // Cyan
        secondary: '#3b82f6', // Blue
        dark: '#0f172a',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    },
  },
  plugins: [],
}