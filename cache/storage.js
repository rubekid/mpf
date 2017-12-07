/**
 *  本地缓存
 * Created by rubekid on 2017-08-11.
 */
const STORAGE_EXPIRE_MAP = 'STORAGE_EXPIRE_MAP'
var Storage = {
  /**
   * 获取缓存
   * @param key 键名
   * @returns {Object}
   */
  get: function (key) {
    try {
      return wx.getStorageSync(key)
    } catch (e) {}
    return  null
  },
  /**
   * 设置缓存
   * @param key 键名
   * @param value 键值
   * @param expire 有效时长（秒）
   */
  set: function (key, value, expire) {
    if (value !== null && value !== undefined) {
      try {
        wx.setStorageSync(key, value)
        if (expire && expire > 0){
          var expireAt = new Date().getTime() + expire * 1000
          addExpire(key, expireAt)
        }
      }
      catch(e){}
    }
  },
  /**
   * 移除
   * @param key
   */
  remove: function (key) {
    try {
      wx.removeStorageSync(key)
    } catch (e) {}
  },
  /**
   * 清理
   */
  clear: function () {
    wx.clearStorageSync();
  }
}

/**
 * 设置过期
 * @param key
 * @param expireAt
 */
function addExpire(key, expireAt) {
  var map = Storage.get(STORAGE_EXPIRE_MAP) || {}
  map[key] = expireAt
  Storage.set(STORAGE_EXPIRE_MAP, map)
}

/**
 * 清理过期
 */
function clearExpire (){
  var map = Storage.get(STORAGE_EXPIRE_MAP) || {}
  var now = new Date().getTime()
  for(var key in map){
    if (map[key] * 1 < now){
      Storage.remove(key)
      delete map[key]
    }
  }
  Storage.set(STORAGE_EXPIRE_MAP, map);
  console.log("clearExpire");
}

/**
 * 过期轮询
 */
setInterval(function(){
  clearExpire()
}, 60000)

module.exports = Storage;

