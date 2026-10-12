/** v2 tools. Legacy 'place' -> 'pin', 'notes' -> 'pencil'. */
export type BoardTool = 'pin' | 'pencil' | 'cross' | 'empty' | 'erase';
export type LegacyBoardTool = 'place' | 'notes';

export const normalizeTool = (t: BoardTool | LegacyBoardTool): BoardTool => (t === 'place' ? 'pin' : t === 'notes' ? 'pencil' : t);
