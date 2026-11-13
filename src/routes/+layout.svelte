<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { game, load } from '#lib/store.svelte.ts';
	import { i18n, setLang, ui } from '#lib/i18n/index.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	onMount(() => {
		document.documentElement.lang = i18n.lang;
		load();
	});

	const links = $derived([
		{ href: '#/scheda', id: '/scheda', label: ui().nav.sheet },
		{ href: '#/quest', id: '/quest', label: ui().nav.quests },
		{ href: '#/comunita', id: '/comunita', label: ui().nav.community },
		{ href: '#/impostazioni', id: '/impostazioni', label: ui().nav.settings }
	]);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Koinon</title>
	<meta name="description" content="Koinon — {ui().tagline}" />
	<meta name="theme-color" content="#0e6b68" />
</svelte:head>

<header>
	<div class="wrap spread">
		<a class="brand" href="#/">
			<img src={favicon} alt="" width="28" height="28" />
			<span>Koinon</span>
		</a>
		<button class="quiet lang" onclick={() => setLang(i18n.lang === 'it' ? 'en' : 'it')} title="Lingua / Language">
			<span class="sr-only">Lingua / Language:</span> {i18n.lang === 'it' ? 'EN' : 'IT'}
		</button>
	</div>
	{#if game.character}
		<nav class="wrap" aria-label="Koinon">
			{#each links as l (l.id)}
				<a href={l.href} aria-current={page.route.id === l.id ? 'page' : undefined}>{l.label}</a>
			{/each}
		</nav>
	{/if}
</header>

<main class="wrap">
	{#if game.ready}
		{@render children()}
	{/if}
</main>

<footer class="wrap small muted">
	Koinon · {ui().tagline} · <a href="#/guida">{ui().guide.link}</a> · <a href="https://github.com/cosasintetica/koinon" target="_blank" rel="noopener noreferrer">AGPL-3.0</a>
</footer>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		background: color-mix(in srgb, var(--paper) 88%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--line);
		padding-top: 12px;
	}
	header > .spread { padding-bottom: 10px; }
	.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); font-family: var(--serif); font-size: 1.35rem; font-weight: 600; letter-spacing: 0.02em; }
	.lang { padding: 4px 12px; font-size: 0.8rem; }
	nav { display: flex; gap: 4px; overflow-x: auto; }
	nav a {
		padding: 8px 12px 10px;
		color: var(--muted);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
		border-bottom: 2px solid transparent;
		white-space: nowrap;
	}
	nav a[aria-current='page'] { color: var(--ink); border-color: var(--accent); }
	main { padding-top: 28px; padding-bottom: 48px; min-height: 70vh; }
	footer { padding-bottom: 32px; text-align: center; }
</style>
