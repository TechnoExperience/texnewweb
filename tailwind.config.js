/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// Brutalista Digital Techno Palette
				black: '#000000',
				white: '#FFFFFF',
				gray: {
					light: '#CCCCCC',
					dark: '#333333',
				},
				neon: {
					mint: '#A2F2C2',
					yellow: '#F2FF00',
					pink: '#FF0080',
				},
				category: {
					home: '#FFFFFF',
					news: '#00CED1',
					music: '#8A2BE2',
					techno: '#0066FF',
					entertainment: '#00FF00',
					celebrities: '#F2FF00',
					videos: '#FF8C00',
				},
				accent: {
					turquoise: '#00CED1',
					purple: '#8A2BE2',
					blue: '#0066FF',
					green: '#00FF00',
					orange: '#FF8C00',
				},
				// Mantener algunos colores base para compatibilidad
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#A2F2C2',
					foreground: '#000000',
				},
				secondary: {
					DEFAULT: '#F2FF00',
					foreground: '#000000',
				},
				destructive: {
					DEFAULT: '#FF0080',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#333333',
					foreground: '#CCCCCC',
				},
				popover: {
					DEFAULT: '#000000',
					foreground: '#FFFFFF',
				},
				card: {
					DEFAULT: '#000000',
					foreground: '#FFFFFF',
				},
			},
			fontFamily: {
				'bebas': ['Bebas Neue', 'sans-serif'],
				'jetbrains': ['JetBrains Mono', 'monospace'],
				'inter': ['Inter', 'sans-serif'],
				'space': ['Space Mono', 'monospace'],
			},
			fontSize: {
				'hero': '3.5rem',
				'h1': '2.5rem',
				'h2': '2rem',
				'h3': '1.5rem',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				none: '0',
				brutal: '0',
			},
			spacing: {
				'section': '4rem',
				'component': '2rem',
				'element': '1rem',
			},
			screens: {
				'mobile': '768px',
				'tablet': '1024px',
				'desktop': '1200px',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'glitch': {
					'0%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(-2px, -2px)' },
					'60%': { transform: 'translate(2px, 2px)' },
					'80%': { transform: 'translate(2px, -2px)' },
					'100%': { transform: 'translate(0)' },
				},
				'neon-pulse': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
				},
				'fade-up': {
					'0%': { opacity: 0, transform: 'translateY(20px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glitch': 'glitch 0.3s ease-in-out infinite',
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'fade-up': 'fade-up 0.6s ease-out',
				'slide-in': 'slide-in 0.5s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}