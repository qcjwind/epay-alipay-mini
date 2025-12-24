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
    faceValueList: [], // list<string> 是 充值面额列表（从接口获取）
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
    
    // 获取充值面额列表
    this.getFaceValueList();
    
    // 初始化背景
    this.updateBackground('0');
  },

  // 模拟接口：获取充值面额列表
  // 接口入参：operator string 是 运营商
  // 接口响应：faceValueList list<string> 是 充值面额列表
  getFaceValueList() {
    const { operator } = this.data;
    
    // 模拟接口调用
    console.info('Calling API to get face value list, operator:', operator);
    
    // 模拟异步接口调用
    setTimeout(() => {
      // 模拟接口响应数据
      // 接口响应格式：{ faceValueList: ['5', '10', '20', ...] }
      const mockResponse = {
        faceValueList: ['5', '10', '20', '30', '50', '100', '200', '500']
      };
      
      console.info('API response:', mockResponse);
      
      // 使用接口返回的 faceValueList 字段
      this.setData({
        faceValueList: mockResponse.faceValueList
      });
      
      // 如果之前有选中的金额，需要重新计算背景
      if (this.data.selectedAmount && this.data.selectedAmount !== '0') {
        this.updateBackground(this.data.selectedAmount);
      }
    }, 300); // 模拟网络延迟
  },

  // 根据金额计算背景类名
  getBackgroundClass(amount) {
    // 默认背景为空
    if (amount === '0' || !amount) {
      return '';
    }

    const { faceValueList } = this.data;
    const amountIndex = faceValueList.indexOf(amount);
    
    if (amountIndex === -1) {
      return ''; // 默认背景为空
    }

    const totalOptions = faceValueList.length;
    
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
    const { 
      selectedAmount, 
      lang,
      phoneNumber,      // string 是 充值号码
      operator,         // string 是 运营商
      userName,         // string 是 用户姓名
      recurringType,    // string 否 周期类型 周：WEEK 月：MONTH
      recurringDay      // string 否 周期日期
    } = this.data;
    
    // 验证是否选择了面额
    if (!selectedAmount || selectedAmount === '0') {
      my.showModal({
        title: lang.chooseAmount.selectAmountTitle,
        content: lang.chooseAmount.selectAmountContent,
        confirmText: lang.message.ok,
        showCancel: false,
      });
      return;
    }
    
    // 判断充值方式：如果有 recurringType 和 recurringDay，则为定期充值，否则为单次充值
    const payMethod = (recurringType && recurringDay) ? 'recurring' : 'oneTime';
    
    // 构建参数对象，透传所有接收到的参数，并添加 amount 和 payMethod 字段
    const params = {
      phoneNumber,
      operator,
      userName,
      amount: selectedAmount, // string 是 充值金额
      payMethod: payMethod, // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
      recurringType,
      recurringDay
    };
    
    // 将参数对象转换为 URL 查询字符串
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '') // 过滤空值
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    console.log('Navigate to confirm-top-up with params:', params);
    
    // 跳转到确认充值页面
    my.navigateTo({
      url: `/pages/confirm-top-up/confirm-top-up?${queryString}`
    });
  }
}));

