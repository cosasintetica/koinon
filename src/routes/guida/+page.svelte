<script lang="ts">
	import { ui } from '#lib/i18n/index.svelte.ts';
	const REPO = 'https://github.com/cosasintetica/koinon';
</script>

<article class="stack">
	<h1>{ui().guide.title}</h1>
	<p class="lead muted">{ui().guide.lead}</p>
	{#each ui().guide.sections as [title, text], i (i)}
		<section class="card">
			<h2>{title}</h2>
			<p>{text}</p>
		</section>
	{/each}
	<p class="row">
		<a href="{REPO}/blob/main/MANIFESTO.md" target="_blank" rel="noopener noreferrer">{ui().guide.manifesto} ↗</a>
		<a href="{REPO}" target="_blank" rel="noopener noreferrer">{ui().guide.code} ↗</a>
	</p>
</article>

<style>
	.lead { font-size: 1.08rem; }
	section p { margin: 0; }
	h2 { font-size: 1.15rem; }
</style>
