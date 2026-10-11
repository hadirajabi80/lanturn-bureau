import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * True when the OS asks for reduced motion OR `<html data-reduced-fx="true">` is set (the player's
 * "Reduce effects" setting, mirrored onto the root element by whoever owns settings).
 * Self-contained: does not depend on any game store.
 */
export function useFpReduced(): boolean {
  const os = useReducedMotion() === true;
  const [attr, setAttr] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.dataset.reducedFx === 'true' : false,
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setAttr(el.dataset.reducedFx === 'true'));
    obs.observe(el, { attributes: true, attributeFilter: ['data-reduced-fx'] });
    return () => obs.disconnect();
  }, []);
  return os || attr;
}
