export default (mutation: MutationMethod, data: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    mutation({
      ...data,
      defer: {
        resolve, reject,
      },
    });
  });
};
