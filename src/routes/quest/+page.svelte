<script lang="ts">
	import { goto } from '$app/navigation';
	import { game, act } from '#lib/store.svelte.ts';
	import { tx, ui, i18n } from '#lib/i18n/index.svelte.ts';
	import {
		availableSkillQuests, availableAttributeQuests, attributeQuest, startSkillQuest, startAttributeQuest,
		completeQuest, failQuest, abandonQuest, isOverdue, MAX_ACTIVE_QUESTS, questXp, skillGrade, isBranchUnlocked, nextAvailableAt
	} from '#lib/model/engine.ts';
	import { ATTRIBUTE_NAMES, GRADE_NAMES, skillById } from '#lib/data/skills.ts';
	import type { Character, QuestTemplate } from '#lib/model/types.ts';
	import { QUESTS } from '#lib/data/quests.ts';

	$effect(() => { if (!game.character) goto('#/'); });

	const c = $derived(game.character!);
	const active = $derived(c ? c.quests.filter((q) => q.status === 'active') : []);
	const done = $derived(c ? c.quests.filter((q) => q.status === 'done').slice(-8).reverse() : []);
	const full = $derived(active.length >= MAX_ACTIVE_QUESTS);
	/** Quest raggruppate per abilità: grado attuale in vista, gradi precedenti da ripetere, anteprima del prossimo grado. */
	const groups = $derived.by(() => {
		if (!c) return [];
		const avail = availableSkillQuests(c);
		return c.focus.filter((id) => isBranchUnlocked(c, id)).map((skill) => {
			const grade = skillGrade(c.skills[skill] ?? 0);
			const mine = avail.filter((t) => t.skill === skill);
			return {
				skill, grade,
				current: mine.filter((t) => t.grade === grade),
				lower: mine.filter((t) => t.grade < grade),
				next: QUESTS.find((t) => t.skill === skill && t.grade === grade + 1),
				resting: QUESTS.filter((t) => t.skill === skill && t.grade === grade)
					.map((t) => ({ t, at: nextAvailableAt(c, t) }))
					.filter((r): r is { t: QuestTemplate; at: Date } => r.at !== null)
			};
		});
	});
	let error = $state('');

	async function run(fn: (c: Character) => Character) {
		const e = await act(fn);
		error = e ? (ui().errors as Record<string, string>)[e] ?? e : '';
	}
	const date = (iso: string) => new Date(iso).toLocaleDateString(i18n.lang, { day: 'numeric', month: 'long' });
	const label = (skill: string) =>
		skill.startsWith('attr:') ? tx(ATTRIBUTE_NAMES[skill.slice(5) as keyof typeof ATTRIBUTE_NAMES]) : tx(skillById(skill)?.name ?? { it: skill, en: skill });
</script>

{#if c}
	<div class="stack">
		<section class="stack">
			<h2>{ui().quests.active} <span class="muted num">{active.length}/{MAX_ACTIVE_QUESTS}</span></h2>
			{#if active.length === 0}<p class="muted">{ui().quests.none}</p>{/if}
			{#each active as q (q.runId)}
				<article class="card quest active">
					<div class="spread">
						<span class="pill">{label(q.skill)}</span>
						<span class="small num" class:overdue={isOverdue(q)}>{isOverdue(q) ? ui().quests.overdue : `${ui().quests.due} ${date(q.dueAt)}`}</span>
					</div>
					<h3>{tx(q.title)}</h3>
					<p class="muted">{tx(q.description)}</p>
					<div class="row">
						<button onclick={() => run((x) => completeQuest(x, q.runId))}>{ui().quests.done} · +{q.xp} XP</button>
						<button class="ghost" onclick={() => run((x) => failQuest(x, q.runId))}>{ui().quests.failed}</button>
						{#if !q.skill.startsWith('attr:')}<button class="quiet" onclick={() => run((x) => abandonQuest(x, q.runId))}>{ui().quests.abandon}</button>{/if}
					</div>
				</article>
			{/each}
			{#if active.length}<p class="small muted">{ui().quests.honestyReminder}</p>{/if}
			{#if error}<p class="notice">{error}</p>{/if}
		</section>

		<section class="stack">
			<h2>{ui().quests.skillTitle}</h2>
			{#if full}<p class="notice">{ui().quests.max}</p>{/if}
			{#snippet card(t: QuestTemplate)}
				<article class="card quest">
					<div class="spread">
						<span class="pill grey">{tx(GRADE_NAMES[t.grade - 1])}</span>
						<span class="small muted">{t.days} {ui().quests.days} · {ui().quests.verification[t.verification]}</span>
					</div>
					<h3>{tx(t.title)}</h3>
					<p class="muted">{tx(t.description)}</p>
					<button class="ghost" disabled={full} onclick={() => run((x) => startSkillQuest(x, t.id))}>
						{ui().quests.start} · +{questXp(c, t)} XP
					</button>
				</article>
			{/snippet}
			{#each groups as g (g.skill)}
				<div class="group stack">
					<h3 class="skillname">{label(g.skill)} <span class="small muted">· {tx(GRADE_NAMES[g.grade - 1])}</span></h3>
					{#each g.current as t (t.id)}{@render card(t)}{/each}
					{#each g.resting as r (r.t.id)}
						<p class="small muted">{tx(r.t.title)}: {ui().quests.cooldown} {date(r.at.toISOString())}</p>
					{/each}
					{#if g.lower.length}
						<details>
							<summary class="small">{ui().quests.repeat} ({g.lower.length})</summary>
							<div class="stack" style="margin-top:12px">{#each g.lower as t (t.id)}{@render card(t)}{/each}</div>
						</details>
					{/if}
					{#if g.next}<p class="small muted">{ui().quests.nextGrade}: <strong>{tx(g.next.title)}</strong>{g.next.verification === 'peer' ? ` · ${ui().quests.peerLocked}` : ''}</p>{/if}
				</div>
			{:else}
				<p class="muted">{ui().quests.skillEmpty}</p>
			{/each}
		</section>

		<section class="stack">
			<h2>{ui().quests.attrTitle}</h2>
			<p class="small muted">{ui().quests.attrHelp}</p>
			<div class="attrgrid">
				{#each availableAttributeQuests(c) as a (a)}
					{@const aq = attributeQuest(c, a)}
					<article class="card quest">
						<span class="pill gold">{tx(ATTRIBUTE_NAMES[a])} · {c.attributes[a].value.toFixed(1)}</span>
						<h3>{tx(aq.title)}</h3>
						<p class="small muted">{tx(aq.description)}</p>
						<button class="ghost" disabled={full} onclick={() => run((x) => startAttributeQuest(x, a))}>{ui().quests.start} · +30 XP</button>
					</article>
				{/each}
			</div>
		</section>

		{#if done.length}
			<section class="stack">
				<h2>{ui().quests.completed}</h2>
				<ul class="done">
					{#each done as q (q.runId)}
						<li class="spread"><span>✓ {tx(q.title)}</span><span class="small muted num">+{q.xp} XP · {date(q.closedAt!)}</span></li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
{/if}

<style>
	.quest h3 { margin: 10px 0 4px; }
	.quest.active { border-color: var(--accent); }
	.overdue { color: var(--danger); font-weight: 600; }
	.attrgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
	.group { padding-bottom: 8px; border-bottom: 1px solid var(--line); }
	.skillname { margin: 8px 0 0; }
	details summary { cursor: pointer; color: var(--accent); font-weight: 600; }
	.done { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
</style>
