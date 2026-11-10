# Come contribuire

Koinon è di tutti. Ci sono tre modi principali per aiutare, e solo uno richiede di saper programmare.

## 1. Proporre quest

Il catalogo delle quest è il cuore del gioco. Per proporne di nuove:

1. Leggi la [Carta delle quest](docs/carta-delle-quest.md).
2. Apri una *issue* con l'etichetta `quest` descrivendo abilità, grado, durata e verifica.
3. Oppure aggiungi una riga in `src/lib/data/quests.ts` e apri una *pull request*.

## 2. Tradurre

I testi dell'interfaccia sono in `src/lib/i18n/`. Ogni lingua è un file. Copia `en.ts`, traduci i valori e apri una *pull request*.

## 3. Scrivere codice

```bash
npm install
npm run dev      # sviluppo su http://localhost:5173
npm test         # test del motore di punteggio
npm run build    # sito statico in build/
```

Regole:

- Nessun dato personale lascia il dispositivo senza un'azione esplicita della persona.
- Nessuna dipendenza che tracci, profili o mostri pubblicità.
- Ogni regola di punteggio ha un test.

## Licenza

Contribuendo accetti che il tuo lavoro sia distribuito con la licenza [AGPL-3.0-or-later](LICENSE).
