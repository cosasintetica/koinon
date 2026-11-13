import { describe, expect, it } from 'vitest';
import { computeAttributes, scale, unscale, refs, SELF_REPORT_CAP, estimateOneRepMax } from './scoring';
import {
	createCharacter, startAttributeQuest, startSkillQuest, completeQuest, failQuest, level, skillGrade,
	attributeQuest, availableSkillQuests, MAX_ACTIVE_QUESTS, RuleError, totalXp, levelFromXp, isBranchUnlocked
} from './engine';
import type { Profile, AttributeId } from './types';

const p: Profile = { age: 30, sex: 'm', weightKg: 75 };
const avg = { forza: 10, resistenza: 10, destrezza: 10, intelletto: 10, equilibrio: 10, empatia: 10 } as Record<AttributeId, number>;

describe('scala', () => {
	const r = { floor: 1, median: 20, record: 120 };
	it('la mediana vale 10, il record 20, il minimo 1', () => {
		expect(scale(20, r)).toBeCloseTo(10);
		expect(scale(120, r)).toBeCloseTo(20);
		expect(scale(1, r)).toBe(1);
		expect(scale(10_000, r)).toBe(20);
	});
	it('unscale è l\'inversa di scale', () => {
		for (const v of [2, 5, 9.5, 10, 13, 19]) expect(scale(unscale(v, r), r)).toBeCloseTo(v);
	});
	it('il massimale stimato con Epley cresce con le ripetizioni', () => {
		expect(estimateOneRepMax(100, 1)).toBeCloseTo(103.33, 1);
		expect(estimateOneRepMax(100, 30)).toBeCloseTo(140); // limitato a 12 ripetizioni
	});
});

describe('questionario', () => {
	it('un adulto nella media ottiene circa 10', () => {
		const { values } = computeAttributes({ pushups: refs(p).pushups.median, walk_min: 45, stairs: 5, balance: 25, reach: 10, study_h: 3, books: 5, logic_seq: 1, logic_bat: 0, talks: 6, helps: 3, listen: 2 }, p);
		expect(values.forza).toBeCloseTo(10, 0);
		expect(values.resistenza).toBeCloseTo(10, 0);
		expect(values.intelletto).toBeCloseTo(10, 0);
	});
	it('chi dichiara valori da record viene fermato al tetto e segnalato', () => {
		const { values, flags } = computeAttributes({ pushups: 10_000, walk_min: 5000, stairs: 999 }, p);
		expect(values.forza).toBe(SELF_REPORT_CAP);
		expect(values.resistenza).toBe(SELF_REPORT_CAP);
		expect(flags.some((f) => f.kind === 'above_record')).toBe(true);
		expect(flags.some((f) => f.kind === 'capped')).toBe(true);
	});
	it('le risposte mancanti danno un valore prudente, non alto', () => {
		const { values } = computeAttributes({}, p);
		for (const v of Object.values(values)) expect(v).toBe(5);
	});
	it('a parità di flessioni, chi è più anziano ottiene un valore più alto', () => {
		const young = computeAttributes({ pushups: 15 }, p).values.forza;
		const old = computeAttributes({ pushups: 15 }, { ...p, age: 65 }).values.forza;
		expect(old).toBeGreaterThan(young);
	});
});

describe('barare non conviene', () => {
	it('chi dichiara più forza riceve una sfida più dura', () => {
		const honest = createCharacter('A', p, { ...avg, forza: 8 }, []);
		const liar = createCharacter('B', p, { ...avg, forza: 16 }, []);
		expect(attributeQuest(liar, 'forza').target).toBeGreaterThan(attributeQuest(honest, 'forza').target * 3);
	});
	it('il livello parte da 1 per tutti, qualunque valore si dichiari', () => {
		const liar = createCharacter('B', p, { forza: 16, resistenza: 16, destrezza: 16, intelletto: 16, equilibrio: 16, empatia: 16 }, []);
		expect(level(liar)).toBe(1);
		expect(totalXp(liar)).toBe(0);
	});
	it('tre fallimenti di fila abbassano il valore di 1', () => {
		let c = createCharacter('B', p, { ...avg, forza: 16 }, []);
		for (let i = 0; i < 3; i++) {
			c = startAttributeQuest(c, 'forza');
			const run = c.quests.at(-1)!;
			c = failQuest(c, run.runId);
		}
		expect(c.attributes.forza.value).toBe(15);
		expect(c.attributes.forza.history.at(-1)?.reason).toBe('failures');
	});
	it('un successo azzera la serie di fallimenti e fa salire poco il valore', () => {
		let c = createCharacter('A', p, avg, []);
		c = startAttributeQuest(c, 'forza');
		c = failQuest(c, c.quests.at(-1)!.runId);
		c = startAttributeQuest(c, 'forza');
		c = completeQuest(c, c.quests.at(-1)!.runId);
		expect(c.attributes.forza.failStreak).toBe(0);
		expect(c.attributes.forza.value).toBeCloseTo(10.2, 1);
	});
	it('una sfida di calibrazione riuscita si ripete solo dopo una settimana', () => {
		const day = (d: number) => new Date(Date.UTC(2026, 0, d));
		let c = createCharacter('A', p, avg, []);
		c = startAttributeQuest(c, 'forza', day(1));
		c = completeQuest(c, c.quests.at(-1)!.runId, day(2));
		expect(() => startAttributeQuest(c, 'forza', day(3))).toThrow(RuleError);
		expect(() => startAttributeQuest(c, 'forza', day(8))).not.toThrow();
	});
});

