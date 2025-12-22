import { get, post } from "../http/index";

export const getUserInfo = (params) => {
  return get("/user/info", params);
};
