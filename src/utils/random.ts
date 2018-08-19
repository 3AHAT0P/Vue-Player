/** Возвращает случайное число между min (включительно) и max (не включая max) */
export const getRandomArbitrary = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Возвращает случайное целое число между min (включительно) и max (не включая max)
 * Использование метода Math.round() даст вам неравномерное распределение!
 * @returns {number} Random integer number
 */
export const getRandomArbitraryInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};
