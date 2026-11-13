import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

/** Controllo di accessibilità: nessuna violazione grave o critica (WCAG 2.1 AA). */
async function expectAccessible(page: Page, where: string) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(200);
	await page.addScriptTag({ content: axeSource });
	const result = await page.evaluate(async () => {
		// @ts-expect-error axe è iniettato nella pagina
		const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] });
		return r.violations
			.filter((v: { impact: string }) => v.impact === 'serious' || v.impact === 'critical')
			.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
	});
	expect(result, `accessibilità di ${where}`).toEqual([]);
}

const next = (page: Page) => page.getByRole('button', { name: 'Avanti' }).click();

/** Crea un personaggio con risposte nella media. */
async function createCharacter(page: Page, skills = ['Scrittura', 'Cucina']) {
	await page.goto('./#/crea');
	await page.getByLabel('Come vuoi chiamare il tuo personaggio?').fill('Prova');
	await next(page);
	await page.getByLabel('Età').fill('30');
	await page.getByLabel('Sesso biologico').selectOption('f');
	await page.getByLabel('Peso (kg)').fill('60');
	await next(page);
	await page.locator('#pushups').fill('11');
	await next(page);
	await page.locator('#walk_min').fill('45');
	await page.locator('#stairs').fill('5');
	await next(page);
	await page.locator('#balance').fill('12');
	await page.locator('#reach').getByRole('radio').nth(2).click();
	await next(page);
	await page.locator('#study_h').fill('3');
	await page.locator('#books').fill('4');
	await page.locator('#logic_seq').getByRole('radio').nth(1).click();
	await page.locator('#logic_bat').getByRole('radio').nth(0).click();
	await next(page);
	await page.locator('#sleep_h').fill('8');
	for (const id of ['sleep_q', 'stress_control', 'stress_overwhelm']) await page.locator(`#${id}`).getByRole('radio').nth(2).click();
	await next(page);
	await page.locator('#talks').fill('6');
	await page.locator('#helps').fill('3');
	await page.locator('#listen').getByRole('radio').nth(2).click();
	await next(page);
	for (const s of skills) await page.getByRole('button', { name: s, exact: true }).click();
	await next(page);
}

test('creazione del personaggio, quest e salvataggio', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));

	await createCharacter(page);
	// Risposte nella media: tutti gli attributi tra 8 e 12.
	const label = (await page.getByRole('img').first().getAttribute('aria-label')) ?? '';
	for (const v of label.match(/\d+(\.\d)?/g) ?? []) expect(Number(v)).toBeGreaterThanOrEqual(8), expect(Number(v)).toBeLessThanOrEqual(12);
	await page.getByRole('button', { name: 'Inizia' }).click();
	await expect(page.getByRole('heading', { name: 'Prova' })).toBeVisible();

	await page.getByRole('link', { name: 'Quest', exact: true }).click();
	await page.getByRole('button', { name: /Accetta/ }).first().click();
	await page.getByRole('button', { name: /Fatto/ }).click();
	await expect(page.getByRole('heading', { name: 'Completate' })).toBeVisible();

	// Il personaggio resta dopo il ricaricamento (lasciando il tempo a IndexedDB di scrivere).
	await page.waitForTimeout(500);
	await page.reload();
	await page.goto('./#/scheda');
	await page.waitForTimeout(300);
	const head = await page.locator('main').innerText();
	expect(head, head.slice(0, 300)).toMatch(/\b20 XP ·/);
	expect(errors).toEqual([]);
});

test('una quest appena completata non si può rifare subito', async ({ page }) => {
	await createCharacter(page, ['Corsa']);
	await page.getByRole('button', { name: 'Inizia' }).click();
	await page.goto('./#/quest');
	const first = page.locator('.group').first().locator('h3', { hasNotText: 'Corsa' }).first();
	const title = (await first.textContent())!.trim();
	await page.locator('.group').first().getByRole('button', { name: /Accetta/ }).first().click();
	await page.getByRole('button', { name: /Fatto/ }).click();
	await expect(page.locator('.group').getByRole('heading', { name: title, exact: true })).toHaveCount(0);
	await expect(page.getByText(`${title}: di nuovo disponibile dal`)).toBeVisible();
});

test('cambio lingua', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: /Language/ }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('The character is you.');
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('The character is you.');
});

test('accessibilità di tutte le pagine, tema chiaro e scuro', async ({ page }) => {
	for (const scheme of ['light', 'dark'] as const) {
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto('./');
		await expectAccessible(page, `home (${scheme})`);
		await page.goto('./#/guida');
		await expectAccessible(page, `guida (${scheme})`);
	}
	await createCharacter(page);
	await expectAccessible(page, 'risultato del questionario');
	await page.getByRole('button', { name: 'Inizia' }).click();
	for (const scheme of ['light', 'dark'] as const) {
		await page.emulateMedia({ colorScheme: scheme });
		for (const route of ['scheda', 'quest', 'comunita', 'impostazioni']) {
			await page.goto(`./#/${route}`);
			await page.waitForTimeout(150);
			await expectAccessible(page, `${route} (${scheme})`);
		}
	}
});

test('funziona offline dopo la prima visita', async ({ page, context }) => {
	await page.goto('./');
	await page.evaluate(async () => { await navigator.serviceWorker.ready; });
	await page.reload(); // la pagina ora è controllata dal service worker
	await page.evaluate(async () => { await navigator.serviceWorker.ready; });
	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Il personaggio sei tu.');
	await page.goto('./#/guida');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Come funziona Koinon');
	await context.setOffline(false);
});
