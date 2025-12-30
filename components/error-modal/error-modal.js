Component({
  props: {
    // 是否显示弹窗
    visible: false,
    // 标题
    title: '',
    // 内容
    content: '',
    // 确定按钮文案
    okButtonText: 'OK',
    // 重试按钮文案
    retryButtonText: 'Retry',
    // 是否显示重试按钮
    showRetry: false,
    // 确定回调
    onOk() {},
    // 重试回调
    onRetry() {}
  },

  methods: {
    // 确定按钮
    handleOk() {
      if (this.props.onOk) {
        this.props.onOk();
      }
    },
    // 重试按钮
    handleRetry() {
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  }
});

