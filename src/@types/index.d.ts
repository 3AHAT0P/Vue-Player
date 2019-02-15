declare global {
  type fn = (...args: any[]) => any;

  type MutationMethod = (payload: any) => void;
}

export { };
