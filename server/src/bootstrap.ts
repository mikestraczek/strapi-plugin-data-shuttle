import type { Core } from '@strapi/strapi';
import pluginId from './utils/pluginId';

const actions = [
  {
    section: 'plugins',
    displayName: 'Export',
    uid: 'export',
    pluginName: pluginId,
  },
];

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.admin.services.permission.actionProvider.registerMany(actions);
};

export default bootstrap;
