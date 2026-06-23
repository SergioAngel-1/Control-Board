/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0b0b0d',
        surface: '#111113',
        'surface-raised': '#18181b',
        'surface-hover': '#1e1e21',
        sidebar: '#0e0e10',
        border: '#1e1e22',
        'border-light': '#27272b',
        'text-primary': '#eeeef2',
        'text-secondary': '#8e8ea0',
        'text-tertiary': '#5e5e71',
        accent: '#5e6ad2',
        'accent-hover': '#6f7ae0',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '14px',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', translate: '0 6px' },
          to: { opacity: '1', translate: '0 0' },
        },
      },
    },
  },
  plugins: [],
}
