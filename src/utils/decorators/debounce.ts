import { debounce } from 'lodash';

export default (time: number = 500) => {
  return (target: any, key: string|symbol, descriptor: PropertyDescriptor) => {
    return {
      ...descriptor,
      value: debounce(descriptor.value, time),
    };
  };
};
