/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#2563eb", // синій
          600: "#1d4ed8",
        },
      },
      boxShadow: {
        soft: "0 2px 4px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
