import { Construction } from 'lucide-react';
import { PageShell } from './PageShell';
import { Panel } from './primitives';
import { BrassButton } from './primitives';
import { SkinProvider } from './skin';

/**
 * Placeholder shown by App.tsx when a routed screen's module (desk / modes / meta) has not
 * landed yet. Remove once every module exists.
 */
export function PendingScreen({ title }: { title: string }) {
  return (
    <SkinProvider>
      <PageShell title={title} kicker="Floorplan Mysteries" back="/plans">
        <Panel className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 p-8 text-center">
          <Construction className="size-8 text-(--fp-hi)" aria-hidden />
          <h2 className="font-display text-xl font-bold">This desk is still being set up</h2>
          <p className="text-sm text-(--fp-muted)">The Bureau’s carpenters are working on “{title}”. Try again shortly.</p>
          <BrassButton to="/plans" className="mt-2">
            Back to the Bureau
          </BrassButton>
        </Panel>
      </PageShell>
    </SkinProvider>
  );
}
