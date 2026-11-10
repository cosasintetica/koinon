// Dopo la build: rende relativi i percorsi assoluti di index.html,
// così l'app funziona in qualsiasi sottocartella (GitHub Pages, anteprime, hosting statici).
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'build/index.html';
const html = readFileSync(file, 'utf8')
	.replace(/(href|src)="\/(?!\/)/g, '$1="./')
	.replace(/import\("\/(?!\/)/g, 'import("./')
	.replace(/script_url = '\/(?!\/)/g, "script_url = './");
writeFileSync(file, html);
console.log('Percorsi relativi in', file);
