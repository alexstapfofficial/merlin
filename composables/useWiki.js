// ─── Wiki-Wissensbasis ───────────────────────────────────────────────────────
// Kuratiertes, statisches Nachschlagewissen in Merlins Stimme (warm, klar,
// tiefenpsychologisch). Wird von pages/wiki/index.vue (Übersicht) und
// pages/wiki/[category].vue (Detail-Akkordeon) gelesen.
//
// Jede Kategorie: { id, eyebrow, title, glyph, accent, glyphKind, intro, entries }
//   glyphKind: 'astro'  → Astronomicon-Font (Zeichen, Planeten)
//              'symbol' → normales Unicode-Symbol (Aspekte)
//              'number' → nummeriertes Abzeichen (Häuser)
//              'none'   → ohne Icon (Elemente & Qualitäten)
// Jeder Eintrag: { id, glyph, title, meta, essence, body }
//   essence → eine Zeile, eingeklappt sichtbar
//   body    → Markdown, ausgeklappt über renderMarkdown gerendert

const zeichen = [
  {
    id: 'widder', glyph: 'A', title: 'Widder', meta: '21. Mär – 20. Apr · Feuer · kardinal · Mars',
    essence: 'Der Anfang, der Mut, der erste Funke.',
    body: `**Der Widder ist der Aufbruch in Person – der Impuls, der losgeht, bevor der Zweifel ihn einholt.**

Als erstes Zeichen des Tierkreises steht der Widder für den reinen Anfang: den Mut, etwas zu beginnen, sich zu zeigen, das eigene Wollen zu spüren. Hier lebt eine direkte, ungebremste Lebensenergie. Widder-Anteile in dir wollen handeln, vorangehen, sich beweisen – und sie brauchen das Gefühl, frei losziehen zu dürfen.

Die Stärke ist Initiative und Mut. Die Lernkante: Geduld und die Frage, ob hinter dem schnellen Losstürmen manchmal die Angst steht, innezuhalten. Reifer Widder bedeutet, die eigene Kraft zu bündeln, statt sie zu verpuffen.`,
  },
  {
    id: 'stier', glyph: 'B', title: 'Stier', meta: '21. Apr – 20. Mai · Erde · fix · Venus',
    essence: 'Beständigkeit, Genuss und das Vertrauen ins Greifbare.',
    body: `**Der Stier sucht Halt – im Körper, in den Sinnen, in dem, was bleibt.**

Der Stier erdet die Impulse des Widders zu etwas Dauerhaftem. Hier geht es um Sicherheit, Genuss und Werte: Was ist mir wirklich wichtig, was nährt mich, worauf kann ich bauen? Stier-Anteile lieben das Verlässliche und die schönen, sinnlichen Seiten des Lebens – gutes Essen, Berührung, Ruhe, Natur.

Die Stärke ist Beständigkeit und ein tiefes Gespür für das Wesentliche. Die Lernkante: Loslassen. Wenn das Bedürfnis nach Sicherheit zur Sturheit wird, hält der Stier auch fest, was längst gehen dürfte.`,
  },
  {
    id: 'zwillinge', glyph: 'C', title: 'Zwillinge', meta: '21. Mai – 21. Jun · Luft · beweglich · Merkur',
    essence: 'Neugier, Sprache und die Lust am Verbinden.',
    body: `**Die Zwillinge wollen verstehen, indem sie fragen, sammeln und weitererzählen.**

Mit den Zwillingen kommt die Welt der Gedanken und Worte ins Spiel. Hier lebt eine wache, bewegliche Neugier, die Verbindungen knüpft – zwischen Menschen, Themen, Ideen. Zwillinge-Anteile in dir lernen leicht, reden gern und brauchen geistige Abwechslung wie andere die Luft zum Atmen.

Die Stärke ist Vielseitigkeit und Kommunikation. Die Lernkante: Tiefe. Wo so vieles gleichzeitig interessiert, fällt das Bei-einer-Sache-Bleiben schwer – Reife heißt hier, die Aufmerksamkeit auch mal zu vertiefen statt nur zu verteilen.`,
  },
  {
    id: 'krebs', glyph: 'D', title: 'Krebs', meta: '22. Jun – 22. Jul · Wasser · kardinal · Mond',
    essence: 'Gefühl, Geborgenheit und das innere Zuhause.',
    body: `**Der Krebs fühlt zuerst – und sucht den Ort, an dem er sich sicher öffnen kann.**

Der Krebs steht für Heimat, Familie und das emotionale Fundament. Hier geht es um Geborgenheit: das Bedürfnis, zu nähren und genährt zu werden, dazuzugehören, einen geschützten Innenraum zu haben. Krebs-Anteile in dir sind feinfühlig, fürsorglich und nehmen die Stimmungen anderer oft ungefiltert auf.

Die Stärke ist Empathie und emotionale Tiefe. Die Lernkante: der schützende Panzer. Wer so verletzlich fühlt, zieht sich bei Gefahr schnell zurück – Reife heißt, sich trotzdem zu zeigen und nicht jede Kränkung zur Mauer werden zu lassen.`,
  },
  {
    id: 'loewe', glyph: 'E', title: 'Löwe', meta: '23. Jul – 23. Aug · Feuer · fix · Sonne',
    essence: 'Strahlkraft, Schöpferlust und das Herz, das gesehen werden will.',
    body: `**Der Löwe will leuchten – nicht aus Eitelkeit, sondern weil sein Wesen nach Ausdruck drängt.**

Der Löwe steht für das schöpferische Selbst: für Großzügigkeit, Wärme und die Freude, sich zu zeigen. Hier lebt der Wunsch, etwas Eigenes in die Welt zu bringen und dafür Resonanz zu spüren. Löwe-Anteile in dir brauchen Bühne, Spiel und Anerkennung, um aufzublühen.

Die Stärke ist Herzlichkeit und natürliche Autorität. Die Lernkante: das Ego. Wenn die Anerkennung von außen zum Maß des eigenen Werts wird, wird aus Strahlen ein Bedürfen – reifer Löwe leuchtet, ohne den Applaus zu brauchen.`,
  },
  {
    id: 'jungfrau', glyph: 'F', title: 'Jungfrau', meta: '24. Aug – 23. Sep · Erde · beweglich · Merkur',
    essence: 'Genauigkeit, Hingabe und der Sinn fürs Verbessern.',
    body: `**Die Jungfrau will dienen, indem sie ordnet, verfeinert und das Brauchbare vom Überflüssigen trennt.**

Die Jungfrau bringt Analyse und Sorgfalt ins Spiel. Hier geht es um Alltag, Gesundheit, Handwerk – um das stille Bemühen, Dinge gut und richtig zu machen. Jungfrau-Anteile in dir sehen Details, die andere übersehen, und finden Sinn im Nützlichen und im Helfen.

Die Stärke ist Hingabe und ein klarer, prüfender Blick. Die Lernkante: der innere Kritiker. Wo alles perfekt sein soll, wird der prüfende Blick schnell zum strengen Urteil – über andere und vor allem über sich selbst.`,
  },
  {
    id: 'waage', glyph: 'G', title: 'Waage', meta: '24. Sep – 23. Okt · Luft · kardinal · Venus',
    essence: 'Harmonie, Beziehung und die Kunst des Ausgleichs.',
    body: `**Die Waage sucht das Miteinander – das feine Gleichgewicht zwischen Ich und Du.**

Die Waage steht für Beziehung, Ästhetik und Gerechtigkeit. Hier geht es um das Gegenüber: um Begegnung, Fairness, Schönheit und den Wunsch, die Dinge in Balance zu bringen. Waage-Anteile in dir wägen ab, vermitteln und spüren feinfühlig, was eine Situation harmonisch macht.

Die Stärke ist Diplomatie und ein Gespür für das Verbindende. Die Lernkante: die eigene Position. Wer ständig ausgleicht, verliert sich leicht im Wunsch, es allen recht zu machen – Reife heißt, auch die unbequeme eigene Wahrheit zu vertreten.`,
  },
  {
    id: 'skorpion', glyph: 'H', title: 'Skorpion', meta: '24. Okt – 22. Nov · Wasser · fix · Pluto',
    essence: 'Tiefe, Leidenschaft und die Kraft der Wandlung.',
    body: `**Der Skorpion geht dorthin, wo es ernst wird – unter die Oberfläche, an die Wurzel, ins Tabu.**

Der Skorpion steht für Intensität und Verwandlung. Hier geht es um das, was verborgen ist: tiefe Bindung, Macht, Krisen, das Sterben und Werden in uns. Skorpion-Anteile in dir spüren das Echte hinter der Fassade und scheuen die dunklen, kraftvollen Themen des Lebens nicht.

Die Stärke ist Tiefe, Treue und Wandlungskraft. Die Lernkante: Kontrolle und Misstrauen. Wer so tief fühlt, hat auch viel zu verlieren – reifer Skorpion lernt, loszulassen statt festzuhalten, und Macht in Vertrauen zu verwandeln.`,
  },
  {
    id: 'schuetze', glyph: 'I', title: 'Schütze', meta: '23. Nov – 21. Dez · Feuer · beweglich · Jupiter',
    essence: 'Weite, Sinnsuche und die Sehnsucht nach dem Horizont.',
    body: `**Der Schütze will über sich hinaus – nach Wahrheit, Sinn und neuen Horizonten.**

Der Schütze steht für Weite und Vertrauen ins Leben. Hier geht es um den großen Zusammenhang: Philosophie, Glaube, Reisen, Bildung – um alles, was den eigenen Horizont weitet. Schütze-Anteile in dir sind optimistisch, freiheitsliebend und immer auf der Suche nach dem tieferen Warum.

Die Stärke ist Zuversicht und Begeisterung. Die Lernkante: Maß und Verbindlichkeit. Wo es immer weiter und größer sein soll, geraten Detail, Geduld und das konkrete Hier-Bleiben leicht aus dem Blick.`,
  },
  {
    id: 'steinbock', glyph: 'J', title: 'Steinbock', meta: '22. Dez – 20. Jan · Erde · kardinal · Saturn',
    essence: 'Struktur, Verantwortung und der lange Atem.',
    body: `**Der Steinbock baut – geduldig, verantwortungsvoll, mit Blick auf das, was Bestand hat.**

Der Steinbock steht für Reife, Disziplin und Verantwortung. Hier geht es um den ernsthaften Weg nach oben: um Ziele, Struktur, Leistung und das Erwachsenwerden. Steinbock-Anteile in dir können warten, durchhalten und tragen – sie nehmen das Leben ernst und übernehmen Verantwortung.

Die Stärke ist Ausdauer und Integrität. Die Lernkante: Härte gegen sich selbst. Wo nur Leistung zählt, kommen Gefühl, Spiel und Selbstmitgefühl zu kurz – Reife heißt, auch den eigenen Wert jenseits des Geleisteten zu spüren.`,
  },
  {
    id: 'wassermann', glyph: 'K', title: 'Wassermann', meta: '21. Jan – 19. Feb · Luft · fix · Uranus',
    essence: 'Freiheit, Vision und der Mut zum eigenen Weg.',
    body: `**Der Wassermann denkt voraus – unabhängig, eigenwillig, dem nächsten Schritt der Menschheit zugewandt.**

Der Wassermann steht für Individualität und Gemeinschaft zugleich: für Freiheit, Originalität und Visionen einer besseren Zukunft. Hier lebt der Mut, anders zu sein und Bestehendes zu hinterfragen. Wassermann-Anteile in dir brauchen geistige Unabhängigkeit und fühlen sich Idealen oft mehr verbunden als Konventionen.

Die Stärke ist Originalität und Weitblick. Die Lernkante: Nähe. Wo das Ideal und die Freiheit über allem stehen, kann das warme, verletzliche Gefühl auf Distanz geraten – Reife heißt, Kopf und Herz zu verbinden.`,
  },
  {
    id: 'fische', glyph: 'L', title: 'Fische', meta: '20. Feb – 20. Mär · Wasser · beweglich · Neptun',
    essence: 'Mitgefühl, Hingabe und die Auflösung der Grenzen.',
    body: `**Die Fische spüren das große Ganze – die feinen Verbindungen, in denen alles mit allem verwoben ist.**

Als letztes Zeichen schließt der Fisch den Kreis: Hier lösen sich die Grenzen des Ichs auf. Es geht um Mitgefühl, Spiritualität, Fantasie und die Sehnsucht nach Verbundenheit mit etwas Größerem. Fische-Anteile in dir sind durchlässig, intuitiv und tief berührbar.

Die Stärke ist grenzenloses Mitgefühl und Vorstellungskraft. Die Lernkante: Abgrenzung. Wer so durchlässig ist, verliert leicht den Boden, übernimmt fremdes Leid oder flüchtet in Traumwelten – Reife heißt, das Feine zu fühlen und trotzdem geerdet zu bleiben.`,
  },
];

