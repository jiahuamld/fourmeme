import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class', 'class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-space-default)',
                    ...fontFamily.sans
                ],
  			display: [
  				'var(--font-space-display)',
                    ...fontFamily.sans
                ],
  			cursive: [
  				'cursive'
  			]
  		},
  		colors: {
  			primary: {
  				'100': 'colors.primary.lighter',
  				'200': 'colors.primary.lighter',
  				'300': 'colors.primary.light',
  				'400': 'colors.primary.light',
  				'500': 'colors.primary.main',
  				'600': 'colors.primary.main',
  				'700': 'colors.primary.dark',
  				'800': 'colors.primary.dark',
  				'900': 'colors.primary.darker',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'100': 'colors.secondary.lighter',
  				'200': 'colors.secondary.lighter',
  				'300': 'colors.secondary.light',
  				'400': 'colors.secondary.light',
  				'500': 'colors.secondary.main',
  				'600': 'colors.secondary.main',
  				'700': 'colors.secondary.dark',
  				'800': 'colors.secondary.dark',
  				'900': 'colors.secondary.darker',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'color-1': 'hsl(var(--color-1))',
  			'color-2': 'hsl(var(--color-2))',
  			'color-3': 'hsl(var(--color-3))',
  			'color-4': 'hsl(var(--color-4))',
  			'color-5': 'hsl(var(--color-5))'
  		},
  		screens: {
  			'2xl': '1400px'
  		},
  		keyframes: {
  			marquee: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(-50%)'
  				},
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			'background-position-spin': {
  				'0%': {
  					backgroundPosition: 'top center'
  				},
  				'100%': {
  					backgroundPosition: 'bottom center'
  				}
  			},
  			rainbow: {
  				'0%, 100%': {
  					'background-position': '0% 50%'
  				},
  				'50%': {
  					'background-position': '100% 50%'
  				}
  			},
  			breath: {
  				'0%, 100%': {
  					transform: 'scale(1)',
  					opacity: '0.9'
  				},
  				'50%': {
  					transform: 'scale(1.03)',
  					opacity: '1'
  				}
  			},
  			'breath-glow': {
  				'0%, 100%': {
  					opacity: '0.2'
  				},
  				'50%': {
  					opacity: '0.4'
  				}
  			},
  			'breath-border': {
  				'0%, 100%': {
  					opacity: '0.2',
  					transform: 'scaleX(0.8)'
  				},
  				'50%': {
  					opacity: '0.4',
  					transform: 'scaleX(1)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translate(-50%, -50%) translateY(0)'
  				},
  				'50%': {
  					transform: 'translate(-50%, -50%) translateY(-2px)'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			},
  			'border-pulse': {
  				'0%, 100%': { opacity: '1', transform: 'scale(1)' },
  				'50%': { opacity: '0.5', transform: 'scale(1.05)' },
  			},
  			'arrow-move': {
  				'0%, 100%': { transform: 'translateX(0)', opacity: '0.3' },
  				'50%': { transform: 'translateX(10px)', opacity: '1' },
  			},
  			'arrow-move-reverse': {
  				'0%, 100%': { transform: 'translateX(0)', opacity: '0.3' },
  				'50%': { transform: 'translateX(-10px)', opacity: '1' },
  			},
  		},
  		animation: {
  			marquee: 'marquee var(--duration) infinite linear',
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			'background-position-spin': 'background-position-spin 3000ms infinite alternate',
  			rainbow: 'rainbow 3s linear infinite',
  			pulse: 'pulse var(--duration) ease-out infinite',
  			'breath-slow': 'breath 6s ease-in-out infinite',
  			breath: 'breath 3s ease-in-out infinite',
  			'breath-glow': 'breath-glow 4s ease-in-out infinite',
  			'breath-border': 'breath-border 3s ease-in-out infinite',
  			'float-slow': 'float 3s ease-in-out infinite',
  			'pulse-slow': 'pulse 4s ease-in-out infinite',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
  			'border-pulse': 'border-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'arrow-right': 'arrow-move 2s ease-in-out infinite',
  			'arrow-left': 'arrow-move-reverse 2s ease-in-out infinite',
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },

  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
export default config;
