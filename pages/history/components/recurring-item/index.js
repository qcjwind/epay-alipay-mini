Component({
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
    }
  },
});