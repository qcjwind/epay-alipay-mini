import {
  createComponent
} from '@miniu/data'

Component(createComponent({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    switchBtn: false,
    rightAction: [{
      type: 'delete',
      text: '删除',
    }]
  },
  methods: {
    switchHandle() {
      this.setData({
        switchBtn: !this.data.switchBtn
      })
    },
    delRecurring() {
      my.confirm({
        title: this.data.lang.history.delete.title,
        content: this.data.lang.history.delete.text,
        cancelButtonText: this.data.lang.history.delete.cancel,
        confirmButtonTextL: this.data.lang.history.delete.confirm,
        success: (res) => {
          if (res.confirm) {}
        }
      })
    }

  },
}));