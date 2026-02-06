import HttpClient from "./request";
import {
  getGlobalData,
  setGlobalData
} from "@miniu/data";
import {
  loginAPI
} from "../services/index";
import {
  RB_TOKEN
} from "../utils/constant";
import { getLanguage, getUserTimezone, getClientId } from "../utils/util";


// Token 过期时间：30 分钟（毫秒）
const TOKEN_EXPIRE_TIME = 60 * 60 * 60 * 1000;

/**
 * 保存 token 和过期时间
 * @param {string} token 
 */
const setToken = (token) => {
  const expireTime = Date.now() + TOKEN_EXPIRE_TIME;
  const tokenData = {
    token,
    expireTime
  };
  try {
    my.setStorageSync({
      key: RB_TOKEN,
      data: tokenData
    });
  } catch (error) {
    console.error('保存 token 失败:', error);
  }
};

/**
 * 获取 token，如果过期则返回 null
 * @returns {string|null}
 */
const getStoredToken = () => {
  try {
    const storageResult = my.getStorageSync({
      key: RB_TOKEN
    });

    if (!storageResult || !storageResult.data) {
      return null;
    }

    const tokenData = storageResult.data;
    const {
      token,
      expireTime
    } = tokenData;

    // 检查是否过期
    if (!expireTime || Date.now() > expireTime) {
      // 已过期，清除存储
      my.removeStorageSync({
        key: RB_TOKEN
      });
      return null;
    }

    return token;
  } catch (error) {
    console.error('获取 token 失败:', error);
    return null;
  }
};

/**
 * 清除存储的 token
 */
const clearToken = () => {
  try {
    my.removeStorageSync({
      key: RB_TOKEN
    });
    setGlobalData((g) => {
      g.userInfo = {};
    });
  } catch (error) {
    console.error('清除 token 失败:', error);
  }
};

/**
 * 获取有效的 token，如果过期则重新获取
 * @returns {Promise<string>}
 */
const getToken = async () => {
  // 先从本地存储获取 token
  let token = getStoredToken();

  if (!token) {
    // 本地没有 token 或已过期，需要重新获取
    let userInfo = getGlobalData((g) => g.userInfo);

    if (!userInfo || !userInfo.token) {
      // 等待登录完成（如果正在登录，会复用同一个 Promise）
      await loginHandle();
      userInfo = getGlobalData((g) => g.userInfo);
    }

    if (userInfo && userInfo.token) {
      token = userInfo.token;
      // 保存新的 token 和过期时间
      setToken(token);
    }
  }

  return token;
}

let loginPromise = null;
const loginHandle = () => {
  // 如果正在登录，直接返回现有的 Promise，避免并发调用
  if (loginPromise) {
    return loginPromise;
  }

  // 创建新的登录 Promise
  loginPromise = new Promise((resolve, reject) => {
    const lang = getGlobalData(g => g.lang)
    my.showLoading();
    my.getAuthCode({
      scopes: ["auth_user"],
      success: async (res) => {
        try {
          if (!res.authCode) {
            // 登录失败，清除 Promise 缓存并记录失败时间
            loginPromise = null;
            reject(new Error(lang.system.authCodeFail));
            return;
          }
          const result = await loginAPI(res.authCode);
          const {
            data
          } = result || {}
          setGlobalData((g) => {
            g.userInfo = {
              ...data,
            };
          });

          // 登录成功后，保存 token 和过期时间
          if (data && data.token) {
            setToken(data.token);
          }

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          loginPromise = null;
          my.hideLoading()
        }
      },
      fail: (err) => {
        loginPromise = null;
        my.hideLoading()
        reject(new Error(lang.system.authCodeFail));
      }
    });
  });

  return loginPromise;
};

// 创建单例实例
const http = new HttpClient();
http.addRequestInterceptor(async (config) => {
  try {
    // 使用 getToken 获取有效的 token（会自动处理过期）
    const token = await getToken();

    if (!token) {
      return Promise.reject(new Error('获取 token 失败'));
    }

    // 将 token 和其他必要参数添加到请求头
    config.headers = {
      ...config.headers,
      language: getLanguage(),
      Authorization: token,
      userTimezone: getUserTimezone(),
      clientId: getClientId(),
    };
    return config;
  } catch (error) {
    // 登录失败，阻止请求继续执行，避免死循环
    return Promise.reject(error);
  }
});
http.addResponseInterceptor(async (response, config) => {
  if (response.status !== 200) {
    return Promise.reject(new Error('network error'))
  }
  const {
    code,
    message
  } = response.data || {}
  
  // 处理 token 无效的情况（状态码 1103）
  if (+code === 1103) {
    // 清除旧的 token
    clearToken();
    
    // 如果已经重试过，不再重试，避免无限循环
    if (config._retryCount) {
      const showToast = config.showToast !== false;
      if (showToast) {
        my.showToast({
          content: message || 'Token 无效，请重新登录'
        })
      }
      return Promise.reject(new Error(message || 'Token 无效，请重新登录'))
    }
    
    // 标记为重试，避免无限循环
    config._retryCount = 1;
    
    try {
      // 重新获取 token
      await loginHandle();
      
      // 重新获取 token 并更新请求头
      const token = await getToken();
      if (!token) {
        const showToast = config.showToast !== false;
        if (showToast) {
          my.showToast({
            content: '重新获取 token 失败'
          })
        }
        return Promise.reject(new Error('重新获取 token 失败'))
      }
      
      // 更新请求配置中的 Authorization header
      config.headers = {
        ...config.headers,
        language: getLanguage(),
        Authorization: token,
      };
      
      // 重新发起请求
      return http.request(config);
    } catch (error) {
      const showToast = config.showToast !== false;
      if (showToast) {
        my.showToast({
          content: '重新获取 token 失败'
        })
      }
      return Promise.reject(error);
    }
  }
  
  if (+code === 403) {
    clearToken();
  }
  if (+code !== 200) {
    // 检查 showToast 配置，默认为 true
    // 只有当 showToast 明确设置为 false 时才不显示 toast
    // 如果 showToast 是 undefined，默认为 true；如果是 false，则不显示；其他值都显示
    const shouldShowToast = config.showToast === false ? false : true;
    if (shouldShowToast) {
      my.showToast({
        content: message
      })
    }
  }
  return response.data;
});

export const get = (url, params, options) => {
  return http.get(url, params, options);
};

export const post = (url, data, options) => {
  // return http.post(url, data, { ...options, skipInterceptor: true });
  return http.post(url, data, options);
};