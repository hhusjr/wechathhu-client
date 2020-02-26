import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
const app = getApp()

Page({
  onLoad: function() {
    wx.showLoading({
      title: '获取密钥中...',
    });
    wx.login({
      success: function(login_res) {
        wx.request({
          url: config.serverRouter.code2token,
          method: 'POST',
          data: {
            code: login_res.code
          },
          success: function(res) {
            if (res.statusCode != 201 && res.statusCode != 200) {
              wx.redirectTo({
                url: '../user/login'
              });
              return;
            }
            app.globalData.token = res.data.token;
            R({
              url: config.serverRouter.currentUser,
              method: 'GET'
            }, function(userInfo) {
              userInfo = userInfo.data
              app.globalData.userInfo = {
                firstName: userInfo['first_name'],
                lastName: userInfo['last_name'],
                email: userInfo['email'],
                userName: userInfo['username'],
                department: userInfo['department']
              }
              wx.redirectTo({
                url: '../main/main'
              });
            });
          }
        });
      }
    });
  }
})