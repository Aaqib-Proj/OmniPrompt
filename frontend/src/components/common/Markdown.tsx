import React from 'react';

// Small, dependency-free Markdown renderer for prompt READMEs. Handles headings,
// paragraphs, lists, fenced code, blockquotes, rules, and inline code/bold/italic/links.
// Output is built from React elements, never raw HTML.

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const start = match.index ?? 0;
    const key = `${keyPrefix}-${index++}`;

    if (start > last) nodes.push(text.slice(last, start));

    if (match[1]) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (match[2]) {
      nodes.push(<strong key={key}>{renderInline(token.slice(2, -2), key)}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (match[4]) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/) ?? [];
      const safeHref = /^(https?:|mailto:|\/)/.test(href ?? '') ? href : '#';
      const external = safeHref.startsWith('http');
      nodes.push(
        <a key={key} href={safeHref} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
          {label}
        </a>
      );
    }

    last = start + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

const BULLET = /^\s*[-*+]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const HEADING = /^(#{1,4})\s+(.*)$/;
const RULE = /^(-{3,}|\*{3,})\s*$/;

const startsBlock = (line: string) =>
  line.startsWith('```') || HEADING.test(line) || RULE.test(line) || BULLET.test(line) || NUMBERED.test(line) || line.startsWith('>');

export const Markdown: React.FC<{ source: string }> = ({ source }) => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${blocks.length}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key}>
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const Tag = `h${heading[1].length}` as 'h1' | 'h2' | 'h3' | 'h4';
      blocks.push(<Tag key={key}>{renderInline(heading[2], key)}</Tag>);
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push(<hr key={key} />);
      i++;
      continue;
    }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = NUMBERED.test(line);
      const marker = ordered ? NUMBERED : BULLET;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) items.push(lines[i++].replace(marker, ''));
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List key={key}>
          {items.map((item, n) => (
            <li key={n}>{renderInline(item, `${key}-${n}`)}</li>
          ))}
        </List>
      );
      continue;
    }

    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key}>{renderInline(quote.join(' '), key)}</blockquote>);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={key}>{renderInline(paragraph.join(' '), key)}</p>);
  }

  return <div className="markdown">{blocks}</div>;
};
