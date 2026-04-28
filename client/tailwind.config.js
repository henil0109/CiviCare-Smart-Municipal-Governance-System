/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        {
            pattern: /(bg|text|border|shadow|from|to)-(emerald|blue|yellow|orange|green|red|purple|slate)-(50|100|200|300|400|500|600|700|800|900)/,
            variants: ['hover', 'group-hover'],
        },
    ],
    theme: {
        extend: {
            colors: {
                // Primary e-gov colors
                primary: "#1A365D",
                secondary: "#2DD4BF",
                accent: "#F59E0B",
                background: "#FDFBF7", 
                
                // SPICED MOCHA OVERRIDE
                // Replaces "slate" with warm, earthy espresso and cream tones
                slate: {
                    50: '#FDFBF7',  // creamy vanilla
                    100: '#F4EBE1', // light latte
                    200: '#E6D5C3', // warm sand
                    300: '#D4BCA1', // beige
                    400: '#BC9F7D', // warm taupe
                    500: '#A3815C', // mocha
                    600: '#8A6543', // milk chocolate
                    700: '#6F4C3E', // spiced mocha (core)
                    800: '#54362A', // espresso
                    900: '#3A2318', // dark roast
                    950: '#26150D', // almost black
                },
                
                // Replaces "blue" with spiced terracotta/rust tones for buttons and accents
                blue: {
                    50: '#FEF6F1',  
                    100: '#FDE8DD', 
                    200: '#FBD0BC', 
                    300: '#F7B092', 
                    400: '#F1865F', 
                    500: '#EA5D30', 
                    600: '#D8421A', // spiced orange
                    700: '#B43115', // terracotta
                    800: '#9A2B18', // rust
                    900: '#7E2617', // dark clay
                    950: '#441008',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
