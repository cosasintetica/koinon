import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Sito statico: nessun server, i dati restano sul dispositivo.
			adapter: adapter(),
			// Rotte con # : funziona su qualsiasi hosting statico, anche in una sottocartella.
			router: { type: 'hash' },
			// Cartella dei file generati (alcuni hosting riservano i nomi che iniziano con _).
			appDir: 'app'
		})
	],
	test: { include: ['src/**/*.test.ts'] }
});
