import {
  get,
  post
} from "../http/index";
import { uuid } from "../utils/uuid";

// 查询充值面额列表
export const getFaceValueListAPI = (operator) => {
  return get('/topup/operator/faceValueList', {
    operator
  })
}

// 单次充值支付
// 入参：phoneNumber string 是 充值号码
//      operator string 是 运营商
//      amount string 是 充值金额
//      requestId string 是 请求幂等ID（内部自动生成）
// 出参：paymentId string 是 支付ID
//      orderId string 是 订单ID
export const oneTimePayAPI = (params) => {
  const { phoneNumber, operator, amount } = params;
  const requestId = uuid(); // 内部自动生成请求幂等ID
  return post('/topup/oneTime/pay', {
    phoneNumber,
    operator,
    amount,
    requestId
  })
}

// 查询单次充值结果
// 入参：orderId string 是 订单ID
// 出参：orderStatus string 是 支付状态
//          待支付：WAIT_PAY
//          待充值：WAIT_TOP_UP
//          完成：FINISH
//          异常：EXCEPTION
//      exceptionReason string 否 异常原因
export const getOneTimeStatusAPI = (orderId) => {
  return get('/topup/oneTime/status', {
    orderId
  })
}

// 获取周期签约信息
// 入参：无
// 出参：authURL string 是 授权URL
export const getRecurringAuthUrlAPI = () => {
  return get('/topup/recurring/authUrl')
}

// 开启周期充值
// 入参：phoneNumber string 是 充值号码
//      operator string 是 运营商
//      amount string 是 充值金额
//      recurringType string 是 周期类型 周：WEEK 月：MONTH
//      recurringDay string 是 周期日期
//      authCode string 是 签约授权码
// 出参：无
export const confirmRecurringAgreementAPI = (params) => {
  const { phoneNumber, operator, amount, recurringType, recurringDay, authCode } = params;
  return post('/topup/recurring/confirmAgreement', {
    phoneNumber,
    operator,
    amount,
    recurringType,
    recurringDay,
    authCode
  })
}

// 暂停周期充值
// 入参：agreementId string 是 合约ID
// 出参：无
export const pauseRecurringAPI = (agreementId) => {
  return post('/topup/recurring/pause', {
    agreementId
  })
}

// 编辑周期充值
// 入参：agreementId string 是 合约ID
//      amount string 是 充值金额
//      recurringType string 是 周期类型 周：WEEK 月：MONTH
//      recurringDay string 是 周期日期
// 出参：无
export const updateRecurringAPI = (params) => {
  const { agreementId, amount, recurringType, recurringDay } = params;
  return post('/topup/recurring/edit', {
    agreementId,
    amount,
    recurringType,
    recurringDay
  })
}

// 删除周期充值
// 入参：agreementUUID string 是 合约ID
// 出参：无
export const deleteRecurringAPI = (agreementUUID) => {
  return post('/topup/recurring/delete', {
    agreementUUID
  })
}

