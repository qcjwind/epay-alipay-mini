import {
  BASE_URL
} from "../utils/constant";

/**
 * HTTP 请求封装类
 * 基于支付宝小程序 my.request API
 */
export default class HttpClient {
  constructor() {
    // 基础配置
    this.config = {
      baseURL: BASE_URL,
      timeout: 10000, // 默认 10 秒
      headers: {
        "content-type": "application/json",
      },
    };

    // 请求拦截器队列
    this.requestInterceptors = [];
    // 响应拦截器队列
    this.responseInterceptors = [];

    // 状态码处理映射
    this.statusCodeHandlers = {
      200: null, // 成功，不处理
      401: (response) => {
        // 未授权，可以在这里处理登录跳转等
        console.warn("未授权，状态码：401", response);
      },
      403: (response) => {
        // 禁止访问
        console.warn("禁止访问，状态码：403", response);
      },
      404: (response) => {
        // 资源不存在
        console.warn("资源不存在，状态码：404", response);
      },
      500: (response) => {
        // 服务器错误
        console.error("服务器错误，状态码：500", response);
      },
    };
  }

  /**
   * 设置基础配置
   * @param {Object} config 配置对象
   * @param {string} config.baseURL 基础 URL
   * @param {number} config.timeout 超时时间（毫秒）
   * @param {Object} config.headers 默认请求头
   */
  setConfig(config) {
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...(config.headers || {}),
      },
    };
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor 拦截器函数，接收 config 参数，返回处理后的 config 或 Promise
   */
  addRequestInterceptor(interceptor) {
    if (typeof interceptor === "function") {
      this.requestInterceptors.push(interceptor);
    }
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor 拦截器函数，接收 response 参数，返回处理后的 response 或 Promise
   */
  addResponseInterceptor(interceptor) {
    if (typeof interceptor === "function") {
      this.responseInterceptors.push(interceptor);
    }
  }

  /**
   * 设置状态码处理器
   * @param {number} statusCode HTTP 状态码
   * @param {Function} handler 处理函数，接收 response 参数
   */
  setStatusCodeHandler(statusCode, handler) {
    this.statusCodeHandlers[statusCode] = handler;
  }

  /**
   * 执行请求拦截器
   * @param {Object} config 请求配置
   * @returns {Promise<Object>} 处理后的配置
   */
  async executeRequestInterceptors(config) {
    let processedConfig = {
      ...config
    };

    for (const interceptor of this.requestInterceptors) {
      const result = interceptor(processedConfig);
      if (result instanceof Promise) {
        processedConfig = await result;
      } else if (result !== undefined) {
        processedConfig = result;
      }
    }

    return processedConfig;
  }

  /**
   * 执行响应拦截器
   * @param {Object} response 响应对象
   * @returns {Promise<Object>} 处理后的响应
   */
  async executeResponseInterceptors(response) {
    let processedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      const result = interceptor(processedResponse);
      if (result instanceof Promise) {
        processedResponse = await result;
      } else if (result !== undefined) {
        processedResponse = result;
      }
    }

    return processedResponse;
  }

  /**
   * 处理状态码
   * @param {Object} response 响应对象
   */
  handleStatusCode(response) {
    const statusCode = response.status || response.statusCode;
    const handler = this.statusCodeHandlers[statusCode];

    if (handler && typeof handler === "function") {
      handler(response);
    }
  }

  /**
   * 构建完整的 URL
   * @param {string} url 请求 URL
   * @returns {string} 完整 URL
   */
  buildURL(url) {
    if (!url) {
      return this.config.baseURL;
    }

    // 如果已经是完整 URL，直接返回
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // 拼接 baseURL
    const baseURL = this.config.baseURL || "";
    if (!baseURL) {
      return url;
    }

    // 确保 baseURL 以 / 结尾，url 不以 / 开头
    const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
    const path = url.startsWith("/") ? url : `/${url}`;

    return `${base}${path}`;
  }

  /**
   * 核心请求方法
   * @param {Object} options 请求选项
   * @returns {Promise} 请求 Promise
   */
  request(options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // 合并配置
        let config = {
          url: options.url || "",
          method: options.method || "GET",
          data: options.data || {},
          headers: {
            ...this.config.headers,
            ...(options.headers || {}),
          },
          timeout: options.timeout || this.config.timeout,
          dataType: options.dataType || "json",
          ...options,
        };

        // 构建完整 URL
        config.url = this.buildURL(config.url);

        // 执行请求拦截器
        config = await this.executeRequestInterceptors(config);

        // 发起请求
        my.request({
          ...config,
          success: async (response) => {
            try {
              this.handleStatusCode(response);
              // 执行响应拦截器
              const processedResponse = await this.executeResponseInterceptors(
                response
              );

              // 根据状态码决定 resolve 还是 reject
              const statusCode =
                processedResponse.status || processedResponse.statusCode;
              if (statusCode >= 200 && statusCode < 300) {
                resolve(processedResponse);
              } else {
                reject(processedResponse);
              }
            } catch (error) {
              reject(error);
            }
          },
          fail: (error) => {
            // 执行响应拦截器处理错误
            this.executeResponseInterceptors(error)
              .then((processedError) => {
                reject(processedError);
              })
              .catch((err) => {
                reject(err);
              });
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * GET 请求
   * @param {string} url 请求 URL
   * @param {Object} params 请求参数（会转换为 query string）
   * @param {Object} options 其他请求选项
   * @returns {Promise} 请求 Promise
   */
  get(url, params = {}, options = {}) {
    // 将 params 转换为 query string
    const queryString = Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");

    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this.request({
      url: fullUrl,
      method: "GET",
      ...options,
    });
  }

  /**
   * POST 请求
   * @param {string} url 请求 URL
   * @param {Object} data 请求体数据
   * @param {Object} options 其他请求选项
   * @returns {Promise} 请求 Promise
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: "POST",
      data,
      ...options,
    });
  }
}