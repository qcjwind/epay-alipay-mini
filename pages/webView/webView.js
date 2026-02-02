import WebViewBridge from './bridge';
Page({
  data: {
    targetUrl: '',
  },
  onLoad() {
    // 设置导航栏返回箭头为白色
    my.setNavigationBar({
      backgroundColor: '#000000',
      frontColor: '#ffffff'
    });
    
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