<script lang="ts">
	import { ui } from '#lib/i18n/index.svelte.ts';
	const links: Record<number, string> = { 1: 'https://foldingathome.org', 2: 'https://www.zooniverse.org' };
</script>

<div class="stack">
	<span class="pill grey">Fase 2</span>
	<h1>{ui().community.title}</h1>
	<p class="muted">{ui().community.lead}</p>

	<div class="card stack">
		<h2>{ui().community.example}</h2>
		<ol class="tree">
			{#each ui().community.branches as [name, text], i (i)}
				<li>
					<strong>{name}</strong>
					<span class="muted">{text}</span>
					{#if links[i]}<a class="small" href={links[i]} target="_blank" rel="noopener noreferrer">{links[i].replace('https://', '')} ↗</a>{/if}
				</li>
			{/each}
		</ol>
	</div>

	<div class="card">
		<p>{ui().community.scales}</p>
		<p class="muted" style="margin:0">{ui().community.noFriends}</p>
	</div>
</div>

<style>
	.tree { margin: 0; padding: 0 0 0 4px; list-style: none; display: grid; gap: 14px; border-left: 2px solid var(--accent-soft); }
	.tree li { display: grid; gap: 2px; padding-left: 16px; position: relative; }
	.tree li::before { content: ''; position: absolute; left: -6px; top: 8px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
</style>
