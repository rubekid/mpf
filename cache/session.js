/**
 *  Session
 * Created by rubekid on 2017-09-22.
 */

const SESSION_PREFIX = 'SESSION_';
const SESSION_LIST = 'SESSION_LIST';
var Session = {
  /**
   * 获取
   * @param key 键名
   * @returns {Object}
   */
  get: function (key) {
    try {
      return wx.getStorageSync(SESSION_PREFIX + key)
    } catch (e) { }
    return null
  },
  /**
   * 设置
   * @param key 键名
   * @param value 键值
   */
  set: function (key, value) {
    if (value !== null && value !== undefined) {
      try {
        var _key = SESSION_PREFIX + key;
        wx.setStorageSync(_key, value)
        appendSession(_key);
      }
      catch (e) { }
    }
  },
  /**
   * 移除
   * @param key
   */
  remove: function (key) {
    try {
      wx.removeStorageSync(SESSION_PREFIX + key)
    } catch (e) { }
  },
  /**
   * 清理
   */
  clear: function () {
    clearSession()
  }
}

/**
 * 设置过期
 * @param key
 * @param expireAt
 */
function appendSession(key) {
  try {
    var list = wx.getStorageSync(SESSION_LIST) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] === key) {
        return;
      }
    }
    list.push(key);
    wx.setStorageSync(SESSION_LIST, list)
  } catch (e) { }
  
}


/**
 * 清理过期
 */
function clearSession() {
  try {
    var list = wx.getStorageSync(SESSION_LIST) || [];
    for (var i = 0; i < list.length; i++) {
      wx.removeStorageSync(list[i])
    }
    wx.removeStorageSync(SESSION_LIST);
  } catch (e) { }
 
 
}

module.exports = Session

