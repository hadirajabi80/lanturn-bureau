import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useReduced } from './useReduced';

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Route-level fade + slide-up enter / fade-out exit. The exit only plays if the parent keys
 * the routes inside `AnimatePresence mode="wait"`. Usage in App.tsx:
 *
 * ```tsx
 * const location = useLocation();
 * <AnimatePresence mode="wait">
 *   <Routes location={location} key={location.pathname}>
 *     <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
 *     <Route path="/cases" element={<PageTransition><CaseSelect /></PageTransition>} />
 *   </Routes>
 * </AnimatePresence>
 * ```
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();
  const reduced = useReduced();
  return (
    <motion.div
      key={location.pathname}
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: reduced ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: reduced ? 0.1 : 0.25, ease: 'easeIn' } }}
    >
      {children}
    </motion.div>
  );
}
