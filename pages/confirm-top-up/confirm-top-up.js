import { createPage } from '@miniu/data'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    // 页面接收的参数（来自选择金额页面）
    phoneNumber: '', // string 是 充值号码
    operator: '', // string 是 运营商
    userName: '', // string 是 用户姓名
    amount: '', // string 是 充值金额
    payMethod: '', // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    recurringType: '', // string 否 周期类型 周：WEEK 月：MONTH
    recurringDay: '', // string 否 周期日期

    // 页面展示数据（基于接收的参数生成）
    recurringText: '',
    avatarInitials: '',

    // 金额选择器相关
    amountPickerVisible: false,
    faceValueList: [], // list<string> 是 充值面额列表（从接口获取）
    selectedAmountIndex: 0,

    // 定期充值选择器相关
    recurringPickerVisible: false,
    selectedFrequency: 'WEEK',
    selectedDay: 'Monday',

    // 防抖相关
    isConfirming: false, // 是否正在确认中，用于防抖
    confirmButtonText: '', // 确认按钮文案（从 i18n 获取）

    // 成功弹窗相关
    successModalVisible: false,
    successModalTitle: '', // 成功弹窗标题
    successModalContent: '', // 成功弹窗内容
    successModalButtonText: '', // 成功弹窗按钮文案
    
    // 轮询相关
    pollTimer: null, // 轮询定时器
    pollCount: 0 // 轮询次数
  },

  onLoad(query) {
    console.info('Confirm top up page onLoad with query:', JSON.stringify(query));

    // 接收来自选择金额页面的参数
    // phoneNumber: string 是 充值号码
    // operator: string 是 运营商
    // userName: string 是 用户姓名
    // amount: string 是 充值金额
    // payMethod: string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    // recurringType: string 否 周期类型 周：WEEK 月：MONTH
    // recurringDay: string 否 周期日期
    const { phoneNumber, operator, userName, amount, payMethod, recurringType, recurringDay } = query;

    // 设置接收到的参数
    this.setData({
      phoneNumber: phoneNumber || '',
      operator: operator || '',
      userName: userName || '',
      amount: amount || '',
      payMethod: payMethod || '',
      recurringType: recurringType || '',
      recurringDay: recurringDay || ''
    });

    // 根据参数生成展示数据
    this.updateDisplayData();

    // 获取充值面额列表
    this.getFaceValueList();

    // 初始化按钮文案
    this.setData({
      confirmButtonText: this.data.lang.confirmTopUp.confirm.confirmButtonText.toUpperCase()
    });

    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      amount: this.data.amount,
      payMethod: this.data.payMethod,
      recurringType: this.data.recurringType,
      recurringDay: this.data.recurringDay
    });
  },

  // 页面卸载时清理定时器
  onUnload() {
    this.stopPolling();
  },

  // 根据接收的参数更新页面展示数据
  updateDisplayData() {
    const { recurringType, recurringDay } = this.data;

    // 生成定期充值文本
    let recurringText = 'None';
    if (recurringType && recurringDay) {
      const frequencyText = recurringType === 'WEEK' ? 'Weekly' : 'Monthly';
      recurringText = `${frequencyText} - on ${recurringDay}`;
    }

    this.setData({
      recurringText: recurringText
    });

    // 计算首字母
    this.calculateInitials();
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
    }, 300); // 模拟网络延迟
  },

  // 计算姓名首字母
  calculateInitials() {
    const { userName } = this.data;
    if (!userName) {
      this.setData({ avatarInitials: '' });
      return;
    }

    const parts = userName.trim().split(/\s+/);
    let initials = '';

    if (parts.length >= 2) {
      // 如果有多个单词，取第一个和最后一个的首字母
      initials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    } else if (parts.length === 1) {
      // 如果只有一个单词，取前两个字符
      initials = parts[0].substring(0, 2).toUpperCase();
    }

    this.setData({ avatarInitials: initials });
  },

  // 修改金额
  handleChangeAmount() {
    console.log('Change amount');
    // 找到当前金额在选项中的索引
    const { amount, faceValueList } = this.data;
    const currentIndex = faceValueList.indexOf(amount);
    this.setData({
      amountPickerVisible: true,
      selectedAmountIndex: currentIndex >= 0 ? currentIndex : 0
    });
  },

  // 关闭金额选择器
  handleAmountPickerClose() {
    this.setData({
      amountPickerVisible: false
    });
  },

  // 确认选择金额
  handleAmountPickerConfirm(index) {
    const { faceValueList } = this.data;
    const selectedAmount = faceValueList[index];
    this.setData({
      amount: selectedAmount,
      amountPickerVisible: false
    });
    console.log('Selected amount:', selectedAmount);
  },

  // 修改定期充值
  handleChangeRecurring() {
    console.log('Change recurring');
    // 使用当前接收到的参数设置初始值
    const { recurringType, recurringDay } = this.data;

    // 如果没有参数，使用默认值
    let frequency = recurringType || 'WEEK';
    let day = recurringDay || 'Monday';

    this.setData({
      recurringPickerVisible: true,
      selectedFrequency: frequency,
      selectedDay: day
    });
  },

  // 关闭定期充值选择器
  handleRecurringPickerClose() {
    this.setData({
      recurringPickerVisible: false
    });
  },

  // 频率变化
  handleFrequencyChange(frequency) {
    // 组件内部会自动处理日期选项的切换
    // 这里只需要更新频率，组件会根据频率自动更新日期选项
    this.setData({
      selectedFrequency: frequency
    });
  },

  // 日期变化
  handleDayChange(day) {
    this.setData({
      selectedDay: day
    });
  },

  // 确认定期充值设置
  handleRecurringContinue({ frequency, day }) {
    const frequencyText = frequency === 'WEEK' ? 'Weekly' : 'Monthly';
    const recurringText = `${frequencyText} - on ${day}`;

    this.setData({
      recurringType: frequency, // 更新参数
      recurringDay: day, // 更新参数
      recurringText: recurringText,
      recurringPickerVisible: false
    });

    console.log('Selected recurring:', recurringText);
  },

  // 确认按钮（带防抖）
  handleContinue() {
    // 防抖：如果正在处理中，直接返回
    if (this.data.isConfirming) {
      console.log('Confirm request is processing, please wait...');
      return;
    }

    const { lang } = this.data;
    my.confirm({
      title: lang.confirmTopUp.confirm.title,
      content: lang.confirmTopUp.confirm.content,
      confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText,
      cancelButtonText: lang.confirmTopUp.confirm.cancelButtonText,
      success: (res) => {
        if (res.confirm) {
          this.doConfirm();
        }
      }
    });
  },

  // 执行确认操作
  doConfirm() {
    const { lang, payMethod } = this.data;

    // 设置处理中标志，更新按钮文案
    this.setData({
      isConfirming: true,
      confirmButtonText: lang.message.loading_ellipsis.toUpperCase()
    });

    console.log('Confirm top up, payMethod:', payMethod);

    // 根据充值类型调用不同的接口
    if (payMethod === 'recurring') {
      // TODO: 调用开启周期充值接口
      // 接口参数：phoneNumber, operator, userName, amount, recurringType, recurringDay
      this.createRecurringTopUp();
    } else {
      // TODO: 调用单次充值接口
      // 接口参数：phoneNumber, operator, userName, amount
      this.createOneTimeTopUp();
    }
  },

  // 开启周期充值
  createRecurringTopUp() {
    const {
      phoneNumber,
      operator,
      userName,
      amount,
      recurringType,
      recurringDay,
      lang
    } = this.data;

    console.log('Create recurring top up:', {
      phoneNumber,
      operator,
      userName,
      amount,
      recurringType,
      recurringDay
    });

    // todo 调用接口获取签约链接
    const signStr = 'https://openauth.xxx.com/authentication.htm?authId=FBF16F91-28FB-47EC-B9BE-27B285C23CD3'

    my.signContract({
      signStr,
      success: (res) => {
        // TODO: 调用开启周期充值接口
        // res.authCode
        // 示例：模拟异步操作
        setTimeout(() => {
          // 接口成功后显示成功弹窗
          this.setData({
            isConfirming: false,
            confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase(),
            successModalVisible: true,
            successModalTitle: lang.confirmTopUp.recurringSuccess.Title,
            successModalContent: lang.confirmTopUp.recurringSuccess.content,
            successModalButtonText: lang.confirmTopUp.recurringSuccess.btn
          });

          // 注意：在接口的 success 和 fail 回调中都需要重置按钮状态
          // 成功时显示弹窗，失败时重置按钮状态即可
        }, 1000); // 模拟异步操作延迟
      },
      fail: (res) => {
        my.alert({
          content: res.errorMessage,
        });

        this.setData({
          isConfirming: false,
          confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase(),
        });
      }
    });
  },

  // 单次充值
  createOneTimeTopUp() {
    const {
      phoneNumber,
      operator,
      userName,
      amount,
      lang
    } = this.data;

    console.log('Create one time top up:', {
      phoneNumber,
      operator,
      userName,
      amount
    });

    // TODO: 调用单次充值接口,拿到tradeNo
    my.tradePay({
      tradeNO: '201711152100110410533667792', // get the tradeNo from the server first
      success: (res) => {
        console.log('tradePay success:', res);
        // 启动轮询查询支付状态
        this.startPollingPaymentStatus(res.tradeNO || '201711152100110410533667792');
      },
      fail: (res) => {
        console.error('tradePay fail:', res);
        // 重置按钮状态
        this.setData({
          isConfirming: false,
          confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase()
        });
        my.alert({
          content: JSON.stringify(res),
        });
      }
    });
  },

  // 关闭成功弹窗
  handleSuccessModalClose() {
    this.setData({
      successModalVisible: false
    });
  },

  // 开始轮询支付状态
  startPollingPaymentStatus(tradeNO) {
    const { lang } = this.data;
    
    // 重置轮询计数
    this.setData({
      pollCount: 0
    });
    
    // 清除之前的定时器
    if (this.data.pollTimer) {
      clearTimeout(this.data.pollTimer);
    }
    
    // 开始轮询
    this.pollPaymentStatus(tradeNO);
  },

  // 轮询支付状态
  pollPaymentStatus(tradeNO) {
    const { lang, pollCount } = this.data;
    
    // 超过最大次数，当作异常处理
    if (pollCount >= 10) {
      console.error('Polling exceeded max count, treat as error');
      this.handlePollingError('Polling exceeded max count');
      return;
    }
    
    // 查询支付状态
    this.queryPaymentStatus(tradeNO).then((result) => {
      // 如果支付成功，显示成功弹窗
      if (result.success) {
        this.stopPolling();
        this.setData({
          isConfirming: false,
          confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase(),
          successModalVisible: true,
          successModalTitle: lang.confirmTopUp.oneTimeSuccess.title,
          successModalContent: lang.confirmTopUp.oneTimeSuccess.content,
          successModalButtonText: lang.confirmTopUp.oneTimeSuccess.btn
        });
      } else {
        // 继续轮询
        this.continuePolling(tradeNO);
      }
    }).catch((error) => {
      console.error('Query payment status error:', error);
      // 继续轮询
      this.continuePolling(tradeNO);
    });
  },

  // 继续轮询
  continuePolling(tradeNO) {
    const { pollCount } = this.data;
    
    // 更新轮询次数
    const nextPollCount = pollCount + 1;
    this.setData({
      pollCount: nextPollCount
    });
    
    // 计算下次轮询的延迟时间
    // 前3次（第1、2、3次）：2秒，之后（第4次开始）：3秒
    // nextPollCount 是下一次轮询的次数，所以判断应该是 < 3（即第1、2次）用2秒，>= 3（即第3次及以后）用3秒
    const delay = nextPollCount <= 3 ? 2000 : 3000;
    
    // 设置定时器
    const timer = setTimeout(() => {
      this.pollPaymentStatus(tradeNO);
    }, delay);
    
    this.setData({
      pollTimer: timer
    });
  },

  // 停止轮询
  stopPolling() {
    if (this.data.pollTimer) {
      clearTimeout(this.data.pollTimer);
      this.setData({
        pollTimer: null,
        pollCount: 0
      });
    }
  },

  // 处理轮询异常
  handlePollingError(error) {
    const { lang } = this.data;
    
    // 停止轮询
    this.stopPolling();
    
    // 重置按钮状态
    this.setData({
      isConfirming: false,
      confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase()
    });
    
    // 显示错误提示
    my.alert({
      title: 'Error',
      content: error || 'Payment status query failed, please try again later.',
    });
  },

  // 查询支付状态接口
  // TODO: 调用查询支付状态接口
  // 接口入参：tradeNO string 是 交易号
  // 接口响应：success boolean 是 是否支付成功
  queryPaymentStatus(tradeNO) {
    return new Promise((resolve, reject) => {
      console.log('Query payment status, tradeNO:', tradeNO, 'pollCount:', this.data.pollCount);
      
      // 模拟接口调用
      setTimeout(() => {
        // 模拟接口响应
        // 这里可以根据实际接口返回的数据来判断
        // 假设第5次轮询时支付成功（仅用于测试）
        const mockSuccess = this.data.pollCount >= 4;
        
        const mockResponse = {
          success: mockSuccess,
          tradeNO: tradeNO,
          status: mockSuccess ? 'SUCCESS' : 'PROCESSING'
        };
        
        console.log('Payment status response:', mockResponse);
        
        if (mockResponse.success) {
          resolve(mockResponse);
        } else {
          resolve(mockResponse);
        }
      }, 500); // 模拟网络延迟
    });
  }
}));

