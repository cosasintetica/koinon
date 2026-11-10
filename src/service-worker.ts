/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// Funzionamento offline: tutti i file dell'app vengono salvati in cache all'installazione.
import { immutable, assets } from '$app/manifest';
import { version } from '$app/env';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `koinon-${version}`;
const path = (f: string | { path: string }) => (typeof f === 'string' ? f : f.path);
const ASSETS = ['./', ...[...immutable, ...assets].map(path)];

sw.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => sw.skipWaiting()));
});
sw.addEventListener('activate', (e) => {
	e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => sw.clients.claim()));
});
sw.addEventListener('fetch', (e) => {
	if (e.request.method !== 'GET' || new URL(e.request.url).origin !== sw.location.origin) return;
	e.respondWith(
		caches.match(e.request, { ignoreSearch: true }).then((hit) => hit ?? fetch(e.request).catch(() => caches.match('./') as Promise<Response>))
	);
});
