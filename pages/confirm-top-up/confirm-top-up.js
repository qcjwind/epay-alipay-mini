import { createPage } from '@miniu/data'
import { updateRecurringAPI, getFaceValueListAPI, getRecurringAuthUrlAPI, confirmRecurringAgreementAPI, oneTimePayAPI, getOneTimeStatusAPI } from '../../services/topup'

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
    editRecurring: false, // boolean 否 是否编辑定期充值
    agreementId: '', // string 否 合约ID（编辑时必需）

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
    pollCount: 0, // 轮询次数
    orderId: '' // 订单ID（用于查询支付状态）
  },

  onLoad(query) {
    console.info('Confirm top up page onLoad with query:', JSON.stringify(query));

    const { phoneNumber, operator, userName, amount, payMethod, recurringType, recurringDay, editRecurring, agreementId } = query;

    this.setData({
      phoneNumber: phoneNumber || '',
      operator: operator || '',
      userName: userName || '',
      amount: amount || '',
      payMethod: payMethod || '',
      recurringType: recurringType || '',
      recurringDay: recurringDay || '',
      editRecurring: editRecurring === 'true' || editRecurring === true,
      agreementId: agreementId || ''
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
      recurringDay: this.data.recurringDay,
      editRecurring: this.data.editRecurring,
      agreementId: this.data.agreementId
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

  // 重置确认按钮状态
  resetConfirmButton() {
    const { lang } = this.data;
    this.setData({
      isConfirming: false,
      confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase()
    });
  },

  // 显示成功弹窗
  // type: 'recurring' | 'oneTime' 成功类型
  showSuccessModal(type) {
    const { lang } = this.data;
    
    let title, content, buttonText;
    
    if (type === 'recurring') {
      title = lang.confirmTopUp.recurringSuccess.Title;
      content = lang.confirmTopUp.recurringSuccess.content;
      buttonText = lang.confirmTopUp.recurringSuccess.btn;
    } else if (type === 'oneTime') {
      title = lang.confirmTopUp.oneTimeSuccess.title;
      content = lang.confirmTopUp.oneTimeSuccess.content;
      buttonText = lang.confirmTopUp.oneTimeSuccess.btn;
    } else {
      console.warn('Unknown success modal type:', type);
      return;
    }
    
    this.resetConfirmButton();
    this.setData({
      successModalVisible: true,
      successModalTitle: title,
      successModalContent: content,
      successModalButtonText: buttonText
    });
  },

  // 显示异常弹窗
  // message: string 错误消息
  // title: string 可选 错误标题，默认为空
  // resetButton: boolean 可选 是否重置按钮状态，默认为 true
  showErrorAlert(message, title = '', resetButton = true) {
    if (resetButton) {
      this.resetConfirmButton();
    }
    
    const alertOptions = {
      content: message || 'An error occurred'
    };
    
    if (title) {
      alertOptions.title = title;
    }
    
    my.alert(alertOptions);
  },

  // 执行确认操作
  doConfirm() {
    const { lang, payMethod, editRecurring } = this.data;

    // 设置处理中标志，更新按钮文案
    this.setData({
      isConfirming: true,
      confirmButtonText: lang.message.loading_ellipsis.toUpperCase()
    });

    console.log('Confirm top up, payMethod:', payMethod, 'editRecurring:', editRecurring);

    // 根据充值类型调用不同的接口
    if (payMethod === 'recurring') {
      if (editRecurring) {
        this.editRecurringTopUp();
      } else {
        this.createRecurringTopUp();
      }
    } else {
      this.createOneTimeTopUp();
    }
  },

  // 开启周期充值
  async createRecurringTopUp() {
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

    try {
      // 调用接口获取签约链接
      const authUrlRes = await getRecurringAuthUrlAPI();
      console.log('Get auth URL response:', authUrlRes);
      
      const signStr = authUrlRes.authURL;
      
      if (!signStr) {
        throw new Error('Auth URL is empty');
      }

      my.signContract({
        signStr,
        success: async (res) => {
          console.log('Sign contract success, authCode:', res.authCode);
          
          try {
            // 调用开启周期充值接口
            await confirmRecurringAgreementAPI({
              phoneNumber,
              operator,
              amount,
              recurringType,
              recurringDay,
              authCode: res.authCode
            });
            
            console.log('Confirm recurring agreement success');
            
            // 接口成功后显示成功弹窗
            this.showSuccessModal('recurring');
          } catch (error) {
            console.error('Confirm recurring agreement error:', error);
            this.showErrorAlert(error.message || 'Failed to confirm recurring agreement');
          }
        },
        fail: (res) => {
          console.error('Sign contract fail:', res);
          this.showErrorAlert(res.errorMessage || 'Sign contract failed');
        }
      });
    } catch (error) {
      console.error('Get auth URL error:', error);
      this.showErrorAlert(error.message || 'Failed to get auth URL');
    }
  },

  // 编辑周期充值（不需要签约）
  editRecurringTopUp() {
    const {
      agreementId,
      amount,
      recurringType,
      recurringDay,
      lang
    } = this.data;

    console.log('Edit recurring top up:', {
      agreementId,
      amount,
      recurringType,
      recurringDay
    });

    // 验证必要参数
    if (!agreementId) {
      this.showErrorAlert('Agreement ID is required');
      return;
    }

    // 调用编辑接口
    updateRecurringAPI({
      agreementId,
      amount,
      recurringType,
      recurringDay
    }).then((res) => {
      console.log('Edit recurring success:', res);
      // 接口成功后显示成功弹窗
      this.showSuccessModal('recurring');
    }).catch((error) => {
      console.error('Edit recurring error:', error);
      this.showErrorAlert(error.message || 'Edit recurring failed');
    });
  },

  // 单次充值
  async createOneTimeTopUp() {
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

    try {
      // 调用单次充值接口，获取 paymentId 和 orderId
      const payRes = await oneTimePayAPI({
        phoneNumber,
        operator,
        amount
      });
      
      console.log('One time pay API response:', payRes);
      
      const { paymentId, orderId } = payRes;
      
      if (!paymentId) {
        throw new Error('Payment ID is empty');
      }
      
      // 保存 orderId 用于后续查询状态
      this.setData({
        orderId: orderId || ''
      });

      // 使用 paymentId 作为 tradeNO 调用支付
      my.tradePay({
        tradeNO: paymentId,
        success: (res) => {
          console.log('tradePay success:', res);
          // 启动轮询查询支付状态（使用 orderId）
          this.startPollingPaymentStatus(orderId);
        },
        fail: (res) => {
          console.error('tradePay fail:', res);
          this.showErrorAlert(res.errorMessage || JSON.stringify(res));
        }
      });
    } catch (error) {
      console.error('One time pay API error:', error);
      this.showErrorAlert(error.message || 'Failed to create one time top up');
    }
  },

  // 关闭成功弹窗
  handleSuccessModalClose() {
    this.setData({
      successModalVisible: false
    });
    
    // 跳转到历史充值页面
    my.switchTab({
      url: '/pages/history/index'
    });
  },

  // 开始轮询支付状态
  startPollingPaymentStatus(orderId) {
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
    this.pollPaymentStatus(orderId);
  },

  // 轮询支付状态
  pollPaymentStatus(orderId) {
    const { lang, pollCount } = this.data;
    
    // 超过最大次数，当作异常处理
    if (pollCount >= 10) {
      console.error('Polling exceeded max count, treat as error');
      this.handlePollingError('Polling exceeded max count');
      return;
    }
    
    // 查询支付状态
    this.queryPaymentStatus(orderId).then((result) => {
      // 如果支付成功，显示成功弹窗
      if (result.success) {
        this.stopPolling();
        this.showSuccessModal('oneTime');
      } else {
        // 继续轮询
        this.continuePolling(orderId);
      }
    }).catch((error) => {
      console.error('Query payment status error:', error);
      // 继续轮询
      this.continuePolling(orderId);
    });
  },

  // 继续轮询
  continuePolling(orderId) {
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
      this.pollPaymentStatus(orderId);
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
    
    // 显示错误提示
    this.showErrorAlert(error || 'Payment status query failed, please try again later.', 'Error');
  },

  // 查询支付状态接口
  // 接口入参：orderId string 是 订单ID
  // 接口响应：orderStatus string 是 支付状态
  //          待支付：WAIT_PAY
  //          待充值：WAIT_TOP_UP
  //          完成：FINISH
  //          异常：EXCEPTION
  async queryPaymentStatus(orderId) {
    console.log('Query payment status, orderId:', orderId, 'pollCount:', this.data.pollCount);
    
    try {
      const res = await getOneTimeStatusAPI(orderId);
      console.log('Payment status response:', res);
      
      // 根据 orderStatus 判断是否成功
      // FINISH 表示完成（支付成功）
      const success = res.orderStatus === 'FINISH';
      
      return {
        success: success,
        orderId: orderId,
        orderStatus: res.orderStatus,
        exceptionReason: res.exceptionReason
      };
    } catch (error) {
      console.error('Query payment status error:', error);
      // 查询失败时返回未成功，继续轮询
      return {
        success: false,
        orderId: orderId,
        orderStatus: 'UNKNOWN',
        error: error.message
      };
    }
  }
}));
