// Salvataggio locale (IndexedDB). Nessun dato lascia il dispositivo.
import { openDB, type IDBPDatabase } from 'idb';
import type { Character } from '#lib/model/types.ts';

const DB = 'koinon';
const STORE = 'character';
const KEY = 'me';

let dbp: Promise<IDBPDatabase> | null = null;
const db = () => (dbp ??= openDB(DB, 1, { upgrade: (d) => d.createObjectStore(STORE) }));

export const game = $state<{ character: Character | null; ready: boolean; persistent: boolean; error: string }>({
	character: null,
	ready: false,
	persistent: true,
	error: ''
});

export async function load() {
	try {
		game.character = ((await (await db()).get(STORE, KEY)) as Character | undefined) ?? null;
	} catch {
		// Browser senza IndexedDB (navigazione privata, anteprime): si gioca in memoria.
		game.persistent = false;
	}
	game.ready = true;
}

export async function save(c: Character) {
	game.character = c;
	if (!game.persistent) return;
	try {
		await (await db()).put(STORE, $state.snapshot(c), KEY);
	} catch {
		game.persistent = false;
	}
}

/** Applica una regola del motore e salva; restituisce il codice d'errore se la regola la vieta. */
export async function act(fn: (c: Character) => Character): Promise<string | null> {
	if (!game.character) return 'no_character';
	try {
		await save(fn($state.snapshot(game.character) as Character));
		return null;
	} catch (e) {
		return e instanceof Error ? e.message : 'error';
	}
}

export async function reset() {
	game.character = null;
	try { await (await db()).delete(STORE, KEY); } catch { /* ignora */ }
}

export function exportJson(): string {
	return JSON.stringify($state.snapshot(game.character), null, 2);
}

export async function importJson(text: string) {
	const c = JSON.parse(text) as Character;
	if (c?.version !== 1 || !c.attributes || !Array.isArray(c.quests)) throw new Error('invalid');
	await save(c);
}
