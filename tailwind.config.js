/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#E76F51', dark: '#C4563B', light: '#FEF0EB', lighter: '#FEF9F7' },
        secondary: { DEFAULT: '#F4A261', light: '#FEF5EC' },
        accent:    { DEFAULT: '#2A9D8F', dark: '#1E7268', light: '#EAF7F5' },
        sand:      { DEFAULT: '#FFF8F3', dark: '#F5EDE4' },
        ink:       { DEFAULT: '#1F2937', muted: '#6B7280', faint: '#9CA3AF' },
        border:    { DEFAULT: '#E5E7EB', strong: '#D1D5DB' },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        sm:    '0 1px 2px rgba(0,0,0,0.04)',
        card:  '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
        lift:  '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        glow:  '0 0 0 3px rgba(231,111,81,0.20)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'shimmer':   'shimmer 1.5s infinite linear',
        'dot-pulse': 'dotPulse 1.4s infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity:0, transform:'translateY(14px)' }, to: { opacity:1, transform:'translateY(0)' } },
        shimmer:   { from: { backgroundPosition:'-600px 0' }, to: { backgroundPosition:'600px 0' } },
        dotPulse:  { '0%,80%,100%': { transform:'scale(0)', opacity:0.5 }, '40%': { transform:'scale(1)', opacity:1 } },
      },
    },
  },
  plugins: [],
}
