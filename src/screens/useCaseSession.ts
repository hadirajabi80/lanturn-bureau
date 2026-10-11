import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCase } from '@/data';
import type { CaseFile } from '@/data/types';
import { game, useSession, type Session } from '@/engine/store';

/** Resolves the route's case and makes sure its session exists and is active. */
export function useCaseSession(): { caseFile: CaseFile | undefined; session: Session | undefined } {
  const { id } = useParams<{ id: string }>();
  const caseFile = id ? getCase(id) : undefined;
  const session = useSession(caseFile?.id);
  const activeId = caseFile?.id;
  useEffect(() => {
    if (activeId) game().startCase(activeId);
  }, [activeId]);
  return { caseFile, session };
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
