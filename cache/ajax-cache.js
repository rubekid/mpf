/**
 *  Ajax缓存
 * Created by rubekid on 2017-08-11.
 */
const PREFIX = 'AJAX_CACHE:';
var AjaxCache = {
  get: function (key) {
    try{
      key = PREFIX + key
      var value = wx.getStorageSync(key)
    }
    catch(e){}
    return null
  },
  set: function (key, value) {
    if (value !== null && value !== undefined) {
      try {
        key = PREFIX + key
        wx.setStorageSync(key, value);
      }
      catch (e) { }
    }
  },
  remove: function (key) {
    try {
      key = PREFIX + key
      wx.removeStorageSync(key)
    } catch (e) { }
  },
  clear: function () {
    var res = wx.getStorageInfoSync()
    var removeKeys = []
    for (var i = 0; i < res.keys.length; i++) {
      var key = res.keys[i];
      if (key.indexOf(PREFIX) === 0) {
        wx.removeStorageSync(key);
      }
    }
  }
}

module.exports  = AjaxCache

