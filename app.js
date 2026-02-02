import EN_US from './i18n/EN_US';
import { createApp } from '@miniu/data'

App(createApp({
  defaultGlobalData: {
    lang: EN_US,
    userInfo: {},
    code: ''
  },
  async onLaunch() {
    const appIdRes = my.getAppIdSync();
    this.globalData.appId = appIdRes.appId;
  },
}));
