import type { CaseFile } from '@/data/types';
import { sfx } from '@/engine/audio';
import { toast } from '@/components/ui/Toast';

/** Toast + chime for a newly obtained clue. */
export function announceClue(c: CaseFile, clueId: string | undefined): void {
  if (!clueId) return;
  const clue = c.clues.find((cl) => cl.id === clueId);
  if (!clue) return;
  sfx.reveal();
  toast(clue.name, 'evidence', { title: '+ Evidence' });
}
