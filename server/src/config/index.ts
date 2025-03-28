export default {
  default: {
    serverPublicHostname: '',
  },
  validator: ({ serverPublicHostname }: { serverPublicHostname: string }) => {
    if (typeof serverPublicHostname !== 'string') {
      throw new Error('serverPublicHostname has to be a string.');
    }
  },
};
