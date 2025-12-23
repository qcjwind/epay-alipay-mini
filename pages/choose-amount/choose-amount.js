import { createPage } from '@miniu/data'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    // 页面接收的参数（可能来自设置定期页面或首页）
    phoneNumber: '', // string 是 充值号码
    operator: '', // string 是 运营商
    userName: '', // string 是 用户姓名
    recurringType: '', // string 否 周期类型 周：WEEK 月：MONTH（仅从设置定期页面跳转时有值）
    recurringDay: '', // string 否 周期日期（仅从设置定期页面跳转时有值）
    
    // 页面自身数据
    selectedAmount: '0',
    amountOptions: ['5', '10', '20', '30', '50', '100', '200', '500'],
    backgroundClass: ''
  },

  onLoad(query) {
    console.info('Choose amount page onLoad with query:', JSON.stringify(query));
    
    // 接收页面参数（可能来自设置定期页面或首页）
    // phoneNumber: string 是 充值号码
    // operator: string 是 运营商
    // userName: string 是 用户姓名
    // recurringType: string 否 周期类型 周：WEEK 月：MONTH（仅从设置定期页面跳转时有值）
    // recurringDay: string 否 周期日期（仅从设置定期页面跳转时有值）
    const { phoneNumber, operator, userName, recurringType, recurringDay } = query;
    
    this.setData({
      phoneNumber: phoneNumber || '',
      operator: operator || '',
      userName: userName || '',
      // 这两个参数可能为空（从首页直接跳转时）
      recurringType: recurringType || '',
      recurringDay: recurringDay || ''
    });
    
    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      recurringType: this.data.recurringType,
      recurringDay: this.data.recurringDay,
      isFromSetRecurring: !!(this.data.recurringType && this.data.recurringDay)
    });
    
    // 初始化背景
    this.updateBackground('0');
  },

  // 根据金额计算背景类名
  getBackgroundClass(amount) {
    // 默认背景为空
    if (amount === '0' || !amount) {
      return '';
    }

    const { amountOptions } = this.data;
    const amountIndex = amountOptions.indexOf(amount);
    
    if (amountIndex === -1) {
      return ''; // 默认背景为空
    }

    const totalOptions = amountOptions.length;
    
    // 如果选项少于3个，每个金额对应一个背景
    if (totalOptions < 3) {
      const backgrounds = ['bg-mini', 'bg-mid', 'bg-max'];
      return backgrounds[amountIndex] || '';
    }

    // 选项 >= 3，平均分成3段
    const segmentSize = totalOptions / 3;
    const segmentIndex = Math.floor(amountIndex / segmentSize);
    
    // 确保segmentIndex在0-2范围内
    const safeSegmentIndex = Math.min(segmentIndex, 2);
    
    const backgrounds = [
      'bg-mini',  // 第1段：最小金额
      'bg-mid',   // 第2段：中间金额
      'bg-max'    // 第3段：最大金额
    ];
    
    return backgrounds[safeSegmentIndex];
  },

  // 更新背景
  updateBackground(amount) {
    const backgroundClass = this.getBackgroundClass(amount);
    this.setData({
      backgroundClass: backgroundClass
    });
  },

  // 选择金额
  selectAmount(e) {
    const amount = e.currentTarget.dataset.amount;
    this.setData({
      selectedAmount: amount
    });
    // 更新背景
    this.updateBackground(amount);
  },

  // 继续按钮
  handleContinue() {
    const { selectedAmount, lang } = this.data;
    
    // 验证是否选择了面额
    if (!selectedAmount || selectedAmount === '0') {
      my.showModal({
        title: lang.chooseAmount.selectAmountTitle,
        content: lang.chooseAmount.selectAmountContent,
        confirmText: lang.message.ok,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            // 用户点击了 OK
          }
        }
      });
      return;
    }
    
    console.log('Continue with amount:', selectedAmount);
    
    // TODO: 处理继续逻辑
    my.showToast({
      content: `已选择金额：${selectedAmount}€`,
      duration: 2000
    });
  }
}));

