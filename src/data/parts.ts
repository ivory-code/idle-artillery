import { partSlots, parts } from './mockGameData';

export { partSlots, parts };
export const partMap = Object.fromEntries(parts.map((item) => [item.id, item]));
