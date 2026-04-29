/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        {
            pattern: /(bg|text|border|shadow|from|to)-(emerald|blue|yellow|orange|green|red|purple|slate|indigo|cyan)-(50|100|200|300|400|500|600|700|800|900)/,
            variants: ['hover', 'group-hover'],
        },
    ],
    theme: {
        extend: {
            colors: {
                // To allow the stunning mesh gradient to shine through, we make our base slate colors semi-transparent glass
                slate: {
                    50: 'rgba(255, 255, 255, 0.65)',  // Beautiful frosted glass effect
                    100: 'rgba(255, 255, 255, 0.85)', // Stronger glass
                    200: '#DDE5EE',
                    300: '#C2D1E0',
                    400: '#9EAFC4',
                    500: '#7E92AB',
                    600: '#64768D',
                    700: '#506074',
                    800: '#424F61',
                    900: '#1E293B',
                    950: '#0F172A',
                },
                
                // Extremely vibrant Electric Royal Blue (appealing and attractive)
                blue: {
                    50: '#F0F6FF',
                    100: '#E0EDFF',
                    200: '#CBE0FF',
                    300: '#A8CCFF',
                    400: '#7EADFF',
                    500: '#3B82F6', 
                    600: '#2563EB', // Vibrant Royal Blue
                    700: '#1D4ED8', // Deep interactive blue
                    800: '#1E40AF',
                    900: '#1E3A8A',
                    950: '#172554',
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
