<script lang="ts">
	import { ATTRIBUTES, type AttributeId } from '#lib/model/types.ts';
	import { ATTRIBUTE_NAMES } from '#lib/data/skills.ts';
	import { tx } from '#lib/i18n/index.svelte.ts';

	let { values }: { values: Record<AttributeId, number> } = $props();

	const R = 110, C = 160;
	const pt = (i: number, v: number) => {
		const a = -Math.PI / 2 + (i * Math.PI) / 3;
		const r = (R * v) / 20;
		return [C + r * Math.cos(a), C + r * Math.sin(a)];
	};
	const ring = (v: number) => ATTRIBUTES.map((_, i) => pt(i, v).join(',')).join(' ');
	const shape = $derived(ATTRIBUTES.map((a, i) => pt(i, values[a]).join(',')).join(' '));
</script>

<svg viewBox="0 0 320 320" role="img" aria-label={ATTRIBUTES.map((a) => `${tx(ATTRIBUTE_NAMES[a])} ${values[a]}`).join(', ')}>
	{#each [5, 15, 20] as v (v)}
		<polygon points={ring(v)} fill="none" stroke="var(--line)" stroke-width="1" />
	{/each}
	<polygon points={ring(10)} fill="none" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 4" />
	{#each ATTRIBUTES as _, i (i)}
		{@const [x, y] = pt(i, 20)}
		<line x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />
	{/each}
	<polygon points={shape} fill="var(--accent)" fill-opacity="0.18" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
	{#each ATTRIBUTES as a, i (a)}
		{@const [x, y] = pt(i, values[a])}
		<circle cx={x} cy={y} r="4" fill="var(--accent)" />
		{@const [lx, ly] = pt(i, 24.5)}
		<text x={lx} y={ly - 4} text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--ink)">{tx(ATTRIBUTE_NAMES[a])}</text>
		<text x={lx} y={ly + 11} text-anchor="middle" font-size="12" fill="var(--muted)" class="num">{values[a].toFixed(1)}</text>
	{/each}
</svg>

<style>
	svg { width: 100%; max-width: 360px; display: block; margin: 0 auto; overflow: visible; }
</style>
