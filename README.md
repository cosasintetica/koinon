# Koinon

**Cresci tu, cresciamo insieme.** Un gioco di ruolo open source per la vita reale.

Rispondi a un questionario sincero e ottieni la scheda del tuo personaggio: sei attributi misurati su di te (Forza, Resistenza, Destrezza, Intelletto, Equilibrio, Empatia) e le abilità in cui vuoi crescere. Ricevi quest reali, calibrate su di te. Più avanti, la tua crescita si unisce a quella degli altri nelle quest collettive e nelle Grandi Opere.

Leggi il [Manifesto](MANIFESTO.md).

## Perché barare non serve

- **Le sfide si calibrano sui valori dichiarati.** Chi si dichiara più forte riceve sfide più dure: se non sono alla sua portata, non cresce.
- **Tre fallimenti di fila abbassano il valore di 1.** La scheda si riallinea da sola alla persona reale.
- **Il livello parte da 1 per tutti.** Lo alzano solo le quest completate, mai i valori dichiarati.
- **Una quest si ripete solo quando è passata la sua durata.** Niente XP a raffica.
- **Il questionario arriva al massimo a 16 su 20.** Oltre servono prove certificate da altre persone (Fase 2).
- **Nessuno vede la tua scheda.** Non ci sono amici, follower o classifiche da impressionare.

Le quest già completate si ripetono solo dopo la loro durata. I valori di riferimento e le loro fonti sono in [docs/riferimenti.md](docs/riferimenti.md).

Tutte le regole sono in [`src/lib/model/engine.ts`](src/lib/model/engine.ts) e [`src/lib/model/scoring.ts`](src/lib/model/scoring.ts), con test in [`engine.test.ts`](src/lib/model/engine.test.ts).

## Privacy

Nessun account, nessun server, nessun tracciamento. La scheda è salvata solo nel browser (IndexedDB). Puoi scaricarne una copia o cancellarla dalle Impostazioni.

## Stato del progetto

| Fase | Contenuto | Stato |
|---|---|---|
| 0 · Fondamenta | Manifesto, licenza, modello dati, prototipo | In corso |
| 1 · App personale | Questionario, scheda, 150 quest, offline, IT/EN | In corso: online su cosasintetica.github.io/koinon |
| 2 · Comunità | Server, gilde, quest collettive, certificazione a 3 | Da fare |
| 3 · Grandi Opere | Collegamento a progetti reali | Da fare |
| 4 · Store ed ente | App Android/iOS, ente senza scopo di lucro | Da fare |

## Sviluppo

Richiede Node.js 22 o successivo.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # regole del gioco
npm run check    # controllo dei tipi
npm run build    # sito statico in build/, pubblicabile su qualsiasi hosting
```

Tecnologie: SvelteKit (sito statico, rotte con `#`), TypeScript, IndexedDB, service worker per l'uso offline.

## Contribuire

Proporre quest, tradurre, programmare: vedi [CONTRIBUTING.md](CONTRIBUTING.md) e la [Carta delle quest](docs/carta-delle-quest.md).

## Licenza

[AGPL-3.0-or-later](LICENSE). Chiunque può usare, studiare, modificare e ridistribuire Koinon, a patto che anche le versioni modificate offerte in rete restino aperte.
