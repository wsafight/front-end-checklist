#!/usr/bin/env node
/* eslint-disable */
// Build showcase.json from showcase/cases/*/{bad.tsx, review.md}.
// Runs at build time (locally or CI). Keep stdlib only — no deps.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CASES_DIR = path.join(ROOT, 'showcase', 'cases');
const OUT = path.join(ROOT, 'showcase', 'showcase.json');

function die(msg) {
  console.error('build-showcase: ' + msg);
  process.exit(1);
}

function parseFrontmatter(src) {
  if (!src.startsWith('---')) return { data: {}, body: src };
  const end = src.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: src };
  const raw = src.slice(3, end).trim();
  const body = src.slice(end + 4).replace(/^\r?\n/, '');
  const data = {};
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!m) return;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  });
  return { data, body };
}

function readCase(caseId) {
  const dir = path.join(CASES_DIR, caseId);
  const badPath = path.join(dir, 'bad.tsx');
  const reviewPath = path.join(dir, 'review.md');
  if (!fs.existsSync(badPath)) die('missing ' + badPath);
  if (!fs.existsSync(reviewPath)) die('missing ' + reviewPath);
  const code = fs.readFileSync(badPath, 'utf8');
  const raw = fs.readFileSync(reviewPath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  return {
    id: data.id || caseId,
    title_zh: data.title_zh || caseId,
    title_en: data.title_en || caseId,
    stack: data.stack || '',
    groups: Array.isArray(data.groups) ? data.groups : [],
    severity: data.severity || 'medium',
    code,
    codeLang: 'tsx',
    review: body.trim(),
  };
}

function main() {
  if (!fs.existsSync(CASES_DIR)) die('missing ' + CASES_DIR);
  const ids = fs
    .readdirSync(CASES_DIR)
    .filter((n) => fs.statSync(path.join(CASES_DIR, n)).isDirectory())
    .sort();
  if (!ids.length) die('no cases found');
  const cases = ids.map(readCase);
  const payload = { cases };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
  console.log(
    'build-showcase: wrote ' + cases.length + ' cases -> ' + path.relative(ROOT, OUT),
  );
}

main();
