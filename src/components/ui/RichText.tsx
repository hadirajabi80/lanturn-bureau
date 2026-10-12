import type { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Tiny markdown-ish renderer for puzzle prompts, clue details and briefings.
 * Supports: paragraphs, line breaks, **bold**, *italic*, `code`, ``` fenced blocks,
 * "- " / "1. " lists, "> " quotes and pipe tables (| a | b |, with |---| separator).
 */
export function RichText({ text, className, tone = 'dark' }: { text: string; className?: string; tone?: 'dark' | 'paper' }) {
  return <div className={clsx('space-y-3 leading-relaxed', className)}>{renderBlocks(text, tone)}</div>;
}

type Tone = 'dark' | 'paper';

function renderInline(s: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) out.push(<strong key={k} className="font-semibold">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) {
      out.push(
        <code key={k} className="rounded bg-print-paper px-1.5 py-0.5 font-mono text-[0.92em] shadow-[inset_0_0_0_1px_#D9D9D2]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function withBreaks(lines: string[], keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  lines.forEach((ln, i) => {
    if (i > 0) out.push(<br key={`${keyBase}-br${i}`} />);
    out.push(...renderInline(ln, `${keyBase}-l${i}`));
  });
  return out;
}

const isTableRow = (l: string): boolean => /^\s*\|.*\|\s*$/.test(l);
const isSeparator = (l: string): boolean => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const cells = (l: string): string[] =>
  l
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

function renderBlocks(text: string, tone: Tone): ReactNode[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;
  // v3 print: both tones are ink on white / paper.
  void tone;
  const border = 'border-print-rule';
  const headBg = 'bg-print-paper';

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const key = `b${b++}`;

    if (line.trim() === '') {
      i++;
      continue;
    }

    // fenced code
    if (line.trim().startsWith('```')) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) body.push(lines[i++] ?? '');
      i++;
      blocks.push(
        <pre
          key={key}
          className={clsx(
            'overflow-x-auto whitespace-pre rounded-lg border p-3 font-mono text-[13px] leading-6',
            border,
            'bg-print-paper',
          )}
        >
          {body.join('\n')}
        </pre>,
      );
      continue;
    }

    // table
    if (isTableRow(line)) {
      const rows: string[][] = [];
      let hasHeader = false;
      while (i < lines.length && (isTableRow(lines[i] ?? '') || isSeparator(lines[i] ?? ''))) {
        const l = lines[i] ?? '';
        if (isSeparator(l)) hasHeader = rows.length === 1;
        else rows.push(cells(l));
        i++;
      }
      const head = hasHeader ? rows[0] : undefined;
      const body = hasHeader ? rows.slice(1) : rows;
      blocks.push(
        <div key={key} className={clsx('overflow-x-auto rounded-lg border', border)}>
          <table className="w-full border-collapse text-left text-[13px] leading-5 tabular-nums">
            {head && (
              <thead className={headBg}>
                <tr>
                  {head.map((c, ci) => (
                    <th key={ci} className="border-b-2 border-print-ink px-2.5 py-1.5 font-semibold">
                      {renderInline(c, `${key}-h${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className={clsx(ri > 0 && 'border-t', border)}>
                  {r.map((c, ci) => (
                    <td key={ci} className="px-2.5 py-1.5 align-top">
                      {renderInline(c, `${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // lists
    if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\s*([-*•]|\d+[.)])\s+/, ''));
        i++;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={key} className={clsx('space-y-1 pl-5', ordered ? 'list-decimal' : 'list-disc')}>
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it, `${key}-${ii}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    // quote
    if (line.startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('>')) q.push((lines[i++] ?? '').replace(/^>\s?/, ''));
      blocks.push(
        <blockquote
          key={key}
          className="border-l-[3px] border-print-ink pl-3 text-print-muted"
        >
          {withBreaks(q, key)}
        </blockquote>,
      );
      continue;
    }

    // paragraph (until blank line or a different block)
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i] ?? '';
      if (l.trim() === '' || isTableRow(l) || l.trim().startsWith('```') || /^\s*([-*•]|\d+[.)])\s+/.test(l) || l.startsWith('>')) {
        if (para.length > 0) break;
      }
      if (l.trim() === '') break;
      para.push(l);
      i++;
    }
    blocks.push(<p key={key}>{withBreaks(para, key)}</p>);
  }
  return blocks;
}
