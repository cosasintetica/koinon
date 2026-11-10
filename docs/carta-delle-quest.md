# Carta delle quest

Ogni quest del catalogo, personale o collettiva, deve rispettare tutti e cinque i criteri. Le quest proposte dalla comunità vengono controllate da revisori estratti a caso prima di entrare nel catalogo.

| # | Criterio | Domanda di controllo | Esempio respinto |
|---|---|---|---|
| 1 | **Concreta e misurabile** | Si sa senza ambiguità quando è completata? | "Diventa una persona migliore" |
| 2 | **Beneficio reale** | Migliora la persona, altre persone, l'ambiente o la conoscenza? | "Andiamo a mangiare un gelato" |
| 3 | **Nessun interesse commerciale** | È libera da marchi, negozi, locali, prodotti, partiti e proselitismo? | "Prova la palestra X" |
| 4 | **Sicura e legale** | Si può fare senza rischi seri e nel rispetto della legge? | "Solleva il tuo massimale da solo" |
| 5 | **Aperta a tutti** | È accessibile senza esclusioni per età, genere, origine o soldi? | "Compra l'attrezzatura da 300 €" |

## Formato di una quest

Le quest vivono in [`src/lib/data/quests.ts`](../src/lib/data/quests.ts), una riga `q(...)` per quest. Ogni voce ha:

- `id`: identificatore unico, in minuscolo con trattini
- `skill`: l'abilità a cui appartiene
- `grade`: grado richiesto, da 1 (Novizio) a 5 (Maestro)
- `title` e `description`: testo in italiano (`it`) e inglese (`en`)
- `days`: tempo a disposizione
- `verification`: `self` (autodichiarazione), `evidence` (prova allegata) o `peer` (certificazione di 3 persone)

## Grandi Opere

Le quest collettive di scala globale devono essere scomposte in contributi concreti e collegate a progetti reali senza scopo di lucro. Un obiettivo come "curare il cancro" non è mai una quest: lo sono "dona il sangue", "partecipa a un progetto di scienza partecipata", "completa un corso di statistica".
