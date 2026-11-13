// Koinon — dal questionario agli attributi (scala 1–20).
//
// 10 = adulto medio della tua età e del tuo sesso; 20 = vertice umano documentato.
// La scala è logaritmica: ogni punto in più costa più del precedente.
// Fonti e livello di affidabilità di ogni valore: docs/riferimenti.md.

import type { Answers, AttributeId, Profile, Text } from './types';

/** Tetto dei valori ottenibili con il solo questionario. Oltre servono prove certificate. */
export const SELF_REPORT_CAP = 16;

export interface Ref {
	floor: number;
	median: number;
	record: number;
}

/** Converte una misura nella scala 1–20 (logaritmica, 10 = mediana). */
export function scale(x: number, r: Ref): number {
	if (!(x > r.floor)) return 1;
	if (x < r.median) return 1 + (9 * Math.log(x / r.floor)) / Math.log(r.median / r.floor);
	return Math.min(20, 10 + (10 * Math.log(x / r.median)) / Math.log(r.record / r.median));
}

/** Inversa di `scale`: la misura che corrisponde a un valore della scala. */
export function unscale(s: number, r: Ref): number {
	const v = Math.max(1, Math.min(20, s));
	if (v <= 10) return r.floor * Math.pow(r.median / r.floor, (v - 1) / 9);
	return r.median * Math.pow(r.record / r.median, (v - 10) / 10);
}

/** Valore da una tabella per fasce d'età: [età massima esclusa, valore]. */
const byAge = (age: number, table: [number, number][]) => (table.find(([max]) => age < max) ?? table.at(-1)!)[1];

/**
 * Flessioni consecutive, valore centrale della fascia "Good" delle norme canadesi CPAFLA
 * riprese dall'ACSM (uomini, flessioni complete). Per le donne con flessioni complete non
 * esiste una norma consolidata: la curva maschile è riscalata sulla media 20–29 anni (circa 11).
 */
const PUSHUPS_M: [number, number][] = [[30, 25], [40, 19], [50, 15], [60, 11], [Infinity, 9]];
const PUSHUPS_F: [number, number][] = [[30, 11], [40, 9], [50, 7], [60, 5], [Infinity, 4]];
/** Equilibrio su una gamba a occhi chiusi (Springer et al., 2007): dipende dall'età, non dal sesso. */
const BALANCE: [number, number][] = [[40, 12], [50, 11], [60, 7], [70, 4], [Infinity, 2.5]];

/** Calo fisiologico delle prestazioni fisiche dopo i 35 anni (circa 1% l'anno). */
export function ageFactor(age: number): number {
	return age <= 35 ? 1 : Math.max(0.45, 1 - 0.01 * (age - 35));
}

const sexMul = (p: Profile, m: number, f: number) => (p.sex === 'm' ? m : p.sex === 'f' ? f : (m + f) / 2);

/** Riferimenti per ogni misura, adattati alla persona. */
export function refs(p: Profile) {
	const a = ageFactor(p.age);
	return {
		// rapporto massimale stimato / peso corporeo (stacco da terra o squat)
		liftRatio: { floor: 0.15, median: sexMul(p, 1.25, 0.85) * a, record: sexMul(p, 4.5, 4.0) },
		pushups: { floor: 0.5, median: sexMul(p, byAge(p.age, PUSHUPS_M), byAge(p.age, PUSHUPS_F)), record: 120 },
		walkMinutes: { floor: 2, median: 45 * a, record: 1440 },
		stairFloors: { floor: 0.5, median: 5 * a, record: 200 },
		balanceSeconds: { floor: 0.5, median: byAge(p.age, BALANCE), record: 300 },
		studyHours: { floor: 0.2, median: 3, record: 60 },
		booksYear: { floor: 0.3, median: 4, record: 150 }, // mediana Pew Research (USA, 2016)
		talksWeek: { floor: 0.3, median: 6, record: 60 },
		helpsMonth: { floor: 0.3, median: 3, record: 60 }
	} satisfies Record<string, Ref>;
}

export type RefKey = keyof ReturnType<typeof refs>;

