/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        dot: ['"DotGothic16"', '"JetBrains Mono"', 'monospace'],
        ndot: ['"DotGothic16"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#D71921',
          hover: '#b5141b',
          dim: 'rgba(215, 25, 33, 0.12)',
        },
        nothing: {
          black: '#000000',
          white: '#FFFFFF',
          red: '#D71921',
          'red-hover': '#b5141b',
          'surface-dark': '#0D0D0D',
          'surface-light': '#F7F7F7',
          'subtle-dark': '#141414',
          'subtle-light': '#EFEFEF',
          'line-dark': '#222222',
          'line-light': '#E5E5E5',
          'muted-dark': '#777777',
          'muted-light': '#888888',
        },
        dark: {
          bg: '#000000',
          surface: '#0D0D0D',
          card: '#121212',
          border: '#222222',
        },
      },
      boxShadow: {
        'nothing-red': '0 0 20px -3px rgba(215, 25, 33, 0.45)',
        'nothing-card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      }
    },
  },
  plugins: [],
}
