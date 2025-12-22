Component({
  data: {
    navBarHeight: 0,
  },
  didMount() {
    this.getNavBarHeight();
  },
  methods: {
    getNavBarHeight() {
      try {
        const systemInfo = my.getSystemInfoSync();
        // 支付宝小程序中，statusBarHeight 是状态栏高度
        // titleBarHeight 是标题栏高度（如果存在）
        const statusBarHeight = systemInfo.statusBarHeight || 0;
        // 支付宝小程序标题栏高度通常是固定的，如果没有 titleBarHeight，使用默认值
        const titleBarHeight = systemInfo.titleBarHeight || 44; // 默认44px，约88rpx
        const navBarHeight = statusBarHeight + titleBarHeight;
        
        this.setData({
          navBarHeight: navBarHeight
        });
      } catch (error) {
        console.error('获取系统信息失败:', error);
        // 设置默认高度
        this.setData({
          navBarHeight: 88 // 默认高度，约44px状态栏 + 44px标题栏
        });
      }
    }
  }
});

