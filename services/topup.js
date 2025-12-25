import {
  get
} from "../http/index";

// 查询充值面额列表
export const getFaceValueListAPI = (operator) => {
  return get('/topup/operator/faceValueList', {
    operator
  })
}

