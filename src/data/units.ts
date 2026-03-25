import { units } from './mockGameData';

export { units };
export const unitMap = Object.fromEntries(units.map((item) => [item.id, item]));
