import {
  post
} from "../http/index";
import { uuid } from "../utils/uuid";

// 查询充值面额列表
export const getFaceValueListAPI = (operator) => {
  return post('/topup/operator/faceValueList', {
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
  const requestId = uuid(); // 内部自动生成请求幂等ID

  return post('/topup/oneTime/pay', {
    ...params,
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
  return post('/topup/oneTime/status', {
    orderId
  })
}

// 获取周期签约信息
// 入参：agreedAmount object 否 授权金额 {currency: "EUR", value: "1000"} value为欧分
//      phoneNumber string 是 充值号码
//      recurringType string 是 周期类型 周：WEEK 月：MONTH
//      recurringDay string 是 周期日期
// 出参：contractStatus string 是 签约状态
//           VALID("VALID"), // 有效，直接调用后续签约接口confirmAgreement
//           INVALID("INVALID"), // 无效，返回authUrl拉起签约页面
//      authUrl string 否 授权URL（contractStatus为INVALID时返回）
export const getRecurringAuthUrlAPI = (params) => {
  return post('/topup/recurring/authUrl', params)
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
  // const { phoneNumber, operator, amount, recurringType, recurringDay, authCode } = params;
  return post('/topup/recurring/confirmAgreement', params)
}

// 暂停周期充值
// 入参：agreementId string 是 合约ID
//      status string 是 状态 
//      ACTIVE 启用
//      PAUSED 暂停
//      DELETED 删除
// 出参：无
export const changeRecurringStatusAPI = (agreementId,status) => {
  return post('/topup/recurring/changeStatus', {
    agreementId,
    status
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

