import HttpClient from "./request";
import {
  getGlobalData,
  setGlobalData
} from "@miniu/data";
import {
  loginAPI
} from "../services/index";

const {
  language
} = my.env;

let loginPromise = null;
const loginHandle = () => {
  // 如果正在登录，直接返回现有的 Promise，避免并发调用
  if (loginPromise) {
    return loginPromise;
  }

  // 创建新的登录 Promise
  loginPromise = new Promise((resolve, reject) => {
    my.getAuthCode({
      scopes: ["auth_base"],
      success: async (res) => {
        try {
          if (!res.authCode) {
            // 登录失败，清除 Promise 缓存并记录失败时间
            loginPromise = null;
            reject(new Error("获取授权码失败"));
            return;
          }
          my.showLoading()
          const result = await loginAPI(res.authCode);
          setGlobalData((g) => {
            g.userInfo = {
              ...result,
            };
          });
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          loginPromise = null;
          my.hideLoading()
        }
      },
      fail: () => {
        loginPromise = null;
        reject(new Error("获取授权码失败"));
      },
    });
  });

  return loginPromise;
};

// 创建单例实例
const http = new HttpClient();
http.addRequestInterceptor(async (config) => {
  try {
    let userInfo = getGlobalData((g) => g.userInfo);
    if (!userInfo || !userInfo.token) {
      // 等待登录完成（如果正在登录，会复用同一个 Promise）
      await loginHandle();
      userInfo = getGlobalData((g) => g.userInfo);
    }
    // 如果已有 token，直接添加到请求头
    config.headers = {
      ...config.headers,
      language,
      Authorization: `Bearer ${userInfo.token}`,
    };
    return config;
  } catch (error) {
    // 登录失败，阻止请求继续执行，避免死循环
    return Promise.reject(error);
  }
});
http.addResponseInterceptor((response) => {
  return response;
});
http.setStatusCodeHandler(200, (response) => {
  return response;
});
http.setStatusCodeHandler(401, (response) => {
  return response;
});

export const get = (url, params, options) => {
  return http.get(url, params, options);
};

export const post = (url, data, options) => {
  return http.post(url, data, options);
};