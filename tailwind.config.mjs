/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#385664',
          dark: '#2F434D',
          darker: '#22343D',
        },
        secondary: {
          DEFAULT: '#5D879D',
          light: '#8BAFC3',
        },
        accent: '#DEDA93',
        'light-blue': '#D6E4EE',
        'bg-subtle': '#FAFDFF',
        orange: '#EF853C',
      },
      fontFamily: {
        barlow: ['Barlow', 'sans-serif'],
      },
      fontSize: {
        'hero': ['68px', { lineHeight: '81.6px', letterSpacing: '-1.36px' }],
        'h2': ['36px', { lineHeight: '46.8px' }],
        'h3': ['22px', { lineHeight: '30.8px' }],
        'h3-sm': ['20px', { lineHeight: '28px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '23.8px' }],
        'overline': ['14px', { lineHeight: '16.8px', letterSpacing: '0.56px' }],
        'stat': ['34px', { lineHeight: '1.2' }],
        'subtitle-hero': ['18px', { lineHeight: '28.8px' }],
        'quote': ['24px', { lineHeight: '36px' }],
        'btn-lg': ['22px', { lineHeight: '1', letterSpacing: '0.44px' }],
        'btn-md': ['20px', { lineHeight: '1', letterSpacing: '0.4px' }],
        'btn-sm': ['14px', { lineHeight: '1', letterSpacing: '0.28px' }],
      },
      borderRadius: {
        'pill': '200px',
        'btn': '80px',
        'tag': '60px',
        'card': '20px',
        'logo': '12px',
      },
      maxWidth: {
        'container': '1216px',
      },
      backdropBlur: {
        'nav': '30px',
        'tag': '10.5px',
      },
      spacing: {
        'section-lg': '140px',
        'section-md': '120px',
        'section-sm': '100px',
      },
    },
  },
  plugins: [],
};
