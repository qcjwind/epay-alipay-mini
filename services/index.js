import http from "../http";

export const getUserInfo = () => {
  return http.get("/user/info");
};