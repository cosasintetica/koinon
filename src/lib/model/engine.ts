// Koinon — regole del gioco. Funzioni pure: ricevono un personaggio e ne restituiscono uno nuovo.

import { BRANCH_INFO, skillById } from '#lib/data/skills.ts';
import { QUESTS } from '#lib/data/quests.ts';
import { refs, unscale, type RefKey } from './scoring';
import type { AttributeId, Character, Grade, Profile, QuestRun, QuestTemplate, Text } from './types';
import { ATTRIBUTES } from './types';

export const MAX_ACTIVE_QUESTS = 3;
export const FAILS_BEFORE_RECALIBRATION = 3;
export const RECALIBRATION_DAYS = 90;
/** XP necessari per ciascun grado di abilità (indice = grado - 1). */
export const GRADE_XP = [0, 100, 300, 700, 1500];
/** XP per una quest di quel grado (indice = grado - 1), uguali per tutti. */
export const QUEST_XP = [20, 40, 80, 150, 300];
export const VERIFICATION_BONUS = { self: 1, evidence: 1.25, peer: 1.5 } as const;
/** Grado oltre il quale serve la certificazione di altre persone (Fase 2). */
export const PEER_GRADE = 4;

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString();

export function createCharacter(name: string, profile: Profile, values: Record<AttributeId, number>, focus: string[], now = new Date()): Character {
	const attributes = {} as Character['attributes'];
	for (const a of ATTRIBUTES) {
		attributes[a] = { value: values[a], measured: values[a], failStreak: 0, history: [{ at: iso(now), value: values[a], reason: 'questionnaire' }] };
	}
	return { version: 1, name, createdAt: iso(now), lastCalibrationAt: iso(now), profile, attributes, skills: {}, focus: focus.slice(0, 5), quests: [] };
}

/** XP totali: solo dalle quest completate. I valori dichiarati non danno punti. */
export const totalXp = (c: Character) => c.quests.filter((q) => q.status === 'done').reduce((s, q) => s + q.xp, 0);

/** Livello: 1 + radice di XP/50. Livello 2 a 50 XP, livello 5 a 800 XP, livello 10 a 4.050 XP. */
export const levelFromXp = (xp: number) => 1 + Math.floor(Math.sqrt(xp / 50));
export const xpForLevel = (level: number) => 50 * (level - 1) ** 2;
export const level = (c: Character) => levelFromXp(totalXp(c));

export function skillGrade(xp: number): Grade {
	let g = 1;
	for (let i = 0; i < GRADE_XP.length; i++) if (xp >= GRADE_XP[i]) g = i + 1;
	// Senza certificazione si resta al massimo Praticante.
	return Math.min(g, PEER_GRADE - 1) as Grade;
}

export const isBranchUnlocked = (c: Character, skillId: string) => {
	const sk = skillById(skillId);
	return !!sk && level(c) >= BRANCH_INFO[sk.branch].unlockLevel;
};

const activeQuests = (c: Character) => c.quests.filter((q) => q.status === 'active');

/**
 * Quest di abilità disponibili per le abilità scelte, fino al grado attuale.
 * Le quest sono ripetibili (la pratica costante è il punto), ma quelle sotto il proprio grado
 * valgono metà XP: si cresce davvero solo alzando l'asticella.
 */
export function availableSkillQuests(c: Character, now = new Date()): QuestTemplate[] {
	const active = new Set(activeQuests(c).map((q) => q.questId));
	return QUESTS.filter((t) => {
		if (!c.focus.includes(t.skill) || !isBranchUnlocked(c, t.skill)) return false;
		if (active.has(t.id) || nextAvailableAt(c, t, now)) return false;
		return t.grade <= skillGrade(c.skills[t.skill] ?? 0);
	}).sort((a, b) => b.grade - a.grade);
}

/**
 * Una quest completata si può ripetere solo quando è trascorsa la sua durata
 * (una quest settimanale, una volta a settimana): impedisce di accumulare XP a raffica.
 * Restituisce la data da cui torna disponibile, oppure null se lo è già.
 */
export function nextAvailableAt(c: Character, t: QuestTemplate, now = new Date()): Date | null {
	const last = c.quests.filter((q) => q.questId === t.id && q.status === 'done').at(-1);
	if (!last) return null;
	const at = new Date(new Date(last.startedAt).getTime() + t.days * DAY);
	return at.getTime() > now.getTime() ? at : null;
}

/** XP che una quest darebbe ora a questo personaggio. */
export function questXp(c: Character, t: QuestTemplate): number {
	const base = QUEST_XP[t.grade - 1] * VERIFICATION_BONUS[t.verification];
	const below = t.grade < skillGrade(c.skills[t.skill] ?? 0);
	return Math.round(below ? base / 2 : base);
}

// ——— Quest di calibrazione degli attributi ———
// L'obiettivo si calcola dal valore dichiarato: chi si dichiara più forte riceve sfide più dure.

