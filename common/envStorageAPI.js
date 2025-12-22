import { envConfig } from '/api/envConfig';

export default {
  envConfig,
  /**
   * @summary Distinguish local storage retrieval for different environments asynchronous
   * @param {string} key
   * @param {function} callback
   */
  getStorage(key, callback) {
    my.getStorage({
      key: `${this.envConfig.env}-${key}`,
      success(res) {
        if (callback) {
          callback(res.data);
        }
      },
    });
  },
  /**
   * @summary Distinguish local storage retrieval for different environments synchronize
   * @param {String} key
   */
  getStorageSync(key) {
    return my.getStorageSync({
      key: `${this.envConfig.env}-${key}`,
    }).data;
  },
  /**
   * @summary Distinguish local storage in different environments asynchronous
   * @param {*} key
   * @param {*} data
   */
  setStorage(key, data) {
    my.setStorage({
      key: `${this.envConfig.env}-${key}`,
      data,
    });
  },
  /**
   * Distinguish local storage in different environments synchronize
   * @param {*} key
   * @param {*} data
   */
  setStorageSync(key, data) {
    my.setStorageSync({
      key: `${this.envConfig.env}-${key}`,
      data,
    });
  },
  /**
   * @summary Distinguish local storage deletion for different environments asynchronous
   * @param {*} key
   * @param {*} callback
   */
  removeStorage(key, callback) {
    my.removeStorage({
      key: `${this.envConfig.env}-${key}`,
      success(res) {
        if (callback) {
          callback(res);
        }
      },
    });
  },
  /**
   * @summary Distinguish local storage deletion for different environments synchronize
   * @param {*} key
   */
  removeStorageSync(key) {
    my.removeStorageSync({
      key: `${this.envConfig.env}-${key}`
    });
  }
}