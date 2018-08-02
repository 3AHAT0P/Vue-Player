export default () => {
  let result: string = '';
  for (let i = 0; i < 32; ++i) {
    if (i === 8 || i === 12 || i === 16 || i === 20) result += '-';
    const random = Math.random() * 16 | 0;
    result += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return result;
};
