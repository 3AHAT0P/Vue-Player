declare global {
  interface IDefer {
    resolve: (data?: any) => any;
    reject: (error: any) => any;
  }
}

export { };
