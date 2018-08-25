import { throttle } from 'lodash';

export default (time: number = 500) => {
  return (target: any, key: string|symbol, descriptor: PropertyDescriptor) => {
    return {
      ...descriptor,
      value: throttle(descriptor.value, time),
    };
  };
};
