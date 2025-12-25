import { createPage } from '@miniu/data'
import { getFaceValueListAPI } from '../../services/index'

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
    payMethod: '', // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    
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
    // payMethod: string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    const { phoneNumber, operator, userName, recurringType, recurringDay, payMethod } = query;
    
    this.setData({
      phoneNumber: phoneNumber || '',
      operator: operator || '',
      userName: userName || '',
      // 这两个参数可能为空（从首页直接跳转时）
      recurringType: recurringType || '',
      recurringDay: recurringDay || '',
      payMethod: payMethod || ''
    });
    
    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      recurringType: this.data.recurringType,
      recurringDay: this.data.recurringDay,
      payMethod: this.data.payMethod,
      isFromSetRecurring: !!(this.data.recurringType && this.data.recurringDay)
    });
    
    // 获取充值面额列表
    this.getFaceValueList();
    
    // 初始化背景
    this.updateBackground('0');
  },

  // 获取充值面额列表
  // 接口入参：operator string 是 运营商
  // 接口响应：faceValueList list<string> 是 充值面额列表
  async getFaceValueList() {
    const { operator } = this.data;
    
    if (!operator) {
      console.warn('Operator is required to get face value list');
      return;
    }
    
    console.info('Calling API to get face value list, operator:', operator);
    
    try {
      const res = await getFaceValueListAPI(operator);
      console.info('API response:', res);
      
      // 使用接口返回的 faceValueList 字段
      this.setData({
        faceValueList: res.faceValueList || []
      });
    } catch (error) {
      console.error('Failed to get face value list:', error);
      // 可以在这里添加错误提示
    }
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
      recurringDay,     // string 否 周期日期
      payMethod         // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
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
    
    // 构建参数对象，透传所有接收到的参数，并添加 amount 字段
    const params = {
      phoneNumber,
      operator,
      userName,
      amount: selectedAmount, // string 是 充值金额
      payMethod,
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

