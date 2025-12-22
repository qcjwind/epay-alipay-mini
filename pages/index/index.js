import {
  createPage
} from '@miniu/data'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data() {
    return {
      firstName: '',
      user: null,
      selectedOneIndex: 0,
      selectedOneOption: '',
      operator: [],
      payMethod: 'oneTime'
    }
  },
  onLoad(query) {
    this.initData()
  },

  initData() {
    const arr = [{
        key: 'oneTime',
        icon: '/assets/icons/repeate-one.png',
        label: this.data.lang.home.oneTime
      },
      {
        key: 'recurring',
        icon: '/assets/icons/calendar-01.png',
        label: this.data.lang.home.recurring
      }
    ]
    this.setData({
      operator: arr
    })
  },

  switchOperator(e) {
    const {
      currentTarget: {
        dataset: {
          key
        }
      }
    } = e || {}
    this.setData({
      payMethod: key
    })
  },

  selectContact() {
    my.choosePhoneContact({
      success: (res) => {
        this.setData({
          user: {
            ...res
          },
          firstName: res.name && res.name.substring(0, 1)
        })
      }
    })
  },

  getMyNumber() {
    my.getAuthCode({
      scopes: ['PLAINTEXT_MOBILE_PHONE'],
      success: (res) => {
        const authCode = res.authCode;
        this.clearUser()
      }
    })
  },

  enterNumber() {
    this.clearUser()
  },

  inpNumber(e) {
    const {
      detail: {
        value
      }
    } = e || {}
    this.setData({
      phone: value
    })
  },

  clearUser() {
    this.setData({
      user: null,
      phone: '',
      firstName: ''
    })
  },

  chooseOperator() {
    my.optionsSelect({
      selectedOneIndex: 0,
      optionsOne: ['Vodafone'],
      positiveString: this.data.lang.home.operatorConfirm,
      negativeString: this.data.lang.home.operatorCancel,
      success: res => {
        this.setData({
          selectedOneIndex: res.selectedOneIndex,
          selectedOneOption: res.selectedOneOption
        })
      }
    });
  },

  submit() {
    if (this.data.user && !this.data.user.mobile) {
      my.alert({
        title: this.data.lang.home.alert.title,
        content: this.data.lang.home.alert.msg,
        buttonText: this.data.lang.home.alert.btn
      })
      return
    }

    if (!this.data.phone) {
      my.alert({
        title: this.data.lang.home.alert.title,
        content: this.data.lang.home.alert.msg,
        buttonText: this.data.lang.home.alert.btn
      })
      return
    }

    if (this.data.phone.length !== 10) {
      my.alert({
        title: this.data.lang.home.alert.invalidTitle,
        content: this.data.lang.home.alert.msg,
        buttonText: this.data.lang.home.alert.btn
      })
      return
    }
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