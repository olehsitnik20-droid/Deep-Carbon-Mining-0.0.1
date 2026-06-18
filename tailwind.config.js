/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          950: '#0c0a09',
        },
      },
      keyframes: {
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(-4px)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'bounce-sm': 'bounce-sm 1s infinite',
      },
    },
  },
  plugins: [],
};