interface AttrQuestSpec {
	ref?: RefKey;
	/** Misura richiesta per il valore v (obiettivo appena sopra il valore attuale). */
	target: (v: number, p: Profile) => number;
	title: (n: number) => Text;
	description: (n: number) => Text;
	days: number;
}

const above = (v: number) => Math.min(20, v + 0.5);

export const ATTR_QUESTS: Record<AttributeId, AttrQuestSpec> = {
	forza: {
		ref: 'pushups', days: 7,
		target: (v, p) => Math.max(2, Math.round(unscale(above(v), refs(p).pushups))),
		title: (n) => ({ it: `${n} flessioni di fila`, en: `${n} push-ups in a row` }),
		description: (n) => ({ it: `Entro una settimana, fai ${n} flessioni consecutive con buona tecnica.`, en: `Within a week, do ${n} consecutive push-ups with good form.` })
	},
	resistenza: {
		ref: 'walkMinutes', days: 7,
		target: (v, p) => Math.max(5, Math.round(unscale(above(v), refs(p).walkMinutes) / 5) * 5),
		title: (n) => ({ it: `${n} minuti senza fermarti`, en: `${n} minutes non-stop` }),
		description: (n) => ({ it: `Cammina o corri per ${n} minuti senza fermarti.`, en: `Walk or run for ${n} minutes without stopping.` })
	},
	destrezza: {
		ref: 'balanceSeconds', days: 7,
		target: (v, p) => Math.max(3, Math.round(unscale(above(v), refs(p).balanceSeconds))),
		title: (n) => ({ it: `Equilibrio per ${n} secondi`, en: `Balance for ${n} seconds` }),
		description: (n) => ({ it: `Stai su una gamba a occhi chiusi per ${n} secondi, su entrambe le gambe.`, en: `Stand on one leg with eyes closed for ${n} seconds, on both legs.` })
	},
	intelletto: {
		ref: 'studyHours', days: 7,
		target: (v, p) => Math.max(1, Math.round(unscale(above(v), refs(p).studyHours))),
		title: (n) => ({ it: `${n} ore di studio`, en: `${n} hours of study` }),
		description: (n) => ({ it: `Questa settimana dedica ${n} ore a studio o lettura concentrata, senza distrazioni.`, en: `This week spend ${n} hours on focused study or reading, without distractions.` })
	},
	equilibrio: {
		days: 7,
		target: (v) => Math.max(3, Math.min(7, Math.round(3 + (v - 4) / 3))),
		title: (n) => ({ it: `${n} notti di buon sonno`, en: `${n} nights of good sleep` }),
		description: (n) => ({ it: `Dormi almeno 7 ore e spegni gli schermi 30 minuti prima, per ${n} notti su 7.`, en: `Sleep at least 7 hours and switch off screens 30 minutes before, on ${n} of 7 nights.` })
	},
	empatia: {
		ref: 'talksWeek', days: 7,
		target: (v, p) => Math.max(1, Math.round(unscale(above(v), refs(p).talksWeek))),
		title: (n) => ({ it: `${n} conversazioni vere`, en: `${n} real conversations` }),
		description: (n) => ({ it: `Questa settimana fai ${n} conversazioni significative, ascoltando più di quanto parli.`, en: `This week have ${n} meaningful conversations, listening more than you talk.` })
	}
};

export function attributeQuest(c: Character, a: AttributeId): { title: Text; description: Text; days: number; target: number } {
	const spec = ATTR_QUESTS[a];
	const n = spec.target(c.attributes[a].value, c.profile);
	return { title: spec.title(n), description: spec.description(n), days: spec.days, target: n };
}

/** Data da cui la sfida di calibrazione torna disponibile dopo un successo (null = già disponibile). */
export function attributeNextAvailableAt(c: Character, a: AttributeId, now = new Date()): Date | null {
	const last = c.quests.filter((q) => q.skill === `attr:${a}` && q.status === 'done').at(-1);
	if (!last) return null;
	const at = new Date(new Date(last.startedAt).getTime() + ATTR_QUESTS[a].days * DAY);
	return at.getTime() > now.getTime() ? at : null;
}

export function availableAttributeQuests(c: Character, now = new Date()): AttributeId[] {
	const active = new Set(activeQuests(c).map((q) => q.skill));
	return ATTRIBUTES.filter((a) => !active.has(`attr:${a}`) && !attributeNextAvailableAt(c, a, now));
}

// ——— Azioni ———

let counter = 0;
const newRunId = (now: Date) => `${now.getTime().toString(36)}-${(counter++).toString(36)}`;

export class RuleError extends Error {}

export function startSkillQuest(c: Character, questId: string, now = new Date()): Character {
	if (activeQuests(c).length >= MAX_ACTIVE_QUESTS) throw new RuleError('max_active');
	const t = availableSkillQuests(c, now).find((q) => q.id === questId);
	if (!t) throw new RuleError('not_available');
	if (t.verification === 'peer') throw new RuleError('needs_peers');
	const run: QuestRun = {
		runId: newRunId(now), questId: t.id, skill: t.skill, title: t.title, description: t.description,
		startedAt: iso(now), dueAt: iso(new Date(now.getTime() + t.days * DAY)), status: 'active',
		xp: questXp(c, t)
	};
	return { ...c, quests: [...c.quests, run] };
}

