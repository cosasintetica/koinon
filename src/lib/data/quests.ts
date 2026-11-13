// Catalogo delle quest personali. Ogni quest rispetta la Carta delle quest (docs/carta-delle-quest.md).
// Per proporne una nuova aggiungi una riga con q(...) e apri una pull request.

import type { Grade, QuestTemplate, Verification } from '#lib/model/types.ts';
import { MORE_QUESTS } from './quests-more.ts';

const q = (
	id: string, skill: string, grade: Grade, days: number, verification: Verification,
	it: [string, string], en: [string, string]
): QuestTemplate => ({ id, skill, grade, days, verification, title: { it: it[0], en: en[0] }, description: { it: it[1], en: en[1] } });

const BASE_QUESTS: QuestTemplate[] = [
	// CORPO
	q('corsa-1', 'corsa', 1, 7, 'self', ['Tre uscite', 'Cammina a passo svelto o corri piano per 20 minuti, tre volte questa settimana.'], ['Three outings', 'Walk briskly or jog for 20 minutes, three times this week.']),
	q('corsa-2', 'corsa', 2, 14, 'self', ['Corri 3 km', 'Corri 3 km senza fermarti, anche lentamente.'], ['Run 3 km', 'Run 3 km without stopping, even slowly.']),
	q('corsa-3', 'corsa', 3, 30, 'evidence', ['Corri 5 km', 'Corri 5 km di fila e registra il percorso o il tempo.'], ['Run 5 km', 'Run 5 km in one go and record the route or time.']),
	q('mobilita-1', 'mobilita', 1, 7, 'self', ['Dieci minuti di allungamento', 'Fai 10 minuti di allungamento per 5 giorni.'], ['Ten minutes of stretching', 'Stretch for 10 minutes on 5 days.']),
	q('mobilita-2', 'mobilita', 2, 14, 'self', ['Una sequenza completa', 'Impara una sequenza di yoga o mobilità di 20 minuti e ripetila 6 volte.'], ['A full sequence', 'Learn a 20-minute yoga or mobility sequence and repeat it 6 times.']),
	q('mobilita-3', 'mobilita', 3, 30, 'evidence', ['Tocca terra', 'Arriva a toccare le punte dei piedi a gambe tese, o migliora di un livello rispetto a oggi.'], ['Touch the floor', 'Reach your toes with straight legs, or improve one level from today.']),
	q('forza_corpo-1', 'forza_corpo', 1, 7, 'self', ['Le basi', 'Fai tre allenamenti da 15 minuti con flessioni, squat e plank.'], ['The basics', 'Do three 15-minute workouts with push-ups, squats and planks.']),
	q('forza_corpo-2', 'forza_corpo', 2, 21, 'self', ['Programma di tre settimane', 'Segui un programma a corpo libero per tre settimane, tre volte a settimana.'], ['Three-week programme', 'Follow a bodyweight programme for three weeks, three times a week.']),
	q('forza_corpo-3', 'forza_corpo', 3, 42, 'evidence', ['Prima trazione', 'Arriva a fare una trazione alla sbarra, o 5 in più di quelle che fai oggi.'], ['First pull-up', 'Reach one pull-up, or 5 more than you can do today.']),
	// MENTE
	q('lingue-1', 'lingue', 1, 7, 'self', ['Venti parole', 'Impara 20 parole nuove in una lingua che vuoi parlare.'], ['Twenty words', 'Learn 20 new words in a language you want to speak.']),
	q('lingue-2', 'lingue', 2, 14, 'self', ['Presentati', 'Scrivi e pronuncia una presentazione di te in 10 frasi nella nuova lingua.'], ['Introduce yourself', 'Write and say a 10-sentence introduction of yourself in the new language.']),
	q('lingue-3', 'lingue', 3, 30, 'evidence', ['Dieci minuti di conversazione', 'Sostieni 10 minuti di conversazione con chi parla quella lingua.'], ['Ten minutes of conversation', 'Hold a 10-minute conversation with a speaker of that language.']),
	q('informatica-1', 'informatica', 1, 7, 'self', ['Primo programma', 'Segui una lezione gratuita e scrivi un programma che stampa il tuo nome.'], ['First program', 'Follow a free lesson and write a program that prints your name.']),
	q('informatica-2', 'informatica', 2, 21, 'evidence', ['Un piccolo strumento', 'Scrivi un programma che risolve un problema tuo, anche minuscolo.'], ['A small tool', 'Write a program that solves a problem of yours, however tiny.']),
	q('informatica-3', 'informatica', 3, 45, 'evidence', ['Contribuisci', 'Apri una correzione o una traduzione in un progetto open source.'], ['Contribute', 'Submit a fix or translation to an open source project.']),
	q('scienze-1', 'scienze', 1, 7, 'self', ['Una domanda', "Scegli una domanda sul mondo e trova la risposta in una fonte affidabile."], ['One question', 'Pick a question about the world and find the answer in a reliable source.']),
	q('scienze-2', 'scienze', 2, 21, 'self', ['Un corso breve', 'Completa un corso introduttivo gratuito di una materia scientifica.'], ['A short course', 'Complete a free introductory course in a science subject.']),
	q('scienze-3', 'scienze', 3, 45, 'evidence', ['Scienza partecipata', 'Contribuisci per 5 ore a un progetto di scienza partecipata, ad esempio su Zooniverse.'], ['Citizen science', 'Contribute 5 hours to a citizen science project, for example on Zooniverse.']),
	// CREATIVITÀ
	q('scrittura-1', 'scrittura', 1, 7, 'self', ['Dieci righe', 'Scrivi 10 righe, su qualsiasi cosa.'], ['Ten lines', 'Write 10 lines, about anything.']),
	q('scrittura-2', 'scrittura', 2, 7, 'self', ['Una pagina al giorno', 'Scrivi una pagina al giorno per 5 giorni.'], ['A page a day', 'Write one page a day for 5 days.']),
	q('scrittura-3', 'scrittura', 3, 30, 'evidence', ['Un racconto', 'Scrivi un racconto completo di almeno 2.000 parole.'], ['A short story', 'Write a complete story of at least 2,000 words.']),
	q('scrittura-4', 'scrittura', 4, 30, 'peer', ['Tre lettori', 'Fai leggere un tuo testo a 3 persone sconosciute e rivedilo con i loro commenti.'], ['Three readers', 'Have 3 strangers read a piece of yours and revise it with their notes.']),
	q('scrittura-5', 'scrittura', 5, 90, 'peer', ['Mentore', 'Accompagna 3 Novizi di scrittura fino al grado Apprendista.'], ['Mentor', 'Guide 3 writing Novices to Apprentice grade.']),
	q('disegno-1', 'disegno', 1, 7, 'self', ['Cinque schizzi', 'Disegna 5 oggetti che hai in casa, 5 minuti ciascuno.'], ['Five sketches', 'Draw 5 objects in your home, 5 minutes each.']),
	q('disegno-2', 'disegno', 2, 14, 'self', ['Dal vero', 'Fai 10 disegni dal vero, all\'aperto o da una finestra.'], ['From life', 'Make 10 drawings from life, outdoors or from a window.']),
	q('disegno-3', 'disegno', 3, 30, 'evidence', ['Un\'opera finita', 'Completa un disegno o un dipinto curato in ogni parte.'], ['A finished piece', 'Complete a drawing or painting finished in every part.']),
	q('musica-1', 'musica', 1, 7, 'self', ['Ascolto attivo', 'Ascolta un brano 3 volte e annota gli strumenti e la struttura.'], ['Active listening', 'Listen to a piece 3 times and note its instruments and structure.']),
	q('musica-2', 'musica', 2, 21, 'self', ['Primi accordi', 'Impara 3 accordi o una melodia semplice con uno strumento o la voce.'], ['First chords', 'Learn 3 chords or a simple melody on an instrument or with your voice.']),
	q('musica-3', 'musica', 3, 45, 'evidence', ['Un brano intero', 'Suona o canta un brano intero dall\'inizio alla fine e registralo.'], ['A whole piece', 'Play or sing a whole piece from start to finish and record it.']),
	// RELAZIONI
	q('comunicazione-1', 'comunicazione', 1, 7, 'self', ['Una conversazione nuova', 'Inizia una conversazione con una persona con cui non parli mai.'], ['A new conversation', 'Start a conversation with someone you never talk to.']),
	q('comunicazione-2', 'comunicazione', 2, 14, 'self', ['Dire un no', 'Esprimi con calma un disaccordo o un rifiuto che di solito eviti.'], ['Saying no', 'Calmly express a disagreement or refusal you would normally avoid.']),
	q('comunicazione-3', 'comunicazione', 3, 30, 'evidence', ['Parla in pubblico', 'Parla per 5 minuti davanti ad almeno 5 persone.'], ['Speak in public', 'Speak for 5 minutes in front of at least 5 people.']),
	q('ascolto-1', 'ascolto', 1, 7, 'self', ['Solo domande', 'In una conversazione, fai solo domande e non dare consigli.'], ['Only questions', 'In one conversation, only ask questions and give no advice.']),
	q('ascolto-2', 'ascolto', 2, 14, 'self', ['Riformula', 'In 5 conversazioni, ripeti con parole tue ciò che hai capito prima di rispondere.'], ['Paraphrase', 'In 5 conversations, restate what you understood before replying.']),
	q('ascolto-3', 'ascolto', 3, 30, 'self', ['Una persona sola', 'Telefona a una persona che vive sola e ascoltala per mezz\'ora.'], ['Someone alone', 'Call someone who lives alone and listen to them for half an hour.']),
	q('insegnamento-1', 'insegnamento', 1, 7, 'self', ['Spiega una cosa', 'Spiega a qualcuno una cosa che sai fare, finché non riesce a farla.'], ['Explain one thing', 'Teach someone something you can do until they can do it.']),
	q('insegnamento-2', 'insegnamento', 2, 21, 'self', ['Tre lezioni', 'Dai 3 lezioni gratuite su una tua abilità.'], ['Three lessons', 'Give 3 free lessons on one of your skills.']),
	q('insegnamento-3', 'insegnamento', 3, 45, 'evidence', ['Una guida', 'Scrivi una guida passo per passo e falla provare a 3 persone.'], ['A guide', 'Write a step-by-step guide and have 3 people try it.']),
	// SPIRITO
	q('meditazione-1', 'meditazione', 1, 7, 'self', ['Cinque minuti', 'Siedi in silenzio seguendo il respiro, 5 minuti per 5 giorni.'], ['Five minutes', 'Sit in silence following your breath, 5 minutes on 5 days.']),
	q('meditazione-2', 'meditazione', 2, 14, 'self', ['Quindici minuti', 'Medita 15 minuti al giorno per 10 giorni.'], ['Fifteen minutes', 'Meditate 15 minutes a day for 10 days.']),
	q('meditazione-3', 'meditazione', 3, 30, 'self', ['Una giornata', 'Passa mezza giornata senza schermi, in silenzio o nella natura.'], ['A day of quiet', 'Spend half a day without screens, in silence or in nature.']),
	q('sonno-1', 'sonno', 1, 7, 'self', ['Stessa ora', 'Vai a letto alla stessa ora per 5 sere.'], ['Same time', 'Go to bed at the same time for 5 nights.']),
	q('sonno-2', 'sonno', 2, 14, 'self', ['Niente schermi', 'Niente schermi nei 30 minuti prima di dormire, per 10 sere.'], ['No screens', 'No screens in the 30 minutes before sleep, for 10 nights.']),
	q('sonno-3', 'sonno', 3, 30, 'self', ['Un mese regolare', 'Dormi almeno 7 ore per 25 notti su 30.'], ['A regular month', 'Sleep at least 7 hours on 25 of 30 nights.']),
	q('emozioni-1', 'emozioni', 1, 7, 'self', ['Dai un nome', "Ogni sera scrivi l'emozione più forte della giornata e cosa l'ha causata."], ['Name it', "Each evening write down the day's strongest emotion and its cause."]),
	q('emozioni-2', 'emozioni', 2, 14, 'self', ['Pausa', 'Quando ti arrabbi, aspetta 10 respiri prima di rispondere. Annota com\'è andata.'], ['Pause', 'When angry, wait 10 breaths before replying. Note how it went.']),
	q('emozioni-3', 'emozioni', 3, 30, 'self', ['Chiedi aiuto', 'Parla a qualcuno di fiducia di una difficoltà che tieni per te.'], ['Ask for help', 'Tell someone you trust about a difficulty you keep to yourself.']),
	// MESTIERE
	q('cucina-1', 'cucina', 1, 7, 'self', ['Un piatto nuovo', 'Cucina da zero un piatto che non hai mai fatto.'], ['A new dish', 'Cook a dish from scratch that you have never made.']),
	q('cucina-2', 'cucina', 2, 14, 'self', ['Una settimana di pranzi', 'Prepara i tuoi pranzi per 5 giorni con ingredienti semplici.'], ['A week of lunches', 'Prepare your own lunches for 5 days with simple ingredients.']),
	q('cucina-3', 'cucina', 3, 30, 'evidence', ['Cena per altri', 'Cucina una cena completa per almeno 4 persone.'], ['Dinner for others', 'Cook a full dinner for at least 4 people.']),
	q('riparazioni-1', 'riparazioni', 1, 7, 'self', ['Aggiusta una cosa', 'Ripara un oggetto rotto invece di buttarlo.'], ['Fix one thing', 'Repair a broken object instead of throwing it away.']),
	q('riparazioni-2', 'riparazioni', 2, 21, 'self', ['Kit di base', 'Impara a usare 5 attrezzi di base e fai 3 piccoli lavori in casa.'], ['Basic kit', 'Learn 5 basic tools and do 3 small jobs at home.']),
	q('riparazioni-3', 'riparazioni', 3, 45, 'evidence', ['Ripara per altri', 'Ripara un oggetto per qualcun altro, gratis.'], ['Repair for others', 'Repair something for someone else, for free.']),
	q('finanza-1', 'finanza', 1, 7, 'self', ['Dove vanno i soldi', 'Annota ogni spesa per 7 giorni.'], ['Where money goes', 'Write down every expense for 7 days.']),
	q('finanza-2', 'finanza', 2, 30, 'self', ['Un bilancio', 'Scrivi entrate e uscite di un mese e individua una spesa da ridurre.'], ['A budget', 'Write a month of income and spending and find one cost to cut.']),
	q('finanza-3', 'finanza', 3, 90, 'self', ['Fondo di riserva', 'Metti da parte una piccola somma ogni mese per 3 mesi.'], ['Emergency fund', 'Set aside a small amount every month for 3 months.']),
	// COMUNITÀ (si sblocca al livello 5)
	q('volontariato-1', 'volontariato', 1, 14, 'evidence', ['Prima volta', 'Dedica 3 ore a un ente di volontariato della tua zona.'], ['First time', 'Give 3 hours to a volunteer organisation near you.']),
	q('volontariato-2', 'volontariato', 2, 30, 'evidence', ['Con costanza', 'Fai volontariato 4 volte in un mese.'], ['Consistently', 'Volunteer 4 times in a month.']),
	q('volontariato-3', 'volontariato', 3, 90, 'peer', ['Dona', 'Dona il sangue o iscriviti al registro dei donatori di midollo, se puoi farlo.'], ['Donate', 'Give blood or join the bone marrow donor registry, if you are eligible.']),
	q('organizzazione-1', 'organizzazione', 1, 14, 'self', ['Un piccolo incontro', 'Organizza un incontro gratuito di 3 o più persone per imparare o fare qualcosa insieme.'], ['A small gathering', 'Organise a free meetup of 3+ people to learn or do something together.']),
	q('organizzazione-2', 'organizzazione', 2, 30, 'evidence', ['Pulizia', 'Organizza la pulizia di un parco, una spiaggia o una strada.'], ['Clean-up', 'Organise a clean-up of a park, beach or street.']),
	q('organizzazione-3', 'organizzazione', 3, 60, 'peer', ['Giornata aperta', 'Organizza una giornata gratuita aperta a tutti, per esempio di meditazione o di riparazioni.'], ['Open day', 'Organise a free day open to all, for example meditation or repairs.']),
	q('primo_soccorso-1', 'primo_soccorso', 1, 7, 'self', ['Numeri e posizioni', 'Impara il numero di emergenza e la posizione laterale di sicurezza.'], ['Numbers and positions', 'Learn the emergency number and the recovery position.']),
	q('primo_soccorso-2', 'primo_soccorso', 2, 30, 'evidence', ['Corso BLS', 'Frequenta un corso di rianimazione cardiopolmonare.'], ['CPR course', 'Attend a CPR course.']),
	q('primo_soccorso-3', 'primo_soccorso', 3, 90, 'evidence', ['Defibrillatore', 'Ottieni l\'abilitazione all\'uso del defibrillatore.'], ['Defibrillator', 'Get certified to use a defibrillator.'])
];

export const QUESTS: QuestTemplate[] = [...BASE_QUESTS, ...MORE_QUESTS];
