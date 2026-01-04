import {
  createPage
} from '@miniu/data'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    currentKey: 'topUp',
    tabs: [],
  },
  onLoad(query) {
    const { currentKey } = query || {};
    
    const arr = [{
      key: 'topUp',
      label: this.data.lang.history.topUp,
    }, {
      key: 'recurring',
      label: this.data.lang.history.recurring
    }]
    
    this.setData({
      tabs: arr,
      currentKey: currentKey || 'topUp'
    })
  },
  switchClick(e) {
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
  },
  onSwipeAction(e) {
    const {
      action
    } = e.detail;
    if (action === 'delete') {
      // 处理删除操作
      my.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success: (res) => {
          if (res.confirm) {
            // 执行删除逻辑
            console.log('删除操作');
          }
        }
      });
    }
  }
}));