const qualitaeten = [
  // ── Die vier Elemente ──
  {
    id: 'feuer', section: 'Die vier Elemente', title: 'Feuer', meta: 'Widder · Löwe · Schütze',
    essence: 'Begeisterung, Tatkraft und der Funke des Wollens.',
    body: `**Feuer ist die Energie des Wollens – Begeisterung, die nach außen drängt.**

Die Feuerzeichen (Widder, Löwe, Schütze) leben aus Intuition, Mut und Lebenslust. Wo Feuer stark ist, gibt es Antrieb, Spontaneität und die Fähigkeit zu begeistern. Es ist die Kraft, die etwas in Bewegung setzt und an Möglichkeiten glaubt.

Im Übermaß kann Feuer überhitzen: ungeduldig, selbstbezogen, schnell entflammt und schnell wieder ausgebrannt. Fehlt es, fällt es schwer, ins Tun zu kommen und das eigene Wollen zu spüren.`,
  },
  {
    id: 'erde', section: 'Die vier Elemente', title: 'Erde', meta: 'Stier · Jungfrau · Steinbock',
    essence: 'Verlässlichkeit, Sinnlichkeit und das Greifbare.',
    body: `**Erde ist die Energie des Verwirklichens – das, was Bestand hat und sich anfassen lässt.**

Die Erdzeichen (Stier, Jungfrau, Steinbock) stehen für das Konkrete: Körper, Material, Praxis, Geduld. Wo Erde stark ist, gibt es Verlässlichkeit, Ausdauer und ein gutes Gespür für die Realität. Es ist die Kraft, die Ideen in die Welt bringt und am Boden hält.

Im Übermaß kann Erde schwer und starr werden: zu sehr auf Sicherheit bedacht, misstrauisch gegen Veränderung. Fehlt sie, geraten Struktur, Geduld und das Verwurzeltsein im Alltag ins Wanken.`,
  },
  {
    id: 'luft', section: 'Die vier Elemente', title: 'Luft', meta: 'Zwillinge · Waage · Wassermann',
    essence: 'Denken, Austausch und die Distanz, die Überblick schenkt.',
    body: `**Luft ist die Energie des Verstehens – der Geist, der ordnet, verbindet und Abstand nimmt.**

Die Luftzeichen (Zwillinge, Waage, Wassermann) leben aus Gedanken, Sprache und Beziehung. Wo Luft stark ist, gibt es Überblick, Objektivität und die Fähigkeit, sich auszutauschen und Brücken zu bauen. Es ist die Kraft, die Distanz schafft und dadurch klar sehen kann.

Im Übermaß kann Luft abheben: zu sehr im Kopf, im Reden, im Abwägen – und damit fern vom Gefühl. Fehlt sie, fällt es schwer, Abstand zu gewinnen und die Dinge nüchtern einzuordnen.`,
  },
  {
    id: 'wasser', section: 'Die vier Elemente', title: 'Wasser', meta: 'Krebs · Skorpion · Fische',
    essence: 'Gefühl, Empathie und die Tiefe unter der Oberfläche.',
    body: `**Wasser ist die Energie des Fühlens – die Tiefe, die verbindet und mitschwingt.**

Die Wasserzeichen (Krebs, Skorpion, Fische) leben aus Empfindung, Intuition und Mitgefühl. Wo Wasser stark ist, gibt es emotionale Tiefe, Feingespür und die Fähigkeit, sich einzufühlen und zu binden. Es ist die Kraft, die unter die Oberfläche reicht.

Im Übermaß kann Wasser überfluten: zu durchlässig, zu sehr von Stimmungen getragen, ohne klare Grenze zwischen Ich und Du. Fehlt es, geraten Empathie, Intuition und das Zulassen von Nähe in den Hintergrund.`,
  },
  // ── Die drei Qualitäten / Modalitäten ──
  {
    id: 'kardinal', section: 'Die drei Qualitäten', title: 'Kardinal', meta: 'Widder · Krebs · Waage · Steinbock',
    essence: 'Der Anfang: Initiative und das Setzen von Impulsen.',
    body: `**Kardinal ist die Qualität des Anfangs – die Kraft, etwas in Gang zu setzen.**

Die kardinalen Zeichen stehen jeweils am Beginn einer Jahreszeit (Widder/Frühling, Krebs/Sommer, Waage/Herbst, Steinbock/Winter). Sie verkörpern Initiative: Wo diese Qualität stark ist, gibt es Tatendrang, Führung und den Anstoß zu Neuem. Kardinale Energie eröffnet, entscheidet, beginnt.

Die Lernkante: dranzubleiben. Anfangen fällt leicht – das geduldige Durchhalten und Vollenden ist die andere Aufgabe.`,
  },
  {
    id: 'fix', section: 'Die drei Qualitäten', title: 'Fix', meta: 'Stier · Löwe · Skorpion · Wassermann',
    essence: 'Die Mitte: Beständigkeit, Tiefe und Halten.',
    body: `**Fix ist die Qualität der Beständigkeit – die Kraft, etwas zu halten und zu vertiefen.**

Die fixen Zeichen stehen in der Mitte jeder Jahreszeit, wenn sie voll entfaltet ist. Sie verkörpern Stabilität: Wo diese Qualität stark ist, gibt es Ausdauer, Treue, Willenskraft und die Fähigkeit, durchzuhalten und zu verankern. Fixe Energie baut auf und bleibt.

Die Lernkante: Loslassen. Wo so viel gehalten wird, kann Beständigkeit zur Starre werden – die Kunst ist, auch Veränderung zuzulassen.`,
  },
  {
    id: 'beweglich', section: 'Die drei Qualitäten', title: 'Beweglich', meta: 'Zwillinge · Jungfrau · Schütze · Fische',
    essence: 'Der Übergang: Anpassung, Wandel und Flexibilität.',
    body: `**Beweglich ist die Qualität des Übergangs – die Kraft, sich anzupassen und zu wandeln.**

Die beweglichen (veränderlichen) Zeichen stehen am Ende jeder Jahreszeit, im Übergang zur nächsten. Sie verkörpern Flexibilität: Wo diese Qualität stark ist, gibt es Anpassungsfähigkeit, Vielseitigkeit und ein feines Gespür für Wandel. Bewegliche Energie vermittelt, verbindet und lässt los.

Die Lernkante: Verbindlichkeit. Wo alles im Fluss bleibt, fällt das Festlegen und Standhalten schwer – die Kunst ist, beweglich zu sein, ohne die Richtung zu verlieren.`,
  },
];

