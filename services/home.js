import {
  post
} from "../http/index";
import {
  getLanguage
} from "../utils/util";

export const loginAPI = (authCode) => {
  return post(
    "/topup/auth/token", {
      authCode,
    }, {
      skipInterceptor: true,
      headers: {
        language: getLanguage(),
      },
    }
  );
};

export const getUserInfoAPI = () => {
  return post("/topup/auth/userInfo");
};

// 通知授权
// 入参：authCode string 是 授权码
// 出参：无
export const notificationAuthAPI = (authCode) => {
  return post("/topup/auth/notification", {
    authCode
  });
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

export const getOperatorAPI = (phoneNumber) => {
  return post("/topup/operator/queryOperator", {
    phoneNumber,
  }, {
    // skipInterceptor: true,
  });
};

// 查询充值记录列表
export const getHistoryListAPI = (params) => {
  return post("/topup/history/list", params);
};

// 历史详情
export const getHistoryDetailAPI = (orderId) => {
  return post("/topup/history/detail", {
    orderId,
  });
};

// 查询周期订单列表
export const getRecurringListAPI = (params) => {
  return post("/topup/recurring/list", params);
};