/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00685f",
        "primary-container": "#008378",
        "primary-dark": "#004e47",
        "primary-light": "#0d9488",
        "on-primary": "#ffffff",
        "on-primary-container": "#f4fffc",
        "secondary": "#565e74",
        "secondary-container": "#dae2fd",
        "on-secondary-container": "#5c647a",
        "tertiary": "#006577",
        "tertiary-container": "#008096",
        "tertiary-fixed": "#acedff",
        "surface": "#f8f9ff",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3d4947",
        "outline": "#6d7a77",
        "outline-variant": "#bcc9c6",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        'elevated': '0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
