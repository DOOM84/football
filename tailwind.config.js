/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [],
    variants: {
        extend: {
            display: ["group-hover"],
        },
    },
    theme: {
        extend: {
            backgroundImage: {
                'pitch': "url('/pitch.png')",
            },
            keyframes: {
                'fade-in-down': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    },
                },
                rotateMenu: {
                    '0%': {
                        transform: 'rotateX(-90deg)'
                    },
                    '70%': {
                        transform: 'rotateX(20deg)'
                    },
                    '100%': {
                        transform: 'rotateX(0deg)'
                    },
                },
                slideIn: {
                    'from': {
                        marginLeft: '80%'
                    },
                    'to': {
                        marginLeft: '0'
                    },
                }
            },
            animation: {
                'fade-in-down': 'fade-in-down 0.5s ease-out'
            }
        }
    },
    plugins: [],
}

