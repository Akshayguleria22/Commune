/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        commune: {
          50: '#f0ecfe',
          100: '#ddd5fc',
          200: '#bbaaf9',
          300: '#9980f6',
          400: '#7755f3',
          500: '#6C5CE7', // primary
          600: '#5644c7',
          700: '#4133a7',
          800: '#2b2287',
          900: '#181356',
        },
        dark: {
          50: '#e8e8ec',
          100: '#d1d1d9',
          200: '#a3a3b3',
          300: '#75758d',
          400: '#474767',
          500: '#2d2d44', // surface
          600: '#21213a',
          700: '#1a1a2e', // background
          800: '#12122a',
          900: '#0a0a1a', // deep
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
  // Important: don't override Ant Design styles
  corePlugins: {
    preflight: false,
  },
};
