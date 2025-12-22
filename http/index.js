import HttpClient from "./request";

// 创建单例实例
const http = new HttpClient();
http.addRequestInterceptor((config) => {
  return config;
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
