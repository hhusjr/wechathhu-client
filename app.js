import * as config from 'config.js';
import moment from 'utils/moment.js'

//app.js
App({
  onLaunch: function () {
    moment.locale('zh-cn');
  },
  globalData: {
    token: null,
    userInfo: null
  }
})