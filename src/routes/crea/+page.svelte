<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { QUESTIONS, computeAttributes } from '#lib/model/scoring.ts';
	import { createCharacter, recalibrate } from '#lib/model/engine.ts';
	import { ATTRIBUTES, BRANCHES, type Answers, type AttributeId, type Profile } from '#lib/model/types.ts';
	import { SKILLS, BRANCH_INFO, ATTRIBUTE_NAMES } from '#lib/data/skills.ts';
	import { game, save } from '#lib/store.svelte.ts';
	import { tx, ui } from '#lib/i18n/index.svelte.ts';
	import Radar from '#lib/components/Radar.svelte';

	const recal = page.url.searchParams.has('ricalibra') && !!game.character;

	let name = $state(game.character?.name ?? '');
	let profile = $state<Profile>(game.character ? { ...game.character.profile } : { age: 30, sex: 'x', weightKg: 70 });
	let answers = $state<Answers>({});
	let focus = $state<string[]>(game.character?.focus ?? []);

	type Step = { kind: 'name' } | { kind: 'profile' } | { kind: 'attr'; attr: AttributeId } | { kind: 'focus' } | { kind: 'result' };
	const steps: Step[] = [
		...(recal ? [] : [{ kind: 'name' } as Step]),
		{ kind: 'profile' },
		...ATTRIBUTES.map((attr) => ({ kind: 'attr', attr }) as Step),
		...(recal ? [] : [{ kind: 'focus' } as Step]),
		{ kind: 'result' }
	];
	let i = $state(0);
	const step = $derived(steps[i]);
	const result = $derived(computeAttributes(answers, profile));

	const valid = $derived.by(() => {
		if (step.kind === 'name') return name.trim().length > 0;
		if (step.kind === 'profile') return profile.age >= 16 && profile.age <= 110 && profile.weightKg >= 25 && profile.weightKg <= 300;
		if (step.kind === 'attr') return QUESTIONS.filter((q) => q.attribute === step.attr && !q.optional).every((q) => typeof answers[q.id] === 'number');
		if (step.kind === 'focus') return focus.length >= 1 && focus.length <= 5;
		return true;
	});

	function setNum(id: string, v: string) {
		const n = Number(v.replace(',', '.'));
		if (v === '' || !Number.isFinite(n)) delete answers[id];
		else answers[id] = Math.max(0, n);
	}
	function toggle(id: string) {
		focus = focus.includes(id) ? focus.filter((f) => f !== id) : focus.length < 5 ? [...focus, id] : focus;
	}
	async function finish() {
		if (recal && game.character) await save(recalibrate({ ...game.character, profile: { ...profile } }, result.values));
		else await save(createCharacter(name.trim(), { ...profile }, result.values, focus));
		goto('#/scheda');
	}
</script>

<div class="stack">
	<div class="progress">
		<span class="small muted">{ui().create.step} {i + 1} {ui().create.of} {steps.length}</span>
		<div class="bar"><span style:width="{((i + 1) / steps.length) * 100}%" style:background="var(--accent)"></span></div>
	</div>

	{#if step.kind === 'name'}
		<div class="card stack">
			<label for="name">{ui().create.nameLabel}</label>
			<input id="name" bind:value={name} maxlength="40" autocomplete="off" />
			<p class="small muted">{ui().create.nameHelp}</p>
		</div>
	{:else if step.kind === 'profile'}
		<div class="card stack">
			<h2>{ui().create.profileTitle}</h2>
			<p class="small muted">{ui().create.profileHelp}</p>
			<div class="grid3">
				<div>
					<label for="age">{ui().create.age}</label>
					<input id="age" type="number" inputmode="numeric" min="16" max="110" bind:value={profile.age} />
				</div>
				<div>
					<label for="sex">{ui().create.sex}</label>
					<select id="sex" bind:value={profile.sex}>
						{#each ['f', 'm', 'x'] as const as s (s)}<option value={s}>{ui().create.sexes[s]}</option>{/each}
					</select>
				</div>
				<div>
					<label for="w">{ui().create.weight}</label>
					<input id="w" type="number" inputmode="decimal" min="25" max="300" bind:value={profile.weightKg} />
				</div>
			</div>
			{#if profile.age < 16}<p class="notice">{ui().create.tooYoung}</p>{/if}
		</div>
	{:else if step.kind === 'attr'}
		{@const attr = step.attr}
		<div class="stack">
			<h2>{tx(ATTRIBUTE_NAMES[attr])}</h2>
			<p class="notice">{ui().create.honesty}</p>
			{#each QUESTIONS.filter((q) => q.attribute === attr) as q (q.id)}
				<div class="card stack">
					<label for={q.id} id="{q.id}-label">{tx(q.prompt)}</label>
					{#if q.help}<p class="small muted">{tx(q.help)}</p>{/if}
					{#if q.kind === 'number'}
						<div class="row">
							<input id={q.id} class="numin" type="number" inputmode="decimal" min={q.min} max={q.max}
								value={answers[q.id] ?? ''} oninput={(e) => setNum(q.id, e.currentTarget.value)} />
							{#if q.unit}<span class="muted">{tx(q.unit)}</span>{/if}
							{#if q.optional}<button class="quiet" onclick={() => (answers[q.id] = -1)}>{ui().create.skip}</button>{/if}
						</div>
					{:else}
						<div class="choices" role="radiogroup" id={q.id} aria-labelledby="{q.id}-label">
							{#each q.options ?? [] as o, k (k)}
								<button role="radio" aria-checked={answers[q.id] === o.value && answers[`${q.id}#`] === k}
									class:chosen={answers[`${q.id}#`] === k}
									onclick={() => { answers[q.id] = o.value; answers[`${q.id}#`] = k; }}>{tx(o.label)}</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else if step.kind === 'focus'}
		<div class="stack">
			<h2>{ui().create.focusTitle}</h2>
			<p class="muted">{ui().create.focusHelp}</p>
			{#each BRANCHES as b (b)}
				{@const info = BRANCH_INFO[b]}
				<div class="card">
					<h3>{tx(info.name)}
						{#if info.unlockLevel > 1}<span class="pill grey">{ui().create.locked} {info.unlockLevel}</span>{/if}
					</h3>
					<div class="choices">
						{#each SKILLS.filter((s) => s.branch === b) as s (s.id)}
							<button class:chosen={focus.includes(s.id)} aria-pressed={focus.includes(s.id)} onclick={() => toggle(s.id)}>{tx(s.name)}</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="card stack">
			<h2>{ui().create.resultTitle}{recal ? '' : `: ${name}`}</h2>
			<Radar values={result.values} />
			<p class="small muted">{ui().create.resultHelp}</p>
			{#if result.flags.length}<p class="notice">{ui().create.capped}</p>{/if}
		</div>
	{/if}

	<div class="spread">
		<button class="quiet" disabled={i === 0} onclick={() => i--}>{ui().create.back}</button>
		{#if step.kind === 'result'}
			<button onclick={finish}>{ui().create.confirm}</button>
		{:else}
			<button disabled={!valid} onclick={() => { i++; scrollTo({ top: 0 }); }}>{ui().create.next}</button>
		{/if}
	</div>
</div>

<style>
	.progress { display: grid; gap: 6px; }
	.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
	.numin { max-width: 140px; }
	.choices { display: flex; flex-wrap: wrap; gap: 8px; }
	.choices button { background: transparent; color: var(--ink); border-color: var(--line); font-weight: 500; }
	.choices button.chosen { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); font-weight: 600; }
	h3 .pill { margin-left: 8px; vertical-align: middle; }
</style>
