export default class WebViewBridge {
  constructor(webviewContext) {
    this.webview = webviewContext
  }
  listen = async (data) => {
    console.log('listen -> data', data)
    // not all the JSAPI can be called directly from the target website
    const command = data.detail
    if (command.api) {
      this.webview.postMessage({
        api: command.api,
        result: await this.handleApi(command),
        serialId: command.serialId,
      })
    }
    // the developer can implment more listeners below
    // alert(command);
  }
  handleApi = (data) => {
    // handle JSAPI request in promise way
    return new Promise((resolve) => {
      if (!my[data.api]) {
        my.call(data.api, {
          ...data.options,
          success: resolve,
          fail: resolve,
          complete: resolve,
        })
      } else {
        if (data.isSync) {
          resolve(my[data.api](data.options))
        } else {
          my[data.api]({
            ...data.options,
            success: resolve,
            fail: resolve,
            complete: resolve,
          })
        }
      }
    })
  }
}
