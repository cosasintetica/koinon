import type { Dict } from './index.svelte';

export const en: Dict = {
	tagline: 'You grow, we grow together',
	nav: { sheet: 'Sheet', quests: 'Quests', community: 'Community', settings: 'Settings' },
	home: {
		title: 'The character is you.',
		lead: 'A role-playing game for real life. Answer honestly, get challenges that fit you, actually grow. Then join your growth with everyone else\'s for goals no one reaches alone.',
		start: 'Create your character',
		continue: 'Back to your sheet',
		points: [
			['Cheating is pointless', 'Challenges are tuned to what you declare. Inflate yourself and you get impossible challenges and no growth.'],
			['No showcase', 'No friends, followers or likes. Only you see your sheet.'],
			['Stays on your phone', 'No account, no server. Your data never leaves this device.']
		],
		manifesto: 'Read the manifesto'
	},
	create: {
		step: 'Step',
		of: 'of',
		nameLabel: 'What do you want to call your character?',
		nameHelp: 'Your name or a nickname. Only you will see it.',
		profileTitle: 'Who you are',
		profileHelp: 'Used to compare you with people of your age and build, not with everyone.',
		age: 'Age',
		sex: 'Biological sex',
		sexes: { m: 'Male', f: 'Female', x: 'Prefer not to say' },
		weight: 'Weight (kg)',
		tooYoung: 'Koinon is meant for people aged 16 and over.',
		honesty: 'Answer honestly. An inflated value will give you challenges you cannot complete.',
		skip: 'Skip',
		next: 'Next',
		back: 'Back',
		focusTitle: 'What do you want to grow in?',
		focusHelp: 'Pick 1 to 5 skills. You can change them later.',
		locked: 'unlocks at level',
		resultTitle: 'Here is your character',
		resultHelp: 'These values describe you today. Everyone starts at level 1: only completed challenges raise it.',
		capped: 'Some answers go beyond what the questionnaire can measure: values were capped at 16. Beyond that you need certified proof.',
		confirm: 'Begin'
	},
	sheet: {
		level: 'Level',
		xp: 'XP',
		toNext: 'to next level',
		attributes: 'Attributes',
		skills: 'Skills',
		noSkills: 'No skills trained yet.',
		recalibrate: 'Three months have passed: retake the questionnaire to update your values.',
		scaleNote: '10 = average for age and sex · 20 = human peak',
		history: 'Progress'
	},
	quests: {
		active: 'In progress',
		none: 'No quests in progress. Pick one below.',
		max: 'You already have 3 quests in progress. Finish one before starting another.',
		attrTitle: 'Calibration challenges',
		attrHelp: 'Tuned to your values. Fail 3 times in a row and the value drops by 1.',
		skillTitle: 'Quests for your skills',
		skillEmpty: 'You have completed every quest available for now. Add a skill in settings.',
		start: 'Accept',
		done: 'Done',
		failed: "I didn't make it",
		abandon: 'Abandon',
		due: 'Due',
		overdue: 'Overdue',
		verification: { self: 'On trust', evidence: 'With proof', peer: 'Certified by 3 people' },
		peerLocked: 'Certified quests arrive with the community (Phase 2).',
		cooldown: 'available again from',
		repeat: 'Repeat earlier-grade quests (half XP)',
		nextGrade: 'Next grade',
		completed: 'Completed',
		days: 'days',
		honestyReminder: 'Only mark "Done" if you really did it. The only person you would fool is you.'
	},
	community: {
		title: 'The Great Works',
		lead: 'Goals too big for one person, broken into concrete contributions. They arrive in Phase 2, together with guilds and peer certification.',
		example: 'Example: helping cure cancer',
		branches: [
			['Donate', 'Blood, plasma, joining the bone marrow donor registry.'],
			['Compute', 'Lend your computer to projects like Folding@home.'],
			['Classify', 'Analyse research images on citizen science platforms like Zooniverse.'],
			['Study', 'Mind branch paths towards biology, medicine, statistics.'],
			['Support', 'Fundraising only for verified non-profit research bodies.']
		],
		scales: 'Four scales: neighbourhood, city, nation, Great Work.',
		noFriends: 'No friends, no followers: people meet inside quests, around a goal.'
	},
	settings: {
		language: 'Language',
		focus: 'Skills you are growing',
		data: 'Your data',
		dataHelp: 'Everything is stored only on this device. You can download a copy or delete it.',
		export: 'Download a copy',
		import: 'Load a copy',
		reset: 'Delete everything',
		resetConfirm: 'Delete the character from this device? This cannot be undone.',
		recalibrate: 'Retake the questionnaire',
		about: 'Koinon is open source (AGPL-3.0). No ads, no tracking.',
		saved: 'Saved'
	},
	errors: { max_active: 'You already have 3 quests in progress.', not_available: 'Quest not available.', needs_peers: 'Needs community certification.', not_active: 'Quest not active.' }
};
