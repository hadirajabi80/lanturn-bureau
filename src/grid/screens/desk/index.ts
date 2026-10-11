/**
 * Case desk (brief §5): the reusable CasePlayer and the desk routes.
 *   /plans/d/:district/:tier/:n → CaseDesk · /plans/daily → DailyDesk · /plans/weekly → WeeklyDesk
 *   /plans/code/:code → CodeDesk
 */
export { CasePlayer, type CasePlayerProps } from './CasePlayer';
export { CaseDesk } from './CaseDesk';
export { DailyDesk } from './DailyDesk';
export { WeeklyDesk } from './WeeklyDesk';
export { CodeDesk } from './CodeDesk';
export { ScenarioExplainer, MiniPlan } from './ScenarioExplainer';
export { VARIANT_META, formatTime, isoWeek, todayISO } from './util';
export { CaseDesk as default } from './CaseDesk';
