import {
  get,
  post
} from "../http/index";

export const loginAPI = (authCode) => {
  return post("/topup/auth/notification", {
    authCode
  });
}

// 查询可充值国家
export const getNationListAPI = () => {
  return get("/topup/operator/nationList", {});
};

// 查询运营商列表
export const getOperatorListAPI = (phoneNumber) => {
  return post('/topup/operator/operatorList', {
    phoneNumber
  })
}

// 查询充值记录列表
export const getHistoryListAPI = (params) => {
  return get('/topup/history/list', params)
}

// 历史详情
export const getHistoryDetailAPI = (orderId) => {
  return get('/topup/history/detial', {
    orderId
  })
}