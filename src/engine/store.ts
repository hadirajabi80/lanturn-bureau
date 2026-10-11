/**
 * LANTERN BUREAU — game store.
 * progress (per case, persisted) + one session per case (persisted, so a refresh
 * never loses an investigation) + settings. Pure Zustand; no React components here.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CASES, getCase } from '@/data';
import type { CaseFile, Difficulty, Statement, Suspect } from '@/data/types';
import { computeScore, rankFor, type Rank } from './scoring';

export type Phase = 'intro' | 'investigate' | 'accuse' | 'prove' | 'solved';

export interface CaseProgress {
  solved: boolean;
  score: number; // best score
  rank: Rank; // rank of the best score
  hintsUsed: number; // hints used on the best run
  attempts: number; // times solved
}

export interface Session {
  caseId: string;
  foundClues: string[];
  /** Keys are `${suspectId}:${statementId}` (statement ids are only unique per suspect). */
  readStatements: string[];
  brokenStatements: string[];
  solvedPuzzles: string[];
  hintsUsed: number;
  wrongAccusations: number;
  wrongProveIt: number;
  wrongPresses: number;
  /** Suspect ids wrongly accused this session (each can only cost once). */
  accusedWrong: string[];
  /** questionId -> chosen optionId (first answer only). */
  proveItAnswers: Record<string, string>;
  phase: Phase;
  finalScore?: number;
  startedAt: number;
}

export interface Settings {
  muted: boolean;
  reducedFx: boolean;
}

export interface PressResult {
  ok: boolean;
  reply: string;
  /** Clue id newly added to the evidence by this press. */
  revealed?: string;
  /** True if the statement was already broken before this press (no penalty, no reveal). */
  already?: boolean;
}

export interface CompleteResult {
  score: number;
  rank: Rank;
  best: number;
  bestRank: Rank;
  newBest: boolean;
}

export interface GameState {
  progress: Record<string, CaseProgress>;
  sessions: Record<string, Session>;
  activeCaseId: string | null;
  settings: Settings;

  startCase: (caseId: string) => Session | null;
  restartCase: (caseId: string) => Session | null;
  setPhase: (phase: Phase) => void;
  findClue: (clueId: string) => boolean;
  readStatement: (suspectId: string, statementId: string) => string | undefined;
  pressStatement: (suspectId: string, statementId: string, clueId: string) => PressResult;
  solvePuzzle: (puzzleId: string) => string | undefined;
  useHint: () => string | null;
  accuse: (suspectId: string) => boolean;
  answerProveIt: (questionId: string, optionId: string) => boolean;
  completeCase: () => CompleteResult | null;
  resetProgress: () => void;
  isUnlocked: (caseId: string) => boolean;
  tierBadges: () => Record<Difficulty, boolean>;
  setMuted: (muted: boolean) => void;
  setReducedFx: (reducedFx: boolean) => void;
}

// ───────────────────────── pure helpers ─────────────────────────

export const statementKey = (suspectId: string, statementId: string): string => `${suspectId}:${statementId}`;

export function freshSession(c: CaseFile): Session {
  return {
    caseId: c.id,
    foundClues: c.clues.filter((cl) => cl.initial).map((cl) => cl.id),
    readStatements: [],
    brokenStatements: [],
    solvedPuzzles: [],
    hintsUsed: 0,
    wrongAccusations: 0,
    wrongProveIt: 0,
    wrongPresses: 0,
    accusedWrong: [],
    proveItAnswers: {},
    phase: 'intro',
    startedAt: Date.now(),
  };
}

export function currentScore(session: Session | null | undefined): number {
  if (!session) return 1000;
  return computeScore(session);
}

/** Every story case is open from the start; only unknown ids are "locked". `progress` is kept for API stability. */
export function isUnlockedIn(_progress: Record<string, CaseProgress>, caseId: string): boolean {
  return CASES.some((c) => c.id === caseId);
}

export function tierBadgesIn(progress: Record<string, CaseProgress>): Record<Difficulty, boolean> {
  const tiers: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];
  const out = {} as Record<Difficulty, boolean>;
  for (const t of tiers) {
    const list = CASES.filter((c) => c.difficulty === t);
    out[t] = list.length > 0 && list.every((c) => progress[c.id]?.solved);
  }
  return out;
}

export function allPuzzlesSolved(c: CaseFile, s: Session): boolean {
  return c.puzzles.every((p) => s.solvedPuzzles.includes(p.id));
}

