/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              marginBottom: '1rem',
            },
            h2: {
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            },
            h3: {
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
            },
            'ul > li': {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
          },
        },
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}