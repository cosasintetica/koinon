// Koinon — modello dati. Tutto ciò che è qui vive solo sul dispositivo.

export type Lang = 'it' | 'en';
export type Text = Record<Lang, string>;

export const ATTRIBUTES = ['forza', 'resistenza', 'destrezza', 'intelletto', 'equilibrio', 'empatia'] as const;
export type AttributeId = (typeof ATTRIBUTES)[number];

export const BRANCHES = ['corpo', 'mente', 'creativita', 'relazioni', 'spirito', 'mestiere', 'comunita'] as const;
export type BranchId = (typeof BRANCHES)[number];

/** Gradi di un'abilità: 1 Novizio … 5 Maestro. */
export type Grade = 1 | 2 | 3 | 4 | 5;

export type Sex = 'm' | 'f' | 'x';

export interface Profile {
	age: number;
	sex: Sex;
	weightKg: number;
}

export interface Skill {
	id: string;
	branch: BranchId;
	name: Text;
}

export type Verification = 'self' | 'evidence' | 'peer';

export interface QuestTemplate {
	id: string;
	/** Abilità allenata, oppure `attr:<attributo>` per le quest di calibrazione. */
	skill: string;
	grade: Grade;
	title: Text;
	description: Text;
	days: number;
	verification: Verification;
}

export type QuestStatus = 'active' | 'done' | 'failed' | 'abandoned';

export interface QuestRun {
	runId: string;
	questId: string;
	skill: string;
	/** Titolo già risolto (le quest di attributo hanno numeri calcolati). */
	title: Text;
	description: Text;
	startedAt: string;
	dueAt: string;
	status: QuestStatus;
	closedAt?: string;
	xp: number;
	/** Per le quest di attributo: il valore su cui erano calibrate. */
	calibratedOn?: number;
}

export interface AttributeState {
	/** Valore attuale 1–20 (una cifra decimale). */
	value: number;
	/** Valore misurato all'ultima calibrazione. */
	measured: number;
	/** Sfide fallite consecutive su questo attributo. */
	failStreak: number;
	history: { at: string; value: number; reason: 'questionnaire' | 'recalibration' | 'quest' | 'failures' }[];
}

export interface Character {
	version: 1;
	name: string;
	createdAt: string;
	lastCalibrationAt: string;
	profile: Profile;
	attributes: Record<AttributeId, AttributeState>;
	/** XP per abilità. */
	skills: Record<string, number>;
	/** Abilità scelte come interessi (massimo 5). */
	focus: string[];
	quests: QuestRun[];
}

export type Answers = Record<string, number>;
