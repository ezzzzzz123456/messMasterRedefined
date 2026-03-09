/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'app': '#0d0b1a',
        'surface': '#13102a',
        'card': '#1a1630',
        'border': '#2d2550',
        'primary': '#e2dff5',
        'muted': '#6b6490',
        'accent': '#8b5cf6',
        'accent-light': '#a78bfa',
        'accent-bright': '#c4b5fd',
        'pink': '#ec4899',
        'green': '#10b981',
        'teal': '#2dd4bf',
        'blue': '#38bdf8',
        'red': '#ef4444',
        'yellow': '#f59e0b',
        'orange': '#f97316',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
