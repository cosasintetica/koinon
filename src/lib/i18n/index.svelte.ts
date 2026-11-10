import type { Lang, Text } from '#lib/model/types.ts';
import { it } from './it';
import { en } from './en';

export type Dict = typeof it;
const dicts: Record<Lang, Dict> = { it, en };

const initial = (): Lang => {
	try {
		const saved = localStorage.getItem('koinon.lang');
		if (saved === 'it' || saved === 'en') return saved;
	} catch { /* storage non disponibile */ }
	return typeof navigator !== 'undefined' && navigator.language?.startsWith('it') ? 'it' : 'en';
};

export const i18n = $state({ lang: initial() as Lang });

export function setLang(l: Lang) {
	i18n.lang = l;
	try { localStorage.setItem('koinon.lang', l); } catch { /* ignora */ }
	document.documentElement.lang = l;
}

/** Testo bilingue del catalogo. */
export const tx = (t: Text) => t[i18n.lang] ?? t.it;
/** Testi dell'interfaccia. */
export const ui = () => dicts[i18n.lang];