const haeuser = [
  { id: 'haus-1', n: 1, title: '1. Haus', meta: 'Selbst · Auftreten · Aszendent', essence: 'Wie du dich zeigst und ins Leben trittst.',
    body: `**Das 1. Haus ist die Schwelle, an der du in die Welt trittst – dein Auftreten, deine erste Geste.**\n\nHier beginnt das Horoskop, am Aszendenten. Das 1. Haus beschreibt, wie du wirkst, wie du dich zeigst und mit welcher Haltung du dem Leben begegnest. Es ist die Tür zwischen innen und außen: dein Temperament, dein Körper, dein erster Eindruck.\n\nPlaneten hier prägen deine ganze Art, sichtbar zu werden. Es geht um die Frage: Wer bin ich – und wie zeige ich mich?`,
  },
  { id: 'haus-2', n: 2, title: '2. Haus', meta: 'Werte · Besitz · Selbstwert', essence: 'Was dir Sicherheit gibt und was dir wirklich wert ist.',
    body: `**Das 2. Haus fragt: Worauf kann ich bauen – und was ist mir wirklich wert?**\n\nHier geht es um Sicherheit und Wert: um Besitz, Geld, Talente und den eigenen Körper, aber tiefer noch um den Selbstwert. Was brauche ich, um mich sicher zu fühlen? Worauf gründe ich mein Vertrauen ins Leben?\n\nPlaneten hier zeigen, wie du mit dem Materiellen und mit deinem inneren Wertgefühl umgehst – und woraus du Stabilität schöpfst.`,
  },
  { id: 'haus-3', n: 3, title: '3. Haus', meta: 'Kommunikation · Lernen · Umfeld', essence: 'Wie du denkst, lernst und dich mitteilst.',
    body: `**Das 3. Haus ist der Raum des Austauschs – Gedanken, Worte, das nahe Umfeld.**\n\nHier geht es um Kommunikation und Lernen: ums Denken, Reden, Schreiben, um Geschwister, Nachbarn und den alltäglichen Wissensdurst. Das 3. Haus beschreibt, wie du Eindrücke verarbeitest und dich mit deiner Umwelt verständigst.\n\nPlaneten hier prägen deine Art zu lernen und zu kommunizieren – neugierig, sachlich, lebhaft oder bedacht.`,
  },
  { id: 'haus-4', n: 4, title: '4. Haus', meta: 'Wurzeln · Zuhause · Herkunft', essence: 'Wo du herkommst und wo deine Seele zuhause ist.',
    body: `**Das 4. Haus ist das innere Zuhause – deine Wurzeln, deine Herkunft, dein seelischer Grund.**\n\nAm tiefsten Punkt des Horoskops (dem IC) geht es um Familie, Heimat und das Fundament, auf dem du stehst. Hier liegen deine Prägungen aus der Kindheit und der Ort, an dem du wirklich du selbst sein kannst.\n\nPlaneten hier zeigen, was dir Geborgenheit gibt und welche familiären Muster dich geformt haben – die Quelle, aus der du innerlich schöpfst.`,
  },
  { id: 'haus-5', n: 5, title: '5. Haus', meta: 'Kreativität · Liebe · Spiel', essence: 'Wie du dich schöpferisch ausdrückst und liebst.',
    body: `**Das 5. Haus ist die Bühne des Herzens – Schöpferkraft, Spiel, Verliebtsein.**\n\nHier geht es um den lebendigen Selbstausdruck: Kreativität, Romantik, Lust, Kinder und alles, was Freude macht. Das 5. Haus ist der Raum, in dem du etwas Eigenes in die Welt bringst und dich am Spiel des Lebens erfreust.\n\nPlaneten hier zeigen, wie und wo du strahlst, was dein Herz zum Leuchten bringt und wie du Liebe und Schöpferlust lebst.`,
  },
  { id: 'haus-6', n: 6, title: '6. Haus', meta: 'Alltag · Arbeit · Gesundheit', essence: 'Wie du dienst, arbeitest und für dich sorgst.',
    body: `**Das 6. Haus ist der Alltag – die kleinen Dinge, die das Leben tragen.**\n\nHier geht es um Arbeit, Routine, Gesundheit und Dienst. Das 6. Haus beschreibt, wie du deinen Alltag ordnest, wie du dich um Körper und Aufgaben kümmerst und wie du dich nützlich machst. Es ist der Raum des Verfeinerns und der täglichen Hingabe.\n\nPlaneten hier zeigen, wie du arbeitest, mit Gesundheit umgehst und im Konkreten Sinn findest.`,
  },
  { id: 'haus-7', n: 7, title: '7. Haus', meta: 'Partnerschaft · Begegnung · Du', essence: 'Wie du dem anderen begegnest und dich bindest.',
    body: `**Das 7. Haus ist das Du – die Begegnung auf Augenhöhe.**\n\nGegenüber dem 1. Haus geht es hier um Partnerschaft: um die enge Beziehung, die Ehe, aber auch um Verträge und das, was wir im Anderen suchen und spiegeln. Das 7. Haus zeigt, wie du Nähe gestaltest und was du dir vom Gegenüber wünschst.\n\nPlaneten hier prägen deine Beziehungen und das Bild des Menschen, der dich ergänzt – oder herausfordert.`,
  },
  { id: 'haus-8', n: 8, title: '8. Haus', meta: 'Wandel · Tiefe · Bindung', essence: 'Wie du dich tief verbindest, loslässt und dich wandelst.',
    body: `**Das 8. Haus ist die Tiefe – Verschmelzung, Krise, Verwandlung.**\n\nHier geht es um das Existenzielle: tiefe Bindung, Sexualität, gemeinsame Werte, aber auch um Verlust, Loslassen und das Stirb-und-Werde. Das 8. Haus ist der Raum, in dem wir uns ganz einlassen und dabei verwandelt werden.\n\nPlaneten hier zeigen, wie du mit Tiefe, Macht, Vertrauen und den großen Übergängen des Lebens umgehst.`,
  },
  { id: 'haus-9', n: 9, title: '9. Haus', meta: 'Sinn · Reisen · Philosophie', essence: 'Wie du nach Sinn suchst und deinen Horizont weitest.',
    body: `**Das 9. Haus ist die Weite – Sinnsuche, Ferne, der große Zusammenhang.**\n\nHier geht es um alles, was den Horizont weitet: Philosophie, Glaube, höhere Bildung, fremde Länder und Kulturen. Das 9. Haus beschreibt, wie du nach Wahrheit und Bedeutung suchst und woran du dein Leben ausrichtest.\n\nPlaneten hier zeigen, wie du glaubst, lernst und über den eigenen Tellerrand hinaussiehst.`,
  },
  { id: 'haus-10', n: 10, title: '10. Haus', meta: 'Berufung · Status · MC', essence: 'Wohin du strebst und was du in der Welt bewirkst.',
    body: `**Das 10. Haus ist der Gipfel – deine Berufung, dein Platz in der Welt.**\n\nAm höchsten Punkt des Horoskops (dem MC) geht es um Beruf, Ziele, Verantwortung und öffentliches Ansehen. Das 10. Haus zeigt, wohin du strebst, wofür du gesehen werden willst und welchen Beitrag du leisten möchtest.\n\nPlaneten hier prägen deinen Weg nach außen, deine Ambitionen und das Bild, das du in der Welt hinterlässt.`,
  },
  { id: 'haus-11', n: 11, title: '11. Haus', meta: 'Freundschaft · Visionen · Gemeinschaft', essence: 'Wie du dich verbündest und in die Zukunft denkst.',
    body: `**Das 11. Haus ist das Wir – Freundschaft, Gemeinschaft, Zukunftsbilder.**\n\nHier geht es um Gruppen, Freundeskreise, Ideale und Visionen. Das 11. Haus beschreibt, wie du dich mit Gleichgesinnten verbindest, wofür du dich einsetzt und welche Hoffnungen dich tragen. Es ist der Raum des größeren Miteinanders.\n\nPlaneten hier zeigen, wie du Freundschaften lebst und welche Ziele du gemeinsam mit anderen verfolgst.`,
  },
  { id: 'haus-12', n: 12, title: '12. Haus', meta: 'Rückzug · Unbewusstes · Hingabe', essence: 'Was im Verborgenen wirkt und wo du dich auflöst.',
    body: `**Das 12. Haus ist das Verborgene – Rückzug, Unbewusstes, Hingabe.**\n\nAls letztes Haus geht es hier um das, was sich der direkten Sicht entzieht: das Unbewusste, alte Muster, Spiritualität, Stille und Auflösung. Das 12. Haus ist der Raum, in dem die Grenzen des Ichs weicher werden – durch Meditation, Kunst, Mitgefühl oder Rückzug.\n\nPlaneten hier wirken oft im Stillen und zeigen, wo du dich hingibst, loslässt und mit etwas Größerem verbindest.`,
  },
];

