/**
 * Token管理
 */
import AuthEncrypt from './auth-encrypt'
import Storage from '../cache/storage'
import DateUtil from '../utils/date-util'

// token缓存
var tokenCacheKey = (global.APP_NAME || '') + '_USER_TOKEN'

// TOKEN 加密码秘钥
var SECRET_KEY = global.APP_SECRET_KEY || 'YT79jp64wJWqfvqY'

// 是否开启TOKEN加密
var TOKEN_ENCRYPT_ENABLE = global.TOKEN_ENCRYPT_ENABLE



var TokenManager = {
  // 获取token
  getToken: function () {
    return Storage.get(tokenCacheKey)
  },
  get: function () {
    var token = TokenManager.getToken()
    if (!token || DateUtil.isExpired(token.expires_at)) {
      token = null
      this.clear(tokenCacheKey)
    }
    //TokenManager.checkToken(token)
    return token
  },
  // 获取当前用户ID
  getUserId: function () {
    var token = this.get()
    if (token) {
      return token.user_id
    }
    return null
  },
  // 设置token
  set: function (token) {
    Storage.set(tokenCacheKey, token)
  },
  // 清理token
  clear: function () {
    Storage.remove(tokenCacheKey)
  },
  checkToken: function (token) {
    token = token || TokenManager.getToken();
    var needAutoLogin = false
    try {
      if (TokenManager.refreshLocked) {
        return
      }
      
      if (token) {
        var expireAt = DateUtil.toDate(token.expires_at)
        var remainTime = expireAt.getTime() - new Date().getTime()
        if (remainTime > 10 * 1000 && remainTime < 10 * 60 * 1000) { // 10 分钟
          //global.refreshToken();
        } else if (remainTime < 10000) {
          needAutoLogin = true
        }
      } else {
        needAutoLogin = true
      }
      if(needAutoLogin){
        global.login();
      }
    } catch (e) {
      console.log(e.message)
    }
    return !needAutoLogin;
  }
}

/**
 * 唤醒token检测
 */
var wakeUpTokenCheck = function () {
  var token = TokenManager.getToken()
  TokenManager.checkToken(token)
}

// 每分钟轮询
setInterval(function () {
  wakeUpTokenCheck()
}, 60000)

export default TokenManager
