/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        {
            pattern: /(bg|text|border|shadow|from|to)-(emerald|blue|yellow|orange|green|red|purple)-(50|100|200|300|400|500|600|700|800|900)/,
            variants: ['hover', 'group-hover'],
        },
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1A365D", // Deep Blue
                secondary: "#2DD4BF", // Teal/Green
                accent: "#F59E0B", // Amber
                background: "#F3F4F6", // Light Grey
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
