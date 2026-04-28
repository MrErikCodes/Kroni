/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: content must include all RN source files
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Gold — brand primary
        gold: {
          50:  '#FFF8E6',
          100: '#FFEFC2',
          300: '#FFD263',
          500: '#F5B015',
          700: '#B8800A',
          900: '#6B4806',
        },
        // Sand — backgrounds / borders
        sand: {
          50:  '#FBFAF6',
          100: '#F4F1E8',
          200: '#E8E2D1',
          500: '#8B8472',
          900: '#1F1C14',
        },
        // Ink — dark mode surfaces
        ink: {
          800: '#1A1F26',
          900: '#0E1116',
        },
        // Semantic
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
        // Kid celebration palette
        coral:  '#FB7185',
        violet: '#A78BFA',
        sky:    '#38BDF8',
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        pill: '999px',
      },
      fontSize: {
        'xs':  ['12px', { lineHeight: '16px' }],
        'sm':  ['14px', { lineHeight: '20px' }],
        'base':['16px', { lineHeight: '24px' }],
        'lg':  ['18px', { lineHeight: '28px' }],
        'xl':  ['22px', { lineHeight: '30px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['36px', { lineHeight: '44px' }],
        '4xl': ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        8:  '32px',
        12: '48px',
        16: '64px',
      },
    },
  },
  plugins: [],
};
