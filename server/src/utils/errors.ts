import _ from 'lodash';

const errorCodes = {};

const errorMessages = {};

Object.keys(errorMessages).forEach(
  (k) =>
    (errorMessages[k] = _.template(errorMessages[k], {
      interpolate: /\{\s*(\S+)\s*\}/g,
    }))
);

class BusinessError extends Error {
  code: string;

  constructor(errorCodeOrMessage: string, interpolations?: Record<string, string>) {
    const isErrorCode = !!errorCodes[errorCodeOrMessage];

    super(isErrorCode ? errorMessages[errorCodeOrMessage](interpolations) : errorCodeOrMessage);

    this.name = this.constructor.name;
    this.code = isErrorCode ? errorCodeOrMessage : 'UNDEFINED';
  }
}

export { BusinessError, errorCodes };
