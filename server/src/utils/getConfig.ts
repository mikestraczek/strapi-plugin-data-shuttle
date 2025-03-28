import pluginId from './pluginId.js';

/**
 * Get a config parameter.
 * @param {string} param
 */
const getConfig = (param: string) => {
  return strapi.config.get(`plugin::${pluginId}.${param}`);
};

export { getConfig };
