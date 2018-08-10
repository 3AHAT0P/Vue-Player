type availableTypes = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

const TYPES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export default (
  value: number,
  typeIn: availableTypes = 'B',
  typeOut: availableTypes | 'auto' = 'auto',
) => {
  let result = value;
  let typeIndex = TYPES.indexOf(typeIn);
  if (typeOut === 'auto') {
    while (result > 1023) {
      ++typeIndex;
      result = result / 1024;
    }
  } else {
    const typeOutIndex = TYPES.indexOf(typeIn);
    while (typeIndex < typeOutIndex) {
      ++typeIndex;
      result = result / 1024;
    }
  }
  return `${result.toFixed(2)} ${TYPES[typeIndex]}`;
};
