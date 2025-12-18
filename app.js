import envStorageAPI from './common/envStorageAPI';
// import { getEnv } from './api/envConfig';
// import useI18n from './i18n';
import EN_US from './i18n/EN_US';

App({
  globalData: {
    appId: '',
    lang: EN_US,
    Authorization: envStorageAPI.getStorageSync('Authorization'),
    refresh_token: envStorageAPI.getStorageSync('refresh_token'),
    userInfo: envStorageAPI.getStorageSync('userInfo') || {},
  },
  async onLaunch() {
    const appIdRes = my.getAppIdSync();
    this.globalData.appId = appIdRes.appId;
    const env = getEnv();
    console.log('globalData', env, this.globalData);
    if (env !== 'prod') {
      my.setNavigationBar({
        title: env
      });
    }
    // https://alipayconnect-miniprogram.alipay.com/docs-alipayconnect/miniprogram_alipayconnect/mpdev/api_device_system_getsysteminfo
    // const systemInfo = await my.getSystemInfo();
    // console.log(systemInfo.language)
    // this.globalData.lang = useI18n('EN_US');
  },
});
