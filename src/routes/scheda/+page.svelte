<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '#lib/store.svelte.ts';
	import { tx, ui } from '#lib/i18n/index.svelte.ts';
	import { totalXp, levelFromXp, xpForLevel, skillGrade, GRADE_XP, recalibrationDue, isBranchUnlocked } from '#lib/model/engine.ts';
	import { ATTRIBUTES, type AttributeId } from '#lib/model/types.ts';
	import { skillById, GRADE_NAMES, BRANCH_INFO } from '#lib/data/skills.ts';
	import Radar from '#lib/components/Radar.svelte';

	$effect(() => { if (!game.character) goto('#/'); });

	const c = $derived(game.character!);
	const xp = $derived(c ? totalXp(c) : 0);
	const lvl = $derived(levelFromXp(xp));
	const lo = $derived(xpForLevel(lvl));
	const hi = $derived(xpForLevel(lvl + 1));
	const values = $derived(c ? (Object.fromEntries(ATTRIBUTES.map((a) => [a, c.attributes[a].value])) as Record<AttributeId, number>) : null);
	const skillRows = $derived(c ? [...new Set([...c.focus, ...Object.keys(c.skills)])].map((id) => ({ id, xp: c.skills[id] ?? 0, skill: skillById(id) })).filter((r) => r.skill) : []);
</script>

{#if c && values}
	<div class="stack">
		<div class="card">
			<div class="spread">
				<div>
					<h1 class="name">{c.name}</h1>
					<span class="small muted num">{xp} {ui().sheet.xp} · {hi - xp} {ui().sheet.toNext}</span>
				</div>
				<div class="level" aria-label="{ui().sheet.level} {lvl}">
					<span class="small">{ui().sheet.level}</span>
					<strong class="num">{lvl}</strong>
				</div>
			</div>
			<div class="bar" style="margin-top:14px"><span style:width="{((xp - lo) / (hi - lo)) * 100}%"></span></div>
		</div>

		{#if recalibrationDue(c)}
			<p class="notice">{ui().sheet.recalibrate} <a href="#/crea?ricalibra=1">{ui().settings.recalibrate}</a></p>
		{/if}

		<div class="card">
			<h2>{ui().sheet.attributes}</h2>
			<Radar {values} />
			<p class="small muted center">{ui().sheet.scaleNote}</p>
		</div>

		<div class="card">
			<h2>{ui().sheet.skills}</h2>
			{#if skillRows.length === 0}
				<p class="muted">{ui().sheet.noSkills}</p>
			{/if}
			<ul class="skills">
				{#each skillRows as r (r.id)}
					{@const g = skillGrade(r.xp)}
					{@const next = GRADE_XP[g] ?? GRADE_XP[g - 1]}
					{@const base = GRADE_XP[g - 1]}
					{@const locked = !isBranchUnlocked(c, r.id)}
					<li class:locked>
						<div class="spread">
							<span><strong>{tx(r.skill!.name)}</strong> <span class="small muted">· {tx(BRANCH_INFO[r.skill!.branch].name)}</span></span>
							<span class="pill">{tx(GRADE_NAMES[g - 1])}</span>
						</div>
						<div class="bar thin"><span style:width="{Math.min(100, ((r.xp - base) / Math.max(1, next - base)) * 100)}%" style:background="var(--accent)"></span></div>
						<span class="small muted num">{r.xp} / {next} XP{locked ? ` · ${ui().create.locked} ${BRANCH_INFO[r.skill!.branch].unlockLevel}` : ''}</span>
					</li>
				{/each}
			</ul>
		</div>

		<a class="btn" href="#/quest">{ui().nav.quests} →</a>
	</div>
{/if}

<style>
	.name { margin: 0 0 2px; }
	.level { display: grid; justify-items: center; background: var(--gold-soft); color: var(--gold); border-radius: 14px; padding: 6px 16px; }
	.level strong { font-family: var(--serif); font-size: 2rem; line-height: 1; }
	.center { text-align: center; margin: 8px 0 0; }
	.skills { list-style: none; padding: 0; margin: 0; display: grid; gap: 16px; }
	.skills li { display: grid; gap: 6px; }
	.skills li.locked { opacity: 0.55; }
	.bar.thin { height: 6px; }
</style>
