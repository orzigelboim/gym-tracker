/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#111111',
        surface:   '#1c1c1c',
        surface2:  '#242424',
        surface3:  '#2a2a2a',
        border:    '#2e2e2e',
        border2:   '#3a3a3a',
        text:      '#f5f5f5',
        muted:     '#8a8a8a',
        muted2:    '#555555',
        lime:      '#b6f36a',
        'lime-dim':'#85b84a',
        pull:      '#34d399',
        push:      '#a78bfa',
        shoulders: '#fb923c',
        legs:      '#60a5fa',
        protein:   '#f472b6',
        gold:      '#fbbf24',
        danger:    '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
