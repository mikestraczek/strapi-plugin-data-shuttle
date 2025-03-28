import { Initializer } from './components/Initializer';
import { Alerts } from './components/Injected/Alerts/Alerts';
import { InjectedExportCollectionType } from './components/InjectedExportCollectionType/InjectedExportCollectionType';
import pluginId from './utils/pluginId';

export default {
  register(app: any) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: pluginId,
    });
  },

  bootstrap(app: any) {
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: `${pluginId}-alerts`,
      Component: Alerts,
    });

    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: `${pluginId}-export`,
      Component: InjectedExportCollectionType,
    });

    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: `${pluginId}-alerts`,
      Component: Alerts,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
