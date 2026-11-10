<script lang="ts">
	import { goto } from '$app/navigation';
	import { game, act } from '#lib/store.svelte.ts';
	import { tx, ui, i18n } from '#lib/i18n/index.svelte.ts';
	import {
		availableSkillQuests, availableAttributeQuests, attributeQuest, startSkillQuest, startAttributeQuest,
		completeQuest, failQuest, abandonQuest, isOverdue, MAX_ACTIVE_QUESTS, questXp
	} from '#lib/model/engine.ts';
	import { ATTRIBUTE_NAMES, GRADE_NAMES, skillById } from '#lib/data/skills.ts';
	import type { Character } from '#lib/model/types.ts';

	$effect(() => { if (!game.character) goto('#/'); });

	const c = $derived(game.character!);
	const active = $derived(c ? c.quests.filter((q) => q.status === 'active') : []);
	const done = $derived(c ? c.quests.filter((q) => q.status === 'done').slice(-8).reverse() : []);
	const full = $derived(active.length >= MAX_ACTIVE_QUESTS);
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
			{#each availableSkillQuests(c) as t (t.id)}
				<article class="card quest">
					<div class="spread">
						<span class="row" style="gap:6px">
							<span class="pill">{label(t.skill)}</span>
							<span class="pill grey">{tx(GRADE_NAMES[t.grade - 1])}</span>
						</span>
						<span class="small muted">{t.days} {ui().quests.days} · {ui().quests.verification[t.verification]}</span>
					</div>
					<h3>{tx(t.title)}</h3>
					<p class="muted">{tx(t.description)}</p>
					{#if t.verification === 'peer'}
						<p class="small muted">{ui().quests.peerLocked}</p>
					{:else}
						<button class="ghost" disabled={full} onclick={() => run((x) => startSkillQuest(x, t.id))}>
							{ui().quests.start} · +{questXp(c, t)} XP
						</button>
					{/if}
				</article>
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
	.done { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
</style>