const aspekte = [
  { id: 'konjunktion', glyph: '☌', title: 'Konjunktion', meta: '0° · Verschmelzung', essence: 'Zwei Kräfte verschmelzen zu einer.',
    body: `**Die Konjunktion verbindet zwei Planeten so eng, dass sie als eine Kraft wirken.**\n\nStehen zwei Planeten auf demselben Punkt, vermischen sich ihre Energien untrennbar. Sie verstärken einander und färben sich gegenseitig. Eine Konjunktion ist kraftvoll und prägend – sie zeigt, wo in dir zwei Themen unzertrennlich zusammengehören.\n\nOb das harmonisch oder spannungsvoll wirkt, hängt von den beteiligten Planeten ab. Auf jeden Fall ist hier ein Brennpunkt deiner Persönlichkeit, ein Ort konzentrierter Energie.`,
  },
  { id: 'sextil', glyph: '⚹', title: 'Sextil', meta: '60° · Angebot', essence: 'Eine leichte Unterstützung, die genutzt werden will.',
    body: `**Das Sextil ist ein Angebot – eine Begabung, die sich entfaltet, wenn du sie ergreifst.**\n\nIm 60°-Winkel arbeiten zwei Planeten freundlich zusammen. Anders als das mühelose Trigon will das Sextil ein wenig zugetan werden: Es öffnet Türen und schenkt Chancen, doch du musst hindurchgehen. Es ist eine sanfte, anregende Verbindung.\n\nSextile zeigen Talente und Möglichkeiten, die leicht zugänglich sind – Potenziale, die mit etwas Eigeninitiative zu echten Stärken werden.`,
  },
  { id: 'quadrat', glyph: '□', title: 'Quadrat', meta: '90° · Spannung', essence: 'Reibung, die zum Handeln und Wachsen treibt.',
    body: `**Das Quadrat ist die produktive Spannung – die Reibung, an der du wächst.**\n\nIm 90°-Winkel stoßen zwei Planeten aneinander, ohne sich leicht zu einigen. Das erzeugt inneren Druck, Konflikte, das Gefühl von Blockaden. Doch genau diese Reibung ist ein Motor: Sie zwingt dich, dich auseinanderzusetzen, Lösungen zu finden, dich zu entwickeln.\n\nQuadrate sind keine Schwäche, sondern Wachstumskanten. Was hier zunächst unbequem ist, wird oft zur Quelle deiner größten Kraft.`,
  },
  { id: 'trigon', glyph: '△', title: 'Trigon', meta: '120° · Fluss', essence: 'Müheloser Fluss – ein angeborenes Talent.',
    body: `**Das Trigon ist der mühelose Fluss – ein Talent, das dir wie selbstverständlich gegeben ist.**\n\nIm 120°-Winkel verbinden sich zwei Planeten in tiefem Einklang. Ihre Energien strömen leicht und harmonisch zusammen. Trigone schenken Begabungen, die sich natürlich anfühlen – Dinge, die dir ohne große Anstrengung gelingen.\n\nDie Kehrseite: Was mühelos da ist, wird leicht übersehen oder bequem. Reife heißt, dieses Geschenk bewusst zu nutzen, statt es ungenutzt schlummern zu lassen.`,
  },
  { id: 'opposition', glyph: '☍', title: 'Opposition', meta: '180° · Polarität', essence: 'Zwei Pole, die nach Balance suchen.',
    body: `**Die Opposition spannt einen Bogen zwischen zwei Polen, die nach Gleichgewicht ringen.**\n\nIm 180°-Winkel stehen sich zwei Planeten gegenüber wie zwei Enden einer Waage. Sie ziehen in entgegengesetzte Richtungen – das kann sich wie ein innerer Widerspruch oder wie ein Hin-und-Her zwischen zwei Bedürfnissen anfühlen.\n\nOft erleben wir den einen Pol im Außen, in Begegnungen und Beziehungen. Die Aufgabe ist Integration: nicht das Eine gegen das Andere, sondern beide Seiten in Balance zu bringen.`,
  },
];

