import { BusinessError } from './errors';

/**
 * Check an object's properties based on a validation schema
 * @param {*} schema - Validation schema
 * @param {*} obj - Object to check properties
 * @param {Object} options
 * @param {boolean} [options.allowUnknown] - Whether to allow unknown properties (default: false)
 * @returns Object with values checked and parsed
 */
export const checkParams = (schema, obj, options: { allowUnknown?: boolean } = {}) => {
  const allowUnknown = options.allowUnknown || false;

  const validation = schema.validate(obj, {
    abortEarly: false,
    allowUnknown,
  });

  if (validation.error) {
    const error = validation.error.details.map((detail) => detail.message).join(', ');

    throw new BusinessError(error, {});
  }

  return validation.value;
};

export const handleAsyncError = (fn) => async (ctx) => {
  try {
    return await fn(ctx);
  } catch (err) {
    strapi.log.error(err);

    if (err instanceof BusinessError) {
      ctx.status = 400;
      ctx.body = {
        message: err.message,
        code: err.code,
      };
    } else {
      throw err;
    }
  }
};
