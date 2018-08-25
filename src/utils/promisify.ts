export default (fn: (payload: any) => void, data: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn({
      ...data,
      defer: {
        resolve, reject,
      },
    });
  });
};
