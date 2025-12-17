import WebViewBridge from './bridge';
Page({
  data: {
    targetUrl: '',
  },
  onLoad() {
    this.setData({
      targetUrl: '',
    });
    const webContext = my.createWebViewContext('custom-web-view')
    this.webBridge = new WebViewBridge(webContext)
  },
  onMessage(e) {
    this.webBridge.listen(e)
  },
});