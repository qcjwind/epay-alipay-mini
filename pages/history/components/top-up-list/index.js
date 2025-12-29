import {
  getHistoryListAPI,
  getHistoryDetailAPI
} from '../../../../services/index'

Component({
  props: {},
  data: {
    isMore: true,
    visible: false,
    historyList: [],
    historyDetail: null
  },
  didMount() {
    this.paging = {
      pageSize: 20,
      pageNumber: 1,
      total: 0
    };
    this.getHistoryList()
  },
  methods: {
    onLoadMore() {
      return new Promise(async (resolve) => {
        this.paging.pageNumber++
        try {
          await this.getHistoryList()
          resolve(true)
        } catch (error) {
          this.paging.pageNumber--
        }
      })
    },
    closeDetailPopup() {
      this.setData({
        visible: false,
        historyDetail: null
      })
    },
    openHistortDetail(e) {
      const {
        currentTarget: {
          dataset: {
            id
          }
        }
      } = e || {};
      this.getHistoryDetail(id)
    },
    getHistoryDetail(id) {
      my.showLoading()
      getHistoryDetailAPI(id).then(res => {
        my.hideLoading()
        this.setData({
          visible: true,
          historyDetail: res.data || {}
        })
      }).catch(() => {
        my.hideLoading()
      })
    },
    async getHistoryList() {
      const param = {
        ...this.paging
      }
      my.showLoading()
      try {
        const res = await getHistoryListAPI(param)
        my.hideLoading()
        const {
          orderList,
          total
        } = res.data || {};
        this.setData({
          historyList: orderList,
          paging: {
            ...this.data.paging,
            isMore: (+total / this.paging.pageSize) > this.paging.pageSize,
            total
          }
        })
      } catch (error) {
        my.hideLoading()
      }
    },
  },
});