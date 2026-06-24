// Minimal, dependency-free Markdown → HTML for our own (server-generated)
// interpretation text. HTML is escaped first, so only our markup is emitted.
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Inline emphasis. Bold first, then italic — the character classes avoid
// chewing across markers (so "**a** und **b**" and "***x***" stay intact).
const inline = (t) =>
  t
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

// Plain text without emphasis markers — used for prefix detection.
const plain = (s) => s.replace(/[*_`]/g, '').trim();

export const renderMarkdown = (md) => {
  if (!md) return '';
  const lines = escapeHtml(md.replace(/\r\n/g, '\n')).split('\n');

  let html = '';
  let listType = null; // 'ul' | 'ol' | null
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
  const openList = (type) => {
    if (listType !== type) { closeList(); html += `<${type}>`; listType = type; }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }

    // Überschriften: #/## → h2, ###+ → h3 (unser Design kennt nur diese zwei)
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      closeList();
      const tag = heading[1].length <= 2 ? 'h2' : 'h3';
      html += `<${tag}>${inline(heading[2])}</${tag}>`;
      continue;
    }

    // Aufzählungen (ungeordnet)
    if (/^[-*]\s+/.test(line)) {
      openList('ul');
      html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`;
      continue;
    }
    // Aufzählungen (nummeriert)
    if (/^\d+\.\s+/.test(line)) {
      openList('ol');
      html += `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`;
      continue;
    }

    closeList();

    // Reflexionsfrage („Zum Nachspüren: …") → eigener Callout, egal ob kursiv
    if (/^zum nachsp/i.test(plain(line))) {
      const inner = line.replace(/^\*+/, '').replace(/\*+$/, '').trim();
      html += `<p class="md-reflect">${inline(inner)}</p>`;
      continue;
    }

    // Kernsatz: die ganze Zeile ist fett → Pull-Quote
    const allBold = line.match(/^\*\*([^*].*?)\*\*$/);
    if (allBold && !allBold[1].includes('**')) {
      html += `<p class="md-key">${inline(allBold[1].trim())}</p>`;
      continue;
    }

    html += `<p>${inline(line)}</p>`;
  }

  closeList();
  return html;
};

export const useMarkdown = () => ({ renderMarkdown });