export interface Question {
	id: string;
	attribute: AttributeId;
	kind: 'number' | 'choice';
	prompt: Text;
	help?: Text;
	unit?: Text;
	min?: number;
	max?: number;
	/** Le domande facoltative si possono saltare (valore -1). */
	optional?: boolean;
	options?: { label: Text; value: number }[];
}

const likert = (lo: Text, hi: Text): Question['options'] => [
	{ label: lo, value: 0 },
	{ label: { it: 'Poco', en: 'A little' }, value: 1 },
	{ label: { it: 'Abbastanza', en: 'Somewhat' }, value: 2 },
	{ label: { it: 'Molto', en: 'A lot' }, value: 3 },
	{ label: hi, value: 4 }
];
const freq: Question['options'] = [
	{ label: { it: 'Mai', en: 'Never' }, value: 0 },
	{ label: { it: 'Quasi mai', en: 'Almost never' }, value: 1 },
	{ label: { it: 'A volte', en: 'Sometimes' }, value: 2 },
	{ label: { it: 'Spesso', en: 'Often' }, value: 3 },
	{ label: { it: 'Molto spesso', en: 'Very often' }, value: 4 }
];

export const QUESTIONS: Question[] = [
	// FORZA
	{
		id: 'lift_kg', attribute: 'forza', kind: 'number', min: 0, max: 500, optional: true,
		prompt: { it: 'Qual è il carico più pesante che sollevi da terra con buona tecnica?', en: 'What is the heaviest load you lift from the floor with good form?' },
		help: { it: 'Un peso che hai sollevato davvero di recente, non il tuo massimo teorico. Non provarlo adesso.', en: 'A weight you actually lifted recently, not a theoretical max. Do not test it now.' },
		unit: { it: 'kg', en: 'kg' }
	},
	{
		id: 'lift_reps', attribute: 'forza', kind: 'number', min: 1, max: 30, optional: true,
		prompt: { it: 'Per quante ripetizioni di fila?', en: 'For how many reps in a row?' },
		unit: { it: 'ripetizioni', en: 'reps' }
	},
	{
		id: 'pushups', attribute: 'forza', kind: 'number', min: 0, max: 300,
		prompt: { it: 'Quante flessioni riesci a fare di fila?', en: 'How many push-ups can you do in a row?' },
		help: { it: 'Puoi provarle ora. Sulle ginocchia valgono la metà.', en: 'You can try now. Knee push-ups count as half.' },
		unit: { it: 'flessioni', en: 'push-ups' }
	},
	// RESISTENZA
	{
		id: 'walk_min', attribute: 'resistenza', kind: 'number', min: 0, max: 1440,
		prompt: { it: 'Per quanti minuti riesci a camminare o correre senza fermarti?', en: 'How many minutes can you walk or run without stopping?' },
		unit: { it: 'minuti', en: 'minutes' }
	},
	{
		id: 'stairs', attribute: 'resistenza', kind: 'number', min: 0, max: 300,
		prompt: { it: 'Quanti piani di scale sali senza fermarti né restare senza fiato?', en: 'How many flights of stairs can you climb without stopping or losing your breath?' },
		unit: { it: 'piani', en: 'floors' }
	},
	// DESTREZZA
	{
		id: 'balance', attribute: 'destrezza', kind: 'number', min: 0, max: 600,
		prompt: { it: 'Per quanti secondi stai su una gamba sola a occhi chiusi?', en: 'How many seconds can you stand on one leg with your eyes closed?' },
		help: { it: 'Provalo ora vicino a un muro. Fai la media delle due gambe.', en: 'Try it now next to a wall. Average both legs.' },
		unit: { it: 'secondi', en: 'seconds' }
	},
	{
		id: 'reach', attribute: 'destrezza', kind: 'choice',
		prompt: { it: 'In piedi, gambe tese, piegandoti in avanti dove arrivi con le mani?', en: 'Standing, legs straight, bending forward: where do your hands reach?' },
		options: [
			{ label: { it: 'Sopra le ginocchia', en: 'Above the knees' }, value: 3 },
			{ label: { it: 'Alle ginocchia o agli stinchi', en: 'Knees or shins' }, value: 7 },
			{ label: { it: 'Alle caviglie', en: 'Ankles' }, value: 10 },
			{ label: { it: 'Tocco le punte dei piedi', en: 'I touch my toes' }, value: 12 },
			{ label: { it: 'Appoggio i palmi a terra', en: 'Palms flat on the floor' }, value: 15 }
		]
	},
	// INTELLETTO
	{
		id: 'study_h', attribute: 'intelletto', kind: 'number', min: 0, max: 100,
		prompt: { it: 'Quante ore a settimana dedichi a studio o lettura concentrata?', en: 'How many hours a week do you spend on focused study or reading?' },
		unit: { it: 'ore', en: 'hours' }
	},
	{
		id: 'books', attribute: 'intelletto', kind: 'number', min: 0, max: 300,
		prompt: { it: "Quanti libri hai letto nell'ultimo anno?", en: 'How many books did you read in the last year?' },
		unit: { it: 'libri', en: 'books' }
	},
	{
		id: 'logic_seq', attribute: 'intelletto', kind: 'choice',
		prompt: { it: 'Quale numero continua la serie 2, 6, 12, 20, …?', en: 'Which number continues 2, 6, 12, 20, …?' },
		options: [
			{ label: { it: '28', en: '28' }, value: 0 },
			{ label: { it: '30', en: '30' }, value: 1 },
			{ label: { it: '32', en: '32' }, value: 0 },
			{ label: { it: 'Non lo so', en: "I don't know" }, value: 0 }
		]
	},
	{
		id: 'logic_bat', attribute: 'intelletto', kind: 'choice',
		prompt: { it: 'Una mazza e una palla costano 1,10 € in tutto. La mazza costa 1 € più della palla. Quanto costa la palla?', en: 'A bat and a ball cost €1.10 in total. The bat costs €1 more than the ball. How much is the ball?' },
		options: [
			{ label: { it: '10 centesimi', en: '10 cents' }, value: 0 },
			{ label: { it: '5 centesimi', en: '5 cents' }, value: 1 },
			{ label: { it: '1 centesimo', en: '1 cent' }, value: 0 },
			{ label: { it: 'Non lo so', en: "I don't know" }, value: 0 }
		]
	},
	// EQUILIBRIO
	{
		id: 'sleep_h', attribute: 'equilibrio', kind: 'number', min: 0, max: 16,
		prompt: { it: 'Quante ore dormi in una notte normale?', en: 'How many hours do you sleep on a normal night?' },
		unit: { it: 'ore', en: 'hours' }
	},
	{
		id: 'sleep_q', attribute: 'equilibrio', kind: 'choice',
		prompt: { it: 'Al risveglio ti senti riposato?', en: 'Do you wake up feeling rested?' },
		options: likert({ it: 'Per niente', en: 'Not at all' }, { it: 'Del tutto', en: 'Completely' })
	},
	{
		id: 'stress_control', attribute: 'equilibrio', kind: 'choice',
		prompt: { it: "Nell'ultimo mese, quanto spesso ti sei sentito incapace di controllare le cose importanti della tua vita?", en: 'In the last month, how often did you feel unable to control the important things in your life?' },
		options: freq
	},
	{
		id: 'stress_overwhelm', attribute: 'equilibrio', kind: 'choice',
		prompt: { it: "Nell'ultimo mese, quanto spesso le difficoltà si sono accumulate tanto da non riuscire a superarle?", en: 'In the last month, how often did difficulties pile up so high you could not overcome them?' },
		options: freq
	},
	// EMPATIA
	{
		id: 'talks', attribute: 'empatia', kind: 'number', min: 0, max: 200,
		prompt: { it: 'Quante conversazioni significative (non solo di lavoro o di servizio) hai in una settimana?', en: 'How many meaningful conversations (not just work or errands) do you have in a week?' },
		unit: { it: 'conversazioni', en: 'conversations' }
	},
	{
		id: 'helps', attribute: 'empatia', kind: 'number', min: 0, max: 200,
		prompt: { it: "Quante volte nell'ultimo mese hai aiutato qualcuno senza che te lo chiedesse?", en: 'How many times in the last month did you help someone without being asked?' },
		unit: { it: 'volte', en: 'times' }
	},
	{
		id: 'listen', attribute: 'empatia', kind: 'choice',
		prompt: { it: 'Quando qualcuno ti parla di un problema, quanto spesso ascolti fino in fondo prima di dare consigli?', en: 'When someone tells you about a problem, how often do you listen fully before giving advice?' },
		options: freq
	}
];

