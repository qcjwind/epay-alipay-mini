import EN_US from './i18n/EN_US';
import { createApp } from '@miniu/data'

App(createApp({
  defaultGlobalData: {
    lang: EN_US
  },
  async onLaunch() {
    const appIdRes = my.getAppIdSync();
    this.globalData.appId = appIdRes.appId;
    const env = getEnv();
    if (env !== 'prod') {
      my.setNavigationBar({
        title: env
      });
    }
  },
}));
