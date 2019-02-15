declare global {
  abstract class Hash<T = any> {
    [key: string]: T;
  }
}

export { };
