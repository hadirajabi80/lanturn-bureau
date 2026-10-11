/**
 * Dev-time integrity checker for case data (PLAN §5).
 * Pure; imports types only so it runs under Vite and under `tsx` alike.
 */
import type { CaseFile } from '../data/types';

/** Bureau ids may appear in several cases (e.g. Lucien in 19, the whole cast in 20). */
export const SHARED_IDS = new Set(['otto', 'quill', 'nia', 'hestia', 'lucien', 'you', 'pip']);

const dupes = (ids: string[]): string[] => {
  const seen = new Set<string>();
  const out = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) out.add(id);
    seen.add(id);
  }
  return [...out];
};

export function validateCase(c: CaseFile): string[] {
  const problems: string[] = [];
  const p = (msg: string): void => {
    problems.push(msg);
  };

  // ── basic shape ──
  if (!c.id) p('case has no id');
  if (!c.title) p('case has no title');
  if (!Array.isArray(c.clues) || !Array.isArray(c.suspects) || !Array.isArray(c.scenes)) {
    p('case is missing clues/suspects/scenes arrays');
    return problems;
  }
  if (c.suspects.length === 0) p('case has no suspects');
  if (c.scenes.length === 0) p('case has no scenes');
  if (!c.hints || c.hints.length === 0) p('case has no hints');
  if (!c.proveIt || c.proveIt.length === 0) p('case has no prove-it questions');
  if (!c.solution || c.solution.length === 0) p('case has no solution paragraphs');

  // ── ids unique within the case ──
  const clueIds = new Set(c.clues.map((cl) => cl.id));
  for (const d of dupes(c.clues.map((cl) => cl.id))) p(`duplicate clue id "${d}"`);
  for (const d of dupes(c.scenes.map((s) => s.id))) p(`duplicate scene id "${d}"`);
  for (const d of dupes(c.suspects.map((s) => s.character.id))) p(`duplicate suspect id "${d}"`);
  for (const d of dupes(c.puzzles.map((pz) => pz.id))) p(`duplicate puzzle id "${d}"`);
  for (const d of dupes(c.proveIt.map((q) => q.id))) p(`duplicate prove-it id "${d}"`);
  for (const s of c.scenes) {
    for (const d of dupes(s.hotspots.map((h) => h.id))) p(`scene "${s.id}": duplicate hotspot id "${d}"`);
  }
  for (const s of c.suspects) {
    for (const d of dupes(s.statements.map((st) => st.id))) {
      p(`suspect "${s.character.id}": duplicate statement id "${d}"`);
    }
  }

  const clueRef = (where: string, id: string | undefined): void => {
    if (id !== undefined && !clueIds.has(id)) p(`${where} references unknown clue "${id}"`);
  };

  // ── references ──
  for (const s of c.scenes) {
    for (const h of s.hotspots) {
      clueRef(`hotspot "${s.id}/${h.id}"`, h.clueId);
      if (!h.clueId && !h.flavor) p(`hotspot "${s.id}/${h.id}" has neither clueId nor flavor`);
      if (h.x < 0 || h.x > 100 || h.y < 0 || h.y > 100) p(`hotspot "${s.id}/${h.id}" is outside 0–100`);
    }
  }
  for (const s of c.suspects) {
    for (const st of s.statements) {
      const where = `statement "${s.character.id}/${st.id}"`;
      clueRef(`${where} contradictedBy`, st.contradictedBy);
      clueRef(`${where} revealClueId`, st.revealClueId);
      if (st.revealOnRead && !st.revealClueId) p(`${where} has revealOnRead but no revealClueId`);
      if (st.contradictedBy && st.contradictedBy === st.revealClueId) {
        p(`${where} is circular: it is contradicted by the very clue it reveals ("${st.contradictedBy}")`);
      }
      if (st.revealClueId && !st.revealOnRead && !st.contradictedBy) {
        p(`${where} reveals "${st.revealClueId}" on contradiction but has no contradictedBy`);
      }
    }
  }
  for (const pz of c.puzzles) clueRef(`puzzle "${pz.id}" revealClueId`, pz.revealClueId);

  // ── culprit / prove-it ──
  if (!c.suspects.some((s) => s.character.id === c.culpritId)) {
    p(`culpritId "${c.culpritId}" is not one of the suspects`);
  }
  for (const q of c.proveIt) {
    if (!q.options.some((o) => o.id === q.correct)) p(`prove-it "${q.id}": correct "${q.correct}" is not an option id`);
    for (const d of dupes(q.options.map((o) => o.id))) p(`prove-it "${q.id}": duplicate option id "${d}"`);
    if (q.options.length < 2) p(`prove-it "${q.id}" needs at least 2 options`);
  }

  // ── puzzles ──
  for (const pz of c.puzzles) {
    const where = `puzzle "${pz.id}"`;
    if (pz.type === 'code') {
      const norm = pz.answers.map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
      if (norm.length === 0) p(`${where}: code puzzle has no usable answers`);
    } else if (pz.type === 'order') {
      const itemIds = pz.items.map((i) => i.id);
      for (const d of dupes(itemIds)) p(`${where}: duplicate item id "${d}"`);
      for (const d of dupes(pz.correctOrder)) p(`${where}: correctOrder repeats "${d}"`);
      const items = new Set(itemIds);
      const order = new Set(pz.correctOrder);
      for (const id of pz.correctOrder) if (!items.has(id)) p(`${where}: correctOrder has unknown item "${id}"`);
      for (const id of itemIds) if (!order.has(id)) p(`${where}: item "${id}" missing from correctOrder`);
      if (pz.items.length < 2) p(`${where}: order puzzle needs at least 2 items`);
    } else if (pz.type === 'grid') {
      const rows = new Set(pz.rows);
      const cols = new Set(pz.cols);
      const keys = Object.keys(pz.solution);
      for (const r of pz.rows) if (!(r in pz.solution)) p(`${where}: row "${r}" has no solution entry`);
      for (const k of keys) if (!rows.has(k)) p(`${where}: solution key "${k}" is not a row`);
      for (const [k, v] of Object.entries(pz.solution)) {
        if (!cols.has(v)) p(`${where}: solution "${k}" → "${v}" is not a column`);
      }
      for (const d of dupes(pz.rows)) p(`${where}: duplicate row "${d}"`);
      for (const d of dupes(pz.cols)) p(`${where}: duplicate column "${d}"`);
    }
  }

  // ── reachability (fixpoint) ──
  const reachable = new Set<string>();
  for (const cl of c.clues) if (cl.initial) reachable.add(cl.id);
  for (const s of c.scenes) for (const h of s.hotspots) if (h.clueId) reachable.add(h.clueId);
  for (const pz of c.puzzles) if (pz.revealClueId) reachable.add(pz.revealClueId);
  for (const s of c.suspects) {
    for (const st of s.statements) if (st.revealOnRead && st.revealClueId) reachable.add(st.revealClueId);
  }
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of c.suspects) {
      for (const st of s.statements) {
        if (st.revealOnRead || !st.revealClueId || !st.contradictedBy) continue;
        if (reachable.has(st.contradictedBy) && !reachable.has(st.revealClueId)) {
          reachable.add(st.revealClueId);
          grew = true;
        }
      }
    }
  }
  for (const cl of c.clues) if (!reachable.has(cl.id)) p(`clue "${cl.id}" is unreachable`);
  for (const s of c.suspects) {
    for (const st of s.statements) {
      if (st.contradictedBy && clueIds.has(st.contradictedBy) && !reachable.has(st.contradictedBy)) {
        p(`statement "${s.character.id}/${st.id}" can never be broken: "${st.contradictedBy}" is unreachable`);
      }
    }
  }

  return problems;
}

export interface CaseReport {
  caseId: string;
  problems: string[];
}

export function validateAll(cases: CaseFile[]): CaseReport[] {
  const reports: CaseReport[] = cases.map((c) => ({ caseId: c?.id ?? '(missing)', problems: c ? validateCase(c) : ['case is undefined'] }));

  // Character ids must be globally unique (bureau ids excepted).
  const owner = new Map<string, string>();
  cases.forEach((c, i) => {
    if (!c) return;
    for (const s of c.suspects) {
      const id = s.character.id;
      if (SHARED_IDS.has(id)) continue;
      const prev = owner.get(id);
      if (prev && prev !== c.id) reports[i]?.problems.push(`character id "${id}" is also used in ${prev}`);
      else owner.set(id, c.id);
    }
  });

  for (const d of dupes(cases.filter(Boolean).map((c) => c.id))) {
    reports.find((r) => r.caseId === d)?.problems.push(`case id "${d}" is used more than once`);
  }
  return reports;
}
