import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5174,
		proxy: {
			'/api/auth': {
				target: 'https://codeoxfsjfvdzsrgggkz.baas.wke.csie.ncnu.edu.tw',
				changeOrigin: true,
				secure: false,
				cookieDomainRewrite: 'localhost',
			},
		},
	},
});
