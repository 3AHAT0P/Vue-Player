type availableTypes = 'b' | 'Kb' | 'Mb' | 'Gb' | 'Tb' | 'Pb';

const TYPES = ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];

export default (
  value: number,
  typeIn: availableTypes = 'b',
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
