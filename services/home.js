import {
  get,
  post
} from "../http/index";

export const loginAPI = (authCode) => {
  return post(
    "/topup/auth/token", {
      authCode,
    }, {
      skipInterceptor: true,
    }
  );
};

export const getUserInfoAPI = () => {
  return post("/topup/auth/userInfo");
};

// 查询可充值国家
export const getNationListAPI = () => {
  return post("/topup/operator/nationList", {}, {
    // skipInterceptor: true,
  });
};

// 查询运营商列表
export const getOperatorListAPI = (phoneNumber) => {
  return post("/topup/operator/operatorList", {
    phoneNumber,
  }, {
    // skipInterceptor: true,
  });
};

// 查询充值记录列表
export const getHistoryListAPI = (params) => {
  return get("/topup/history/list", params);
};

// 历史详情
export const getHistoryDetailAPI = (orderId) => {
  return get("/topup/history/detial", {
    orderId,
  });
};

// 查询周期订单列表
export const getRecurringListAPI = (params) => {
  return post("/topup/recurring/list", params);
};