describe('quest e livelli', () => {
	it('al massimo tre quest attive', () => {
		let c = createCharacter('A', p, avg, ['scrittura', 'corsa', 'cucina', 'lingue']);
		for (const id of ['scrittura-1', 'corsa-1', 'cucina-1']) c = startSkillQuest(c, id);
		expect(c.quests.filter((q) => q.status === 'active')).toHaveLength(MAX_ACTIVE_QUESTS);
		expect(() => startSkillQuest(c, 'lingue-1')).toThrow(RuleError);
	});
	it('un Novizio vede solo le quest del primo grado', () => {
		const c = createCharacter('A', p, avg, ['scrittura']);
		expect(new Set(availableSkillQuests(c).map((q) => q.grade))).toEqual(new Set([1]));
	});
	it('completare quest fa salire grado e livello', () => {
		let c = createCharacter('A', p, avg, ['scrittura']);
		c = startSkillQuest(c, 'scrittura-1');
		c = completeQuest(c, c.quests.at(-1)!.runId);
		expect(c.skills.scrittura).toBe(20);
		expect(level(c)).toBe(1);
		expect(levelFromXp(50)).toBe(2);
		expect(levelFromXp(800)).toBe(5);
	});
	it('le quest si ripetono finché non si sale di grado, poi sotto grado valgono metà', () => {
		let c = createCharacter('A', p, avg, ['scrittura']);
		const week = (i: number) => new Date(Date.UTC(2026, 0, 1 + 7 * i));
		for (let i = 0; i < 5; i++) {
			c = startSkillQuest(c, 'scrittura-1', week(i));
			c = completeQuest(c, c.quests.at(-1)!.runId, week(i));
		}
		expect(c.skills.scrittura).toBe(100);
		expect(skillGrade(c.skills.scrittura)).toBe(2);
		expect(new Set(availableSkillQuests(c).map((q) => q.grade))).toEqual(new Set([1, 2]));
		expect(availableSkillQuests(c)[0].grade).toBe(2);
		c = startSkillQuest(c, 'scrittura-1', week(5));
		expect(c.quests.at(-1)!.xp).toBe(10);
	});
	it('una quest settimanale si ripete solo dopo una settimana', () => {
		const day = (d: number) => new Date(Date.UTC(2026, 0, d));
		let c = createCharacter('A', p, avg, ['scrittura']);
		c = startSkillQuest(c, 'scrittura-1', day(1));
		c = completeQuest(c, c.quests.at(-1)!.runId, day(2));
		expect(() => startSkillQuest(c, 'scrittura-1', day(3))).toThrow(RuleError);
		expect(() => startSkillQuest(c, 'scrittura-1', day(8))).not.toThrow();
	});
	it('una quest scaduta oltre il giorno di margine non si può segnare come fatta', () => {
		const day = (d: number) => new Date(Date.UTC(2026, 0, d));
		let c = createCharacter('A', p, avg, ['scrittura']);
		c = startSkillQuest(c, 'scrittura-1', day(1));
		const id = c.quests.at(-1)!.runId;
		expect(() => completeQuest(c, id, day(10))).toThrow(RuleError);
		expect(() => completeQuest(c, id, day(8))).not.toThrow();
		expect(() => failQuest(c, id, day(10))).not.toThrow();
	});
	it('senza certificazione si resta al massimo Praticante', () => {
		expect(skillGrade(5000)).toBe(3);
	});
	it('il ramo Comunità si sblocca al livello 5', () => {
		const c = createCharacter('A', p, avg, ['volontariato']);
		expect(isBranchUnlocked(c, 'volontariato')).toBe(false);
		expect(availableSkillQuests(c)).toHaveLength(0);
	});
});

describe('catalogo', () => {
	it('id unici, abilità esistenti, testi in due lingue', async () => {
		const { QUESTS } = await import('#lib/data/quests.ts');
		const { SKILLS } = await import('#lib/data/skills.ts');
		const ids = new Set(QUESTS.map((q) => q.id));
		expect(ids.size).toBe(QUESTS.length);
		expect(QUESTS.length).toBeGreaterThanOrEqual(150);
		for (const q of QUESTS) {
			expect(SKILLS.some((s) => s.id === q.skill)).toBe(true);
			expect(q.title.it && q.title.en && q.description.it && q.description.en).toBeTruthy();
		}
		// ogni abilità ha almeno una quest per i gradi 1, 2 e 3
		for (const s of SKILLS) for (const g of [1, 2, 3]) expect(QUESTS.some((q) => q.skill === s.id && q.grade === g)).toBe(true);
	});
});
