Component({
  props: {
    // 是否显示弹窗
    visible: false,
    // 标题
    title: '',
    // 内容
    content: '',
    // 按钮文案
    buttonText: 'CLOSE',
    // 关闭回调
    onClose() {}
  },

  methods: {
    // 关闭弹窗
    handleClose() {
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }
});

