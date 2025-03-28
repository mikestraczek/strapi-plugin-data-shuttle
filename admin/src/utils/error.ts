export const handleRequestErr = (err: any, handlers: any) => {
  const defaultHandler = handlers.default || (() => {});

  const { name: errorName, status: errorStatus } = err?.response?.payload?.error || {};
  const handler = handlers[errorName] || handlers[errorStatus] || defaultHandler;

  handler(err);
};
