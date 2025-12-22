import {
  createComponent
} from '@miniu/data'

Component(createComponent({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data() {
    return {
      phone: '',
      currentKey: '',
      tabList: []
    }
  },
  onInit() {
    my.hideTabBar();
    const arr = [{
      icon: '/assets/icons/tablet.png',
      key: 'topUp',
      path: '/pages/index/index',
      label: this.data.lang.home.topUp
    }, {
      key: 'history',
      icon: '/assets/icons/list-check.png',
      path: '/pages/history/index',
      label: this.data.lang.home.history
    }]
    this.setData({
      tabList: arr
    })
  },
  deriveDataFromProps() {
    this.initHandle()
  },
  methods: {
    initHandle() {
      const arr = getCurrentPages();
      const currentpage = arr[arr.length - 1];
      const item = this.data.tabList.find(item => item.path === `/${currentpage.route}`)
      if (item && item.key) {
        this.setData({
          currentKey: item.key
        })
      }
    },
    clickHandle(e) {
      const {
        currentTarget: {
          dataset: {
            key
          }
        }
      } = e || {}
      this.setData({
        currentKey: key
      })
      const item = this.data.tabList.find(item => item.key === key)
      my.switchTab({
        url: item.path
      })
    }
  }
}))