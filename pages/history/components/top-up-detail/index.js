import {
  createComponent
} from '@miniu/data'
import { changeRecurringStatusAPI, getRecurringAuthUrlAPI, confirmRecurringAgreementAPI } from '../../../../services/index'

Component(createComponent({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  props: {
    visible: false,
    onClose: null,
    historyDetail: {}
  },
  data: {},

  methods: {
    closePopup() {
      if (Object.prototype.toString.call(this.props.onClose) === '[object Function]') {
        this.props.onClose()
      }
    },
    editHandle() {
      // 跳转到确认充值页面，编辑周期充值
      const { historyDetail } = this.props;
      
      if (!historyDetail) {
        return;
      }
      
      // 如果已删除，不允许编辑
      if (historyDetail.agreementStatus === 'DELETED') {
        return;
      }
      
      // 检查是否有 agreementId
      const agreementId = historyDetail.agreementId;
      if (!agreementId) {
        return;
      }
      
      // 解析电话号码（可能包含前缀，用空格分隔）
      let phoneNumber = historyDetail.phoneNumber || '';
      let phonePrefix = '';
      
      if (phoneNumber && phoneNumber.includes(' ')) {
        const parts = phoneNumber.split(' ');
        phonePrefix = parts[0];
        phoneNumber = parts.slice(1).join(' ');
      }
      
      // 处理金额：携带参数用 amount.amount
      const amount = historyDetail.amount && historyDetail.amount.amount 
        ? String(historyDetail.amount.amount) 
        : '';
      
      // 获取当前的周期设置
      const recurringType = historyDetail.recurringType || '';
      const recurringDay = historyDetail.recurringDay || '';
      
      // 构建参数
      const params = {
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        operator: historyDetail.operator || '',
        userName: historyDetail.phoneUserName || '',
        amount: amount,
        payMethod: 'recurring',
        recurringType: recurringType,
        recurringDay: recurringDay,
        editRecurring: 'true',
        agreementId: agreementId
      };
      
      // 过滤空值并构建查询字符串
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // 关闭弹窗
      this.closePopup();
      
      // 跳转到确认充值页面（编辑模式）
      my.navigateTo({
        url: `/pages/confirm-top-up/confirm-top-up?${queryString}`
      });
    },
    async deleteHandle() {
      const { historyDetail } = this.props;
      
      // 如果已删除，不允许再次删除
      if (historyDetail.agreementStatus === 'DELETED') {
        return;
      }
      
      // 检查是否有 agreementId
      const agreementId = historyDetail.agreementId;
      if (!historyDetail || !agreementId) {
        return;
      }
      
      my.confirm({
        title: this.data.lang.history.delete.title,
        content: this.data.lang.history.delete.text,
        cancelButtonText: this.data.lang.history.delete.cancel,
        confirmButtonTextL: this.data.lang.history.delete.confirm,
        success: async (res) => {
          if (res.confirm) {
            try {
              my.showLoading();
              // 调用 changeRecurringStatusAPI 删除
              await changeRecurringStatusAPI(agreementId, 'DELETED');
              my.hideLoading();
              
              // 关闭弹窗
              this.closePopup();
              
              // 切换到 recurring tab
              const pages = getCurrentPages();
              const currentPage = pages[pages.length - 1];
              if (currentPage && currentPage.setData) {
                currentPage.setData({
                  currentKey: 'recurring'
                });
              }
            } catch (error) {
              my.hideLoading();
              console.error('删除周期充值失败:', error);
            }
          }
        }
      })
    },
    async turnIntoRecurringHandle() {
      // 跳转到设置定期页面，携带相关参数
      const { historyDetail } = this.props;
      
      if (!historyDetail) {
        return;
      }
      
      // 解析电话号码（可能包含前缀，用空格分隔）
      let phoneNumber = historyDetail.phoneNumber || '';
      let phonePrefix = '';
      
      if (phoneNumber && phoneNumber.includes(' ')) {
        const parts = phoneNumber.split(' ');
        phonePrefix = parts[0];
        phoneNumber = parts.slice(1).join(' ');
      }
      
      // 组合电话号码（phonePrefix + phoneNumber，用空格隔开）
      const phoneNumberWithPrefix = phonePrefix && phoneNumber
        ? `${phonePrefix} ${phoneNumber}`
        : phoneNumber || '';
      
      // 处理金额：携带参数用 amount.amount
      const amount = historyDetail.amount.amount 
        ? String(historyDetail.amount.amount) 
        : '';
      
      // 提前校验手机号的激活状态（使用默认周期信息）
      // try {
      //   my.showLoading();

      //   const confirmRes = await confirmRecurringAgreementAPI({
      //     phoneNumber: phoneNumberWithPrefix,
      //     phoneUserName: historyDetail.phoneUserName || '',
      //     operator: historyDetail.operator || '',
      //   });
        
      //   // 根据状态码判断是否已激活
      //   if (+confirmRes.code === 10003) {
      //     my.hideLoading();
      //     my.alert({
      //       title: this.data.lang.confirmTopUp.recurringAlreadyActivatedError.title,
      //       content: this.data.lang.confirmTopUp.recurringAlreadyActivatedError.content,
      //       buttonText: this.data.lang.confirmTopUp.recurringAlreadyActivatedError.btn,
      //     });
      //     return;
      //   }
        
      //   my.hideLoading();
      // } catch (error) {
      //   my.hideLoading();
      //   // 如果校验失败，继续跳转（可能是网络错误等）
      //   console.error('Check recurring status error:', error);
      // }
      
      // 构建参数
      const params = {
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        operator: historyDetail.operator || '',
        userName: historyDetail.phoneUserName || '',
        amount: amount,
        payMethod: 'recurring',
        isFromHistoryPanel: 'true'
      };
      
      // 过滤空值并构建查询字符串
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // 关闭弹窗
      this.closePopup();
      
      // 跳转到设置定期页面
      my.navigateTo({
        url: `/pages/set-recurring/set-recurring?${queryString}`
      });
    },
    topUpAgainHandle() {
      // 跳转到支付确认页，类型为单次充值
      const { historyDetail } = this.props;
      
      if (!historyDetail) {
        return;
      }
      
      // 解析电话号码（可能包含前缀，用空格分隔）
      let phoneNumber = historyDetail.phoneNumber || '';
      let phonePrefix = '';
      
      if (phoneNumber && phoneNumber.includes(' ')) {
        const parts = phoneNumber.split(' ');
        phonePrefix = parts[0];
        phoneNumber = parts.slice(1).join(' ');
      }
      
      // 处理金额：携带参数用 amount.amount
      const amount = historyDetail.amount && historyDetail.amount.amount 
        ? String(historyDetail.amount.amount) 
        : '';
      
      // 构建参数
      const params = {
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        operator: historyDetail.operator || '',
        userName: historyDetail.phoneUserName || '',
        amount: amount,
        payMethod: 'oneTime'
      };
      
      // 过滤空值并构建查询字符串
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // 关闭弹窗
      this.closePopup();
      
      // 跳转到确认充值页面
      my.navigateTo({
        url: `/pages/confirm-top-up/confirm-top-up?${queryString}`
      });
    }
  }
}));