const planeten = [
  { id: 'sonne', glyph: 'Q', title: 'Sonne', meta: 'Kern · Wille · Identität', essence: 'Dein Wesenskern und deine Lebenskraft.',
    body: `**Die Sonne ist dein innerster Kern – wer du im Tiefsten bist und sein willst.**\n\nSie steht für Identität, Wille und Lebenskraft: das schöpferische Zentrum, um das alles andere kreist. Das Zeichen deiner Sonne beschreibt, wofür dein Herz schlägt und worin du dich am meisten selbst bist. Sie ist einer der Big Three.\n\nWo deine Sonne steht, willst du leuchten und dich verwirklichen – es ist die Quelle deiner Vitalität und deines Selbstgefühls.`,
  },
  { id: 'mond', glyph: 'R', title: 'Mond', meta: 'Gefühl · Bedürfnis · Geborgenheit', essence: 'Deine Gefühlswelt und dein inneres Kind.',
    body: `**Der Mond ist deine Gefühlswelt – das, was du brauchst, um dich geborgen zu fühlen.**\n\nEr steht für Emotionen, Instinkte und das innere Kind. Während die Sonne zeigt, wer du sein willst, zeigt der Mond, wie du fühlst und was dir Sicherheit gibt. Er ist einer der Big Three und besonders prägend.\n\nDein Mond verrät deine unbewussten Reaktionen, deine seelische Heimat und das, was dich wirklich nährt.`,
  },
  { id: 'merkur', glyph: 'S', title: 'Merkur', meta: 'Denken · Sprache · Lernen', essence: 'Wie du denkst, lernst und kommunizierst.',
    body: `**Merkur ist dein Geist – wie du denkst, lernst und dich mitteilst.**\n\nEr steht für Verstand, Sprache, Neugier und den Austausch von Informationen. Das Zeichen deines Merkur beschreibt, wie du Eindrücke verarbeitest, Entscheidungen durchdenkst und dich anderen verständlich machst.\n\nMerkur zeigt deinen Denkstil – schnell oder gründlich, sachlich oder bildhaft, neugierig oder fokussiert.`,
  },
  { id: 'venus', glyph: 'T', title: 'Venus', meta: 'Liebe · Werte · Genuss', essence: 'Wie du liebst, genießt und Schönes anziehst.',
    body: `**Venus ist deine Fähigkeit zu lieben und zu genießen – was du schön findest und wertschätzt.**\n\nSie steht für Liebe, Beziehung, Werte, Genuss und Ästhetik. Das Zeichen deiner Venus zeigt, wie du Nähe gestaltest, was dich anzieht und worin du Freude und Harmonie findest.\n\nVenus verrät, wie du Zuneigung gibst und empfängst und welche Werte deinem Herzen wichtig sind.`,
  },
  { id: 'mars', glyph: 'U', title: 'Mars', meta: 'Antrieb · Mut · Begehren', essence: 'Wie du handelst, dich durchsetzt und begehrst.',
    body: `**Mars ist deine Tatkraft – wie du willst, kämpfst und dich durchsetzt.**\n\nEr steht für Antrieb, Mut, Energie und Begehren. Das Zeichen deines Mars zeigt, wie du an Dinge herangehst, wofür du brennst und wie du mit Wut und Konflikt umgehst.\n\nMars verrät, wie du deine Ziele verfolgst und deine Kraft in die Welt bringst – impulsiv, beharrlich, strategisch oder leidenschaftlich.`,
  },
  { id: 'jupiter', glyph: 'V', title: 'Jupiter', meta: 'Wachstum · Sinn · Weite', essence: 'Wo du wächst, vertraust und über dich hinausgehst.',
    body: `**Jupiter ist deine Weite – wo du wächst, vertraust und das Leben großzügig umarmst.**\n\nEr steht für Wachstum, Sinn, Optimismus und Großzügigkeit. Das Zeichen deines Jupiter zeigt, wo du dich ausdehnen willst, woran du glaubst und wo dir das Leben Fülle schenkt.\n\nJupiter verrät, wo du Vertrauen und Zuversicht findest – aber auch, wo Maßlosigkeit zur Lernaufgabe wird.`,
  },
  { id: 'saturn', glyph: 'W', title: 'Saturn', meta: 'Struktur · Reife · Grenze', essence: 'Wo du reifst, Verantwortung trägst und an Grenzen wächst.',
    body: `**Saturn ist dein innerer Lehrmeister – wo du reifst, indem du Verantwortung übernimmst.**\n\nEr steht für Struktur, Disziplin, Grenzen und Ausdauer. Das Zeichen deines Saturn zeigt, wo du dich anfangs unsicher oder geprüft fühlst – und genau dort durch Geduld und Ernsthaftigkeit zu echter Meisterschaft wächst.\n\nSaturn verrät deine Lebensaufgabe: was zunächst schwer ist, wird zum Fundament deiner Reife.`,
  },
  { id: 'uranus', glyph: 'X', title: 'Uranus', meta: 'Freiheit · Erneuerung · Originalität', essence: 'Wo du anders bist und nach Freiheit strebst.',
    body: `**Uranus ist der Blitz der Erneuerung – wo du eigenwillig, frei und unkonventionell bist.**\n\nEr steht für Freiheit, Originalität, plötzliche Wendungen und den Bruch mit dem Gewohnten. Als langsamer Planet prägt er ganze Generationen, doch sein Haus zeigt, wo du persönlich nach Unabhängigkeit und Erneuerung strebst.\n\nUranus verrät, wo du aus der Reihe tanzt und wo das Leben dich überrascht und befreit.`,
  },
  { id: 'neptun', glyph: 'Y', title: 'Neptun', meta: 'Intuition · Traum · Mitgefühl', essence: 'Wo du dich sehnst, träumst und auflöst.',
    body: `**Neptun ist der Nebel der Sehnsucht – wo du träumst, mitfühlst und dich mit etwas Größerem verbindest.**\n\nEr steht für Intuition, Spiritualität, Fantasie und Auflösung. Als langsamer Planet prägt er Generationen, doch sein Haus zeigt, wo du persönlich nach Hingabe und Transzendenz suchst – und wo Illusion und Klarheit ringen.\n\nNeptun verrät, wo deine feinsten Sehnsüchte liegen und wo Grenzen weich werden.`,
  },
  { id: 'pluto', glyph: 'Z', title: 'Pluto', meta: 'Wandlung · Macht · Tiefe', essence: 'Wo du dich tief wandelst und neu geboren wirst.',
    body: `**Pluto ist die Kraft der Verwandlung – wo du durch Krisen hindurch zu neuer Tiefe findest.**\n\nEr steht für Wandlung, Macht, Tiefe und das Stirb-und-Werde. Als langsamster Planet prägt er Generationen, doch sein Haus zeigt, wo du persönlich existenzielle Verwandlung erlebst – wo du loslassen, dich häuten und neu erstehen darfst.\n\nPluto verrät, wo deine größte Kraft und deine tiefsten Themen verborgen liegen.`,
  },
];