export function startAttributeQuest(c: Character, a: AttributeId, now = new Date()): Character {
	if (activeQuests(c).length >= MAX_ACTIVE_QUESTS) throw new RuleError('max_active');
	if (!availableAttributeQuests(c, now).includes(a)) throw new RuleError('not_available');
	const aq = attributeQuest(c, a);
	const run: QuestRun = {
		runId: newRunId(now), questId: `attr:${a}`, skill: `attr:${a}`, title: aq.title, description: aq.description,
		startedAt: iso(now), dueAt: iso(new Date(now.getTime() + aq.days * DAY)), status: 'active',
		xp: 30, calibratedOn: c.attributes[a].value
	};
	return { ...c, quests: [...c.quests, run] };
}

const round1 = (x: number) => Math.round(x * 10) / 10;

/** Margine dopo la scadenza per segnare una quest come fatta (chi la registra il giorno dopo). */
export const GRACE_DAYS = 1;

export function completeQuest(c: Character, runId: string, now = new Date()): Character {
	const run = c.quests.find((q) => q.runId === runId && q.status === 'active');
	if (!run) throw new RuleError('not_active');
	// Fuori tempo massimo la sfida non conta: "scrivi 10 righe questa settimana" vale solo entro la settimana.
	if (now.getTime() > new Date(run.dueAt).getTime() + GRACE_DAYS * DAY) throw new RuleError('overdue');
	const quests = c.quests.map((q) => (q.runId === runId ? { ...q, status: 'done' as const, closedAt: iso(now) } : q));
	let { skills, attributes } = c;
	if (run.skill.startsWith('attr:')) {
		const a = run.skill.slice(5) as AttributeId;
		const cur = attributes[a];
		// Crescita decrescente: più sei in alto, più è lento salire. Mai oltre 20.
		const gain = Math.max(0.1, 0.4 * (1 - cur.value / 25));
		const value = round1(Math.min(20, cur.value + gain));
		attributes = { ...attributes, [a]: { ...cur, value, failStreak: 0, history: [...cur.history, { at: iso(now), value, reason: 'quest' as const }] } };
	} else {
		skills = { ...skills, [run.skill]: (skills[run.skill] ?? 0) + run.xp };
	}
	return { ...c, quests, skills, attributes };
}

/**
 * Sfida non riuscita. Nessuna punizione in XP, ma dopo 3 fallimenti di fila su un attributo
 * il valore scende di 1: la scheda si riallinea da sola alla persona reale.
 */
export function failQuest(c: Character, runId: string, now = new Date()): Character {
	const run = c.quests.find((q) => q.runId === runId && q.status === 'active');
	if (!run) throw new RuleError('not_active');
	const quests = c.quests.map((q) => (q.runId === runId ? { ...q, status: 'failed' as const, closedAt: iso(now) } : q));
	let { attributes } = c;
	if (run.skill.startsWith('attr:')) {
		const a = run.skill.slice(5) as AttributeId;
		const cur = attributes[a];
		const streak = cur.failStreak + 1;
		if (streak >= FAILS_BEFORE_RECALIBRATION) {
			const value = round1(Math.max(1, cur.value - 1));
			attributes = { ...attributes, [a]: { ...cur, value, failStreak: 0, history: [...cur.history, { at: iso(now), value, reason: 'failures' as const }] } };
		} else {
			attributes = { ...attributes, [a]: { ...cur, failStreak: streak } };
		}
	}
	return { ...c, quests, attributes };
}

export function abandonQuest(c: Character, runId: string, now = new Date()): Character {
	return { ...c, quests: c.quests.map((q) => (q.runId === runId && q.status === 'active' ? { ...q, status: 'abandoned' as const, closedAt: iso(now) } : q)) };
}

export function recalibrate(c: Character, values: Record<AttributeId, number>, now = new Date()): Character {
	const attributes = { ...c.attributes };
	for (const a of ATTRIBUTES) {
		const cur = attributes[a];
		attributes[a] = { ...cur, value: values[a], measured: values[a], failStreak: 0, history: [...cur.history, { at: iso(now), value: values[a], reason: 'recalibration' }] };
	}
	return { ...c, attributes, lastCalibrationAt: iso(now) };
}

export const recalibrationDue = (c: Character, now = new Date()) =>
	now.getTime() - new Date(c.lastCalibrationAt).getTime() > RECALIBRATION_DAYS * DAY;

export const isOverdue = (q: QuestRun, now = new Date()) => q.status === 'active' && new Date(q.dueAt).getTime() < now.getTime();
/** Scaduta anche oltre il margine: si può solo dichiarare non riuscita o abbandonare. */
export const isExpired = (q: QuestRun, now = new Date()) =>
	q.status === 'active' && new Date(q.dueAt).getTime() + GRACE_DAYS * DAY < now.getTime();
