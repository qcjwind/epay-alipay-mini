const app = getApp();
Page({
  data: {
    apiResponse: '',
    apiError: '',
    userInfo: '',
    imageSrc: '',
    drawerOpen: true,
  },
  onLoad(query) {
    // Page loading
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // Page loaded
  },
  onShow() {
    // Page show
  },
  onHide() {
    // Page hidden
  },
  onUnload() {
    // Page closed
  },
  onTitleClick() {
    // The title was clicked
  },
  onPullDownRefresh() {
    // The page was scrolled down.
    setTimeout(() => {
      this.setData({
        apiResponse: '',
        apiError: '',
        userInfo: '',
        imageSrc: '',
      });
      my.stopPullDownRefresh();
    }, 2000);
  },
  onReachBottom() {
    // The page was scrolled to the bottom.
  },
  onShareAppMessage() {
    // Return to custom sharing information
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
  callChooseImage() {
    my.chooseImage({
      sourceType: ['camera', 'album'],
      count: 1,
      success: (response) => {
        this.setData({
          apiResponse: JSON.stringify(response, null, 2),
          imageSrc: response.apFilePaths[0],
        });
      },
      fail: (err) => {
        this.failCallback(err);
      }
    });
  },
  callPreviewImage() {
    my.previewImage({
      current: 0,
      urls: [this.data.imageSrc],
    });
  },
  callGetAuthCode() {
    my.showLoading();
    my.getAuthCode({
      scopes: ['auth_user'],
      success: (response) => {
        this.setData({
          apiResponse: JSON.stringify(response, null, 2),
        });
        if (response.authCode) {
          this.getToken(response.authCode);
        } else {
          this.failCallback('AuthCode is empty');
        }
      },
      fail: (err) => {
        this.failCallback(err);
      },
    });
  },
  getToken(authCode) {
    my.request({
      url: '',
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
      data: {
        authCode,
      },
      success: (response) => {
        if (response.data.code === 0 && response.data.content) {
          this.getUserInfo()
        } else {
          this.failCallback(response.data.message);
        }
      },
      fail: (err) => {
        this.failCallback(err);
      },
    });
  },
  getUserInfo() {
    my.request({
      url: 'h',
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
      data: {},
      success: (response) => {
        if (response.data.code === 0) {
          const userInfo = response.data.content.userInfo;
          if (userInfo) {
            this.setData({
              userInfo: JSON.stringify(userInfo, null, 2),
            });
            my.hideLoading();
            return;
          }
        }
        this.failCallback(response.data.message);
      },
      fail: (err) => {
        this.failCallback(err);
      },
    })
  },
  callTradePay() {
    my.showLoading();
    // Demo api
    my.request({
      url: '',
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
      data: {},
      success: (res) => {
        console.log('payment res', res);
        if (res.data.code === 0) {
          this.tradePay(res.data.content.redirectActionForm.redirectUrl);
        } else {
          this.failCallback(res.data.message);
        }
      },
      fail: (err) => {
        this.failCallback(err);
      },
    })
  },
  tradePay(paymentUrl) {
    // my.tradePay document: 
    // https://alipayconnect-miniprogram.alipay.com/docs-alipayconnect/miniprogram_alipayconnect/mpdev/api_openapi_tradepay
    my.tradePay({
      paymentUrl,
      success: ({
        resultCode
      }) => {
        // Result Code List: 
        // https://alipayconnect-miniprogram.alipay.com/docs-alipayconnect/miniprogram_alipayconnect/mpdev/api_openapi_tradepay#741f0fdb
        if (resultCode === '9000') {
          my.showToast({
            content: 'Payment successful',
          });
        } else {
          my.showToast({
            content: 'Unknown, need to wait for payment results.'
          })
        }
        this.setData({
          apiResponse: resultCode,
        }, () => {
          my.hideLoading();
        });
      },
      fail: (err) => {
        my.showToast({
          content: 'Sorry, initiate payment failed. Please try again later',
        });
        this.failCallback(err);
      }
    });
  },
  failCallback(err) {
    this.setData({
      apiError: JSON.stringify(err),
    }, () => {
      my.hideLoading();
    });
    console.error(err);
  },
  closeDrawer() {
    this.setData({
      drawerOpen: false,
    });
  },
});
