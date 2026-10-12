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
        <Panel className="mx-auto mt-8 max-w-md p-6">
          <p className="text-[13px] font-semibold text-(--fp-muted)">Not ready yet</p>
          <h2 className="mt-0.5 border-b-2 border-(--fp-ink) pb-3 font-display text-2xl font-black leading-tight">This desk is still being set up</h2>
          <p className="mt-3 text-[15px] text-(--fp-muted)">The Bureau’s carpenters are working on “{title}”. Try again shortly.</p>
          <BrassButton to="/plans" className="mt-5">
            Back to the Bureau
          </BrassButton>
        </Panel>
      </PageShell>
    </SkinProvider>
  );
}
