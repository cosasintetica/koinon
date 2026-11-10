<script lang="ts">
	import { goto } from '$app/navigation';
	import { game, save, reset, exportJson, importJson } from '#lib/store.svelte.ts';
	import { i18n, setLang, tx, ui } from '#lib/i18n/index.svelte.ts';
	import { SKILLS, BRANCH_INFO } from '#lib/data/skills.ts';
	import { BRANCHES } from '#lib/model/types.ts';

	let msg = $state('');

	async function toggle(id: string) {
		const c = game.character;
		if (!c) return;
		const focus = c.focus.includes(id) ? c.focus.filter((f) => f !== id) : c.focus.length < 5 ? [...c.focus, id] : c.focus;
		if (focus.length === 0) return;
		await save({ ...$state.snapshot(c), focus });
	}
	function download() {
		const blob = new Blob([exportJson()], { type: 'application/json' });
		const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `koinon-${new Date().toISOString().slice(0, 10)}.json` });
		a.click();
		URL.revokeObjectURL(a.href);
	}
	async function upload(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		try { await importJson(await f.text()); msg = ui().settings.saved; } catch { msg = 'File non valido / invalid file'; }
	}
	let confirming = $state(false);
	async function wipe() {
		if (!confirming) { confirming = true; return; }
		await reset();
		goto('#/');
	}
</script>

<div class="stack">
	<div class="card stack">
		<h2>{ui().settings.language}</h2>
		<div class="row">
			<button class:ghost={i18n.lang !== 'it'} onclick={() => setLang('it')}>Italiano</button>
			<button class:ghost={i18n.lang !== 'en'} onclick={() => setLang('en')}>English</button>
		</div>
	</div>

	{#if game.character}
		<div class="card stack">
			<h2>{ui().settings.focus}</h2>
			{#each BRANCHES as b (b)}
				<div>
					<h3>{tx(BRANCH_INFO[b].name)}</h3>
					<div class="choices">
						{#each SKILLS.filter((s) => s.branch === b) as s (s.id)}
							<button class:chosen={game.character.focus.includes(s.id)} aria-pressed={game.character.focus.includes(s.id)} onclick={() => toggle(s.id)}>{tx(s.name)}</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="card stack">
			<h2>{ui().settings.data}</h2>
			<p class="small muted">{ui().settings.dataHelp}</p>
			<div class="row">
				<a class="btn ghost" href="#/crea?ricalibra=1">{ui().settings.recalibrate}</a>
				<button class="ghost" onclick={download}>{ui().settings.export}</button>
				<label class="btn ghost filebtn">{ui().settings.import}<input type="file" accept="application/json" onchange={upload} hidden /></label>
				<button class="danger" onclick={wipe}>{confirming ? `${ui().settings.reset}?` : ui().settings.reset}</button>
			</div>
			{#if confirming}<p class="notice">{ui().settings.resetConfirm} <button class="quiet" onclick={() => (confirming = false)}>{ui().create.back}</button></p>{/if}
			{#if msg}<p class="small">{msg}</p>{/if}
		</div>
	{/if}

	<p class="small muted">{ui().settings.about}</p>
</div>

<style>
	.choices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
	.choices button { background: transparent; color: var(--ink); border-color: var(--line); font-weight: 500; }
	.choices button.chosen { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); font-weight: 600; }
	.filebtn { margin: 0; }
</style>
