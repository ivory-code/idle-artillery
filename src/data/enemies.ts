import { enemies } from './mockGameData';

export { enemies };
export const enemyMap = Object.fromEntries(enemies.map((item) => [item.id, item]));
