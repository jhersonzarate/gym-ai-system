/** @type {import('tailwindcss').Config} */
// frontend/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gym: {
          bg:      '#0a0a0a',
          card:    '#111111',
          border:  '#1f1f1f',
          green:   '#22c55e',
          green2:  '#16a34a',
          text:    '#e5e7eb',
          muted:   '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

