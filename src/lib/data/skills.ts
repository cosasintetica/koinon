import type { AttributeId, BranchId, Skill, Text } from '#lib/model/types.ts';

export const BRANCH_INFO: Record<BranchId, { name: Text; attribute?: AttributeId; unlockLevel: number }> = {
	corpo: { name: { it: 'Corpo', en: 'Body' }, attribute: 'forza', unlockLevel: 1 },
	mente: { name: { it: 'Mente', en: 'Mind' }, attribute: 'intelletto', unlockLevel: 1 },
	creativita: { name: { it: 'Creatività', en: 'Creativity' }, unlockLevel: 1 },
	relazioni: { name: { it: 'Relazioni', en: 'Relationships' }, attribute: 'empatia', unlockLevel: 1 },
	spirito: { name: { it: 'Spirito', en: 'Spirit' }, attribute: 'equilibrio', unlockLevel: 1 },
	mestiere: { name: { it: 'Mestiere', en: 'Craft' }, unlockLevel: 1 },
	comunita: { name: { it: 'Comunità', en: 'Community' }, unlockLevel: 5 }
};

export const ATTRIBUTE_NAMES: Record<AttributeId, Text> = {
	forza: { it: 'Forza', en: 'Strength' },
	resistenza: { it: 'Resistenza', en: 'Endurance' },
	destrezza: { it: 'Destrezza', en: 'Dexterity' },
	intelletto: { it: 'Intelletto', en: 'Intellect' },
	equilibrio: { it: 'Equilibrio', en: 'Balance' },
	empatia: { it: 'Empatia', en: 'Empathy' }
};

export const GRADE_NAMES: Text[] = [
	{ it: 'Novizio', en: 'Novice' },
	{ it: 'Apprendista', en: 'Apprentice' },
	{ it: 'Praticante', en: 'Practitioner' },
	{ it: 'Esperto', en: 'Expert' },
	{ it: 'Maestro', en: 'Master' }
];

const s = (id: string, branch: BranchId, it: string, en: string): Skill => ({ id, branch, name: { it, en } });

export const SKILLS: Skill[] = [
	s('corsa', 'corpo', 'Corsa', 'Running'),
	s('mobilita', 'corpo', 'Mobilità e yoga', 'Mobility and yoga'),
	s('forza_corpo', 'corpo', 'Allenamento a corpo libero', 'Bodyweight training'),
	s('lingue', 'mente', 'Lingue straniere', 'Foreign languages'),
	s('informatica', 'mente', 'Informatica', 'Computing'),
	s('scienze', 'mente', 'Scienze', 'Science'),
	s('scrittura', 'creativita', 'Scrittura', 'Writing'),
	s('disegno', 'creativita', 'Disegno e pittura', 'Drawing and painting'),
	s('musica', 'creativita', 'Musica', 'Music'),
	s('comunicazione', 'relazioni', 'Comunicazione', 'Communication'),
	s('ascolto', 'relazioni', 'Ascolto', 'Listening'),
	s('insegnamento', 'relazioni', 'Insegnamento', 'Teaching'),
	s('meditazione', 'spirito', 'Meditazione', 'Meditation'),
	s('sonno', 'spirito', 'Sonno e riposo', 'Sleep and rest'),
	s('emozioni', 'spirito', 'Gestione delle emozioni', 'Emotional skills'),
	s('cucina', 'mestiere', 'Cucina', 'Cooking'),
	s('riparazioni', 'mestiere', 'Riparazioni', 'Repairs'),
	s('finanza', 'mestiere', 'Finanza personale', 'Personal finance'),
	s('volontariato', 'comunita', 'Volontariato', 'Volunteering'),
	s('organizzazione', 'comunita', 'Organizzazione di eventi', 'Organising events'),
	s('primo_soccorso', 'comunita', 'Primo soccorso', 'First aid')
];

export const skillById = (id: string) => SKILLS.find((k) => k.id === id);
