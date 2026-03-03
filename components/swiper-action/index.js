Component({
  props: {
    disabled: false
  },
  data: {
    translateX: 0, // 当前 translateX 值（px，负值表示向左移动）
    startX: 0, // 触摸开始位置
    startTranslateX: 0, // 触摸开始时的 translateX，用于已展开时右滑关闭
    currentX: 0, // 当前触摸位置
    isMoving: false, // 是否正在滑动
    hasTransition: false, // 是否有过渡动画
  },
  async didMount() {
    // 获取操作区宽度
    const actionDom = await this.getBoxRect('.swiper-action');
    this.actionWidth = actionDom ? actionDom.width : 160; // 默认 160px
  },
  methods: {
    getBoxRect(selector) {
      return new Promise((resolve) => {
        my.createSelectorQuery()
          .in(this)
          .select(selector)
          .boundingClientRect()
          .exec(res => {
            resolve(res && res[0] ? res[0] : null);
          });
      });
    },

    // 触摸开始
    onTouchStart(e) {
      if (this.data.disabled) return;
      
      const touch = e.touches[0];
      this.setData({
        startX: touch.clientX,
        startTranslateX: this.data.translateX, // 记录起始位移，已展开时右滑可关闭
        currentX: touch.clientX,
        isMoving: true,
        hasTransition: false // 滑动过程中禁用过渡动画
      });
    },

    // 触摸移动
    onTouchMove(e) {
      if (this.data.disabled || !this.data.isMoving) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.data.startX;
      const actionWidth = this.actionWidth || 160;
      // 基于触摸起始时的位移计算，已展开时右滑可关闭
      let translateX = this.data.startTranslateX + deltaX;
      if (translateX > 0) translateX = 0;
      if (translateX < -actionWidth) translateX = -actionWidth;

      this.setData({
        currentX: touch.clientX,
        translateX: translateX
      });
    },

    // 触摸结束事件 - 根据当前位移与阈值决定展开或收起
    onTouchEnd(e) {
      if (this.data.disabled || !this.data.isMoving) return;

      const actionWidth = this.actionWidth || 160;
      const threshold = actionWidth / 2; // 滑动阈值：按钮宽度的一半
      const currentTranslateX = this.data.translateX;
      // 超过一半则视为展开，否则收起（已展开时右滑会减小 translateX，小于阈值则收起）
      const targetTranslateX = currentTranslateX > -threshold ? 0 : -actionWidth;

      this.setData({
        translateX: targetTranslateX,
        isMoving: false,
        hasTransition: true // 触摸结束后启用过渡动画
      });
    },

    // 点击内容区域，收起操作区
    onContentTap() {
      if (this.data.translateX < 0) {
        this.setData({
          translateX: 0,
          hasTransition: true
        });
      }
    },

    // 点击操作按钮
    onActionTap(e) {
      const {
        action,
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('action', {
        action,
        index
      });
    },

    // 手动收起操作区
    closeAction() {
      this.setData({
        translateX: 0,
        hasTransition: true
      });
    }
  }
});