const CATEGORIES = [
  {
    id: 'zeichen', eyebrow: '12 Tierkreiszeichen', title: 'Zeichen',
    glyph: 'G', glyphKind: 'astro', accent: 'var(--gold)', count: 12,
    intro: 'Die zwölf Zeichen sind die Grundfarben der Astrologie – zwölf Arten, das Leben zu erleben. Jeder Planet wird durch das Zeichen gefärbt, in dem er steht.',
    entries: zeichen,
  },
  {
    id: 'qualitaeten', eyebrow: '4 Elemente · 3 Qualitäten', title: 'Elemente & Qualitäten',
    glyph: '△', glyphKind: 'none', accent: 'var(--cool)', count: 7,
    intro: 'Hinter den zwölf Zeichen liegen zwei Ordnungen: die vier Elemente (wie eine Energie sich anfühlt) und die drei Qualitäten (wie sie sich bewegt). Zusammen ergeben sie das Temperament eines Zeichens.',
    entries: qualitaeten,
  },
  {
    id: 'haeuser', eyebrow: '12 Häuser', title: 'Häuser',
    glyph: '4', glyphKind: 'number', accent: 'var(--plum)', count: 12,
    intro: 'Wenn die Zeichen das Wie beschreiben, zeigen die Häuser das Wo: die zwölf Lebensbereiche, in denen sich deine Anlagen entfalten – von der Selbstdarstellung bis zum Verborgenen.',
    entries: haeuser,
  },
  {
    id: 'aspekte', eyebrow: '5 Hauptaspekte', title: 'Aspekte',
    glyph: '△', glyphKind: 'symbol', accent: 'var(--ink)', count: 5,
    intro: 'Aspekte sind die Winkel zwischen den Planeten – die Gespräche, die sie miteinander führen. Sie zeigen, wie deine inneren Kräfte zusammenspielen: harmonisch, spannungsvoll oder verschmolzen.',
    entries: aspekte,
  },
  {
    id: 'planeten', eyebrow: '10 Planeten', title: 'Planeten',
    glyph: 'Q', glyphKind: 'astro', accent: 'var(--gold)', count: 10,
    intro: 'Die Planeten sind die handelnden Kräfte im Horoskop – die seelischen Funktionen in dir. Jeder steht für ein Grundbedürfnis: lieben, denken, handeln, wachsen, reifen.',
    entries: planeten,
  },
];

export const useWiki = () => {
  const categories = CATEGORIES;
  const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || null;
  return { categories, getCategory };
};
