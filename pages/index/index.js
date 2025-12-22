import { createPage } from '@miniu/data'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
  },
  onLoad(query) {
    console.info('this.data', this.data.lang);
  },

  onPullDownRefresh() {
    // The page was scrolled down.
    setTimeout(() => {
      this.setData({
        apiResponse: "",
        apiError: "",
        userInfo: "",
        imageSrc: "",
      });
      my.stopPullDownRefresh();
    }, 2000);
  },
}));
