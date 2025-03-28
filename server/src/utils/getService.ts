import pluginId from './pluginId.js';

/**
 * Get a plugin service.
 * @param {string} serviceName
 * @returns
 */
const getService = (serviceName: string) => {
  return strapi.plugin(pluginId).service(serviceName);
};

export { getService };
