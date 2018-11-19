
function checkMobile(num) {
  var re = /^1[3,4,5,7,8]\d{9}$/;
  return re.test(num);
}

function checkTelephone(num) {
  var phoneReg = /(^\+86\.\d{3,5}\d{6,8}$)|(^\d{3}((\d-)|(-\d)|\d|-)\d{3}(\d|-|)\d{3}$)/;
  return phoneReg.test(num);
}

function checkPhone(num) {
  return checkMobile(num) || checkTelephone(num);
}

module.exports = {
  checkMobile: checkMobile,
  checkTelephone: checkTelephone,
  checkPhone: checkPhone
}