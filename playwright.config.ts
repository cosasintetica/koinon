import { defineConfig, devices } from '@playwright/test';

// Test dell'interfaccia: compila il sito statico e lo prova in un browser vero.
// In locale si può indicare un Chrome già installato con CHROME_PATH.
export default defineConfig({
	testDir: 'e2e',
	timeout: 30_000,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		locale: 'it-IT',
		launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
	},
	projects: [
		{ name: 'telefono', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
		{ name: 'computer', use: { viewport: { width: 1280, height: 800 }, browserName: 'chromium' } }
	],
	webServer: {
		command: 'npm run build && npx vite preview --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
