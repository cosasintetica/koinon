<script lang="ts">
	import { game } from '#lib/store.svelte.ts';
	import { ui } from '#lib/i18n/index.svelte.ts';
</script>

<section class="hero stack">
	<p class="pill gold">{ui().tagline}</p>
	<h1>{ui().home.title}</h1>
	<p class="lead">{ui().home.lead}</p>
	<div class="row">
		{#if game.character}
			<a class="btn" href="#/scheda">{ui().home.continue}</a>
		{:else}
			<a class="btn" href="#/crea">{ui().home.start}</a>
		{/if}
		<a class="btn ghost" href="#/guida">{ui().guide.link}</a>
	</div>
</section>

<section class="points">
	{#each ui().home.points as [title, text], i (i)}
		<div class="card">
			<h3>{title}</h3>
			<p class="muted small">{text}</p>
		</div>
	{/each}
</section>

<style>
	.hero { padding: 24px 0 36px; }
	.lead { font-size: 1.12rem; max-width: 36em; color: var(--muted); }
	.points { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
	.points p { margin: 0; }
</style>
