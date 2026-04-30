/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#E91E63', dark: '#C2185B', light: '#FCE4EC', lighter: '#FDF2F6' },
        secondary: { DEFAULT: '#00BCD4', light: '#E0F7FA' },
        accent:    { DEFAULT: '#FFC107', dark: '#FFA000', light: '#FFF8E1' },
        sand:      { DEFAULT: '#FAFAFA', dark: '#F5F5F5' },
        ink:       { DEFAULT: '#1E293B', muted: '#64748B', faint: '#94A3B8' },
        border:    { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        sm:    '0 1px 2px rgba(0,0,0,0.04)',
        card:  '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        lift:  '0 20px 40px rgba(233,30,99,0.15), 0 8px 16px rgba(0,188,212,0.1)',
        glow:  '0 0 0 3px rgba(233,30,99,0.20)',
        '3d':  '6px 6px 0px 0px rgba(30, 41, 59, 1)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'shimmer':   'shimmer 1.5s infinite linear',
        'dot-pulse': 'dotPulse 1.4s infinite',
        'float':     'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity:0, transform:'translateY(14px)' }, to: { opacity:1, transform:'translateY(0)' } },
        shimmer:   { from: { backgroundPosition:'-600px 0' }, to: { backgroundPosition:'600px 0' } },
        dotPulse:  { '0%,80%,100%': { transform:'scale(0)', opacity:0.5 }, '40%': { transform:'scale(1)', opacity:1 } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
}