export interface Flag {
	question: string;
	kind: 'above_record' | 'capped';
}

const has = (a: Answers, id: string) => typeof a[id] === 'number' && a[id] >= 0;
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN);
const round1 = (x: number) => Math.round(x * 10) / 10;

/** Stima del massimale (formula di Epley), con ripetizioni limitate a 12 per affidabilità. */
export function estimateOneRepMax(kg: number, reps: number): number {
	return kg * (1 + Math.min(12, Math.max(1, reps)) / 30);
}

/** Valore 0–20 per il sonno: ottimo tra 7 e 9 ore. */
function sleepScore(h: number): number {
	if (h >= 7 && h <= 9) return 14;
	const dist = h < 7 ? 7 - h : h - 9;
	return Math.max(2, 14 - dist * 3.5);
}

/** Da 0..4 (scala Likert) a 2..15. */
const likertScore = (v: number) => 2 + (13 * v) / 4;

export function computeAttributes(answers: Answers, p: Profile): { values: Record<AttributeId, number>; flags: Flag[] } {
	const r = refs(p);
	const flags: Flag[] = [];
	const m = (id: string, x: number, ref: Ref) => {
		if (x > ref.record) flags.push({ question: id, kind: 'above_record' });
		return scale(Math.min(x, ref.record), ref);
	};

	const forza: number[] = [];
	if (has(answers, 'lift_kg') && answers.lift_kg > 0 && p.weightKg > 0) {
		const orm = estimateOneRepMax(answers.lift_kg, has(answers, 'lift_reps') ? answers.lift_reps : 1);
		forza.push(m('lift_kg', orm / p.weightKg, r.liftRatio));
	}
	if (has(answers, 'pushups')) forza.push(m('pushups', answers.pushups, r.pushups));

	const resistenza: number[] = [];
	if (has(answers, 'walk_min')) resistenza.push(m('walk_min', answers.walk_min, r.walkMinutes));
	if (has(answers, 'stairs')) resistenza.push(m('stairs', answers.stairs, r.stairFloors));

	const destrezza: number[] = [];
	if (has(answers, 'balance')) destrezza.push(m('balance', answers.balance, r.balanceSeconds));
	if (has(answers, 'reach')) destrezza.push(answers.reach);

	const intelletto: number[] = [];
	if (has(answers, 'study_h')) intelletto.push(m('study_h', answers.study_h, r.studyHours));
	if (has(answers, 'books')) intelletto.push(m('books', answers.books, r.booksYear));
	const logic = (answers.logic_seq ?? 0) + (answers.logic_bat ?? 0); // 0..2

	const equilibrio: number[] = [];
	if (has(answers, 'sleep_h')) equilibrio.push(sleepScore(answers.sleep_h));
	if (has(answers, 'sleep_q')) equilibrio.push(likertScore(answers.sleep_q));
	if (has(answers, 'stress_control')) equilibrio.push(likertScore(4 - answers.stress_control));
	if (has(answers, 'stress_overwhelm')) equilibrio.push(likertScore(4 - answers.stress_overwhelm));

	const empatia: number[] = [];
	if (has(answers, 'talks')) empatia.push(m('talks', answers.talks, r.talksWeek));
	if (has(answers, 'helps')) empatia.push(m('helps', answers.helps, r.helpsMonth));
	if (has(answers, 'listen')) empatia.push(likertScore(answers.listen));

	const raw: Record<AttributeId, number> = {
		forza: mean(forza),
		resistenza: mean(resistenza),
		destrezza: mean(destrezza),
		intelletto: mean(intelletto) + (logic - 1), // da -1 a +1
		equilibrio: mean(equilibrio),
		empatia: mean(empatia)
	};

	const values = {} as Record<AttributeId, number>;
	for (const [k, v] of Object.entries(raw) as [AttributeId, number][]) {
		const val = Number.isFinite(v) ? v : 5; // nessuna risposta: valore prudente
		if (val > SELF_REPORT_CAP) flags.push({ question: k, kind: 'capped' });
		values[k] = round1(Math.max(1, Math.min(SELF_REPORT_CAP, val)));
	}
	return { values, flags };
}
