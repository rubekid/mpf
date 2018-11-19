/**
 * 数组工具类
 */

var ArrayUtil = {}

/**
 * 是否在数组中
 */
ArrayUtil.inArray = (value, array) => {
  for(var i =0; i<array.length; i++){
    if(array[i] == value){
      return i;
    }
  }
  return -1;
}

module.exports = ArrayUtil
