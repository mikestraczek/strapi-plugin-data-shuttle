import pluginId from './utils/pluginId';

type Permission = {
  action: string;
  subject: null;
};

type PluginPermissions = {
  exportButton: Permission[];
  main: Permission[];
};

export const pluginPermissions: PluginPermissions = {
  exportButton: [{ action: `plugin::${pluginId}.export`, subject: null }],
  main: [{ action: `plugin::${pluginId}.export`, subject: null }],
};