export function findStatement(
  c: CaseFile,
  suspectId: string,
  statementId: string,
): { suspect: Suspect; statement: Statement } | null {
  const suspect = c.suspects.find((x) => x.character.id === suspectId);
  const statement = suspect?.statements.find((st) => st.id === statementId);
  return suspect && statement ? { suspect, statement } : null;
}

const GENERIC_WRONG = [
  'And that proves... what, exactly?',
  "I'm not sure what you think that shows.",
  'Fascinating. Irrelevant, but fascinating.',
  "You'll have to do better than that, Detective.",
  'That has nothing to do with what I said.',
];

const genericWrong = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GENERIC_WRONG[h % GENERIC_WRONG.length] ?? 'And that proves... what, exactly?';
};

const addUnique = (list: string[], id: string): string[] => (list.includes(id) ? list : [...list, id]);

// ───────────────────────── store ─────────────────────────

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /** Returns [case, session] for the active case, or null. */
      const active = (): [CaseFile, Session] | null => {
        const { activeCaseId, sessions } = get();
        if (!activeCaseId) return null;
        const c = getCase(activeCaseId);
        const s = sessions[activeCaseId];
        return c && s ? [c, s] : null;
      };
      const patch = (caseId: string, p: Partial<Session>): void => {
        set((st) => {
          const s = st.sessions[caseId];
          if (!s) return {};
          return { sessions: { ...st.sessions, [caseId]: { ...s, ...p } } };
        });
      };

      return {
        progress: {},
        sessions: {},
        activeCaseId: null,
        settings: { muted: false, reducedFx: false },

        startCase: (caseId) => {
          const c = getCase(caseId);
          if (!c) return null;
          const existing = get().sessions[caseId];
          if (existing) {
            if (get().activeCaseId !== caseId) set({ activeCaseId: caseId });
            return existing;
          }
          const s = freshSession(c);
          set((st) => ({ activeCaseId: caseId, sessions: { ...st.sessions, [caseId]: s } }));
          return s;
        },

        restartCase: (caseId) => {
          const c = getCase(caseId);
          if (!c) return null;
          const s = freshSession(c);
          set((st) => ({ activeCaseId: caseId, sessions: { ...st.sessions, [caseId]: s } }));
          return s;
        },

        setPhase: (phase) => {
          const a = active();
          if (a && a[1].phase !== phase) patch(a[0].id, { phase });
        },

        findClue: (clueId) => {
          const a = active();
          if (!a) return false;
          const [c, s] = a;
          if (!c.clues.some((cl) => cl.id === clueId)) return false;
          if (s.foundClues.includes(clueId)) return false;
          patch(c.id, { foundClues: [...s.foundClues, clueId] });
          return true;
        },

        readStatement: (suspectId, statementId) => {
          const a = active();
          if (!a) return undefined;
          const [c, s] = a;
          const hit = findStatement(c, suspectId, statementId);
          if (!hit) return undefined;
          const key = statementKey(suspectId, statementId);
          const readStatements = addUnique(s.readStatements, key);
          let revealed: string | undefined;
          let foundClues = s.foundClues;
          const r = hit.statement.revealClueId;
          if (hit.statement.revealOnRead && r && c.clues.some((cl) => cl.id === r) && !foundClues.includes(r)) {
            foundClues = [...foundClues, r];
            revealed = r;
          }
          if (readStatements !== s.readStatements || foundClues !== s.foundClues) {
            patch(c.id, { readStatements, foundClues });
          }
          return revealed;
        },

        pressStatement: (suspectId, statementId, clueId) => {
          const a = active();
          if (!a) return { ok: false, reply: '...' };
          const [c, s] = a;
          const hit = findStatement(c, suspectId, statementId);
          if (!hit) return { ok: false, reply: '...' };
          const { statement } = hit;
          const key = statementKey(suspectId, statementId);

          if (statement.contradictedBy && statement.contradictedBy === clueId) {
            const reply = statement.pressReply ?? '...You may have a point.';
            if (s.brokenStatements.includes(key)) return { ok: true, reply, already: true };
            let foundClues = s.foundClues;
            let revealed: string | undefined;
            const r = statement.revealClueId;
            if (r && !statement.revealOnRead && c.clues.some((cl) => cl.id === r) && !foundClues.includes(r)) {
              foundClues = [...foundClues, r];
              revealed = r;
            }
            patch(c.id, {
              brokenStatements: [...s.brokenStatements, key],
              readStatements: addUnique(s.readStatements, key),
              foundClues,
            });
            return { ok: true, reply, revealed };
          }

          patch(c.id, { wrongPresses: s.wrongPresses + 1 });
          return { ok: false, reply: statement.wrongPressReply ?? genericWrong(clueId + statementId) };
        },

        solvePuzzle: (puzzleId) => {
          const a = active();
          if (!a) return undefined;
          const [c, s] = a;
          const p = c.puzzles.find((x) => x.id === puzzleId);
          if (!p || s.solvedPuzzles.includes(puzzleId)) return undefined;
          let foundClues = s.foundClues;
          let revealed: string | undefined;
          const r = p.revealClueId;
          if (r && c.clues.some((cl) => cl.id === r) && !foundClues.includes(r)) {
            foundClues = [...foundClues, r];
            revealed = r;
          }
          patch(c.id, { solvedPuzzles: [...s.solvedPuzzles, puzzleId], foundClues });
          return revealed;
        },

        useHint: () => {
          const a = active();
          if (!a) return null;
          const [c, s] = a;
          const hint = c.hints[s.hintsUsed];
          if (hint === undefined) return null;
          patch(c.id, { hintsUsed: s.hintsUsed + 1 });
          return hint;
        },

        accuse: (suspectId) => {
          const a = active();
          if (!a) return false;
          const [c, s] = a;
          if (suspectId === c.culpritId) {
            patch(c.id, { phase: s.phase === 'solved' ? 'solved' : 'prove' });
            return true;
          }
          if (!s.accusedWrong.includes(suspectId)) {
            patch(c.id, {
              accusedWrong: [...s.accusedWrong, suspectId],
              wrongAccusations: s.wrongAccusations + 1,
            });
          }
          return false;
        },

        answerProveIt: (questionId, optionId) => {
          const a = active();
          if (!a) return false;
          const [c, s] = a;
          const q = c.proveIt.find((x) => x.id === questionId);
          if (!q) return false;
          const prior = s.proveItAnswers[questionId];
          if (prior !== undefined) return prior === q.correct;
          const ok = optionId === q.correct;
          patch(c.id, {
            proveItAnswers: { ...s.proveItAnswers, [questionId]: optionId },
            wrongProveIt: ok ? s.wrongProveIt : s.wrongProveIt + 1,
          });
          return ok;
        },

        completeCase: () => {
          const a = active();
          if (!a) return null;
          const [c, s] = a;
          const prev = get().progress[c.id];
          if (s.phase === 'solved' && s.finalScore !== undefined) {
            const score = s.finalScore;
            const best = prev?.score ?? score;
            return { score, rank: rankFor(score), best, bestRank: rankFor(best), newBest: false };
          }
          const score = computeScore(s);
          const newBest = !prev?.solved || score > prev.score;
          const best = newBest || !prev ? score : prev.score;
          const entry: CaseProgress = {
            solved: true,
            score: best,
            rank: rankFor(best),
            hintsUsed: newBest || !prev ? s.hintsUsed : prev.hintsUsed,
            attempts: (prev?.attempts ?? 0) + 1,
          };
          set((st) => ({
            progress: { ...st.progress, [c.id]: entry },
            sessions: { ...st.sessions, [c.id]: { ...s, phase: 'solved', finalScore: score } },
          }));
          return { score, rank: rankFor(score), best, bestRank: entry.rank, newBest };
        },

        resetProgress: () => set({ progress: {}, sessions: {}, activeCaseId: null }),

        isUnlocked: (caseId) => isUnlockedIn(get().progress, caseId),
        tierBadges: () => tierBadgesIn(get().progress),

        setMuted: (muted) => set((st) => ({ settings: { ...st.settings, muted } })),
        setReducedFx: (reducedFx) => set((st) => ({ settings: { ...st.settings, reducedFx } })),
      };
    },
    {
      name: 'lantern-bureau-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (st) => ({
        progress: st.progress,
        sessions: st.sessions,
        activeCaseId: st.activeCaseId,
        settings: st.settings,
      }),
    },
  ),
);

// ───────────────────────── selectors / hooks ─────────────────────────

export const selectActiveSession = (st: GameState): Session | null =>
  st.activeCaseId ? st.sessions[st.activeCaseId] ?? null : null;

export const useSession = (caseId: string | undefined): Session | undefined =>
  useGame((st) => (caseId ? st.sessions[caseId] : undefined));

export const useProgress = (): Record<string, CaseProgress> => useGame((st) => st.progress);
export const useCaseProgress = (caseId: string | undefined): CaseProgress | undefined =>
  useGame((st) => (caseId ? st.progress[caseId] : undefined));
export const useSettings = (): Settings => useGame((st) => st.settings);
export const useIsUnlocked = (caseId: string | undefined): boolean =>
  useGame((st) => (caseId ? isUnlockedIn(st.progress, caseId) : false));

/** Imperative access for event handlers. */
export const game = (): GameState => useGame.getState();
