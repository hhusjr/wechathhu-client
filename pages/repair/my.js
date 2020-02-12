import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    repairs: [],
    statusColor: {
      0: 'blue',
      1: 'red',
      2: 'green'
    },
    statusText: {
      0: '未受理',
      1: '处理中',
      2: '已解决'
    }
  },

  onLoad: function (options) {
    var self = this
    wx.setNavigationBarTitle({
      title: '故障报修'
    });
    R({
      url: config.serverRouter.repairs,
      method: 'GET'
    }, function (res) {
      self.setData({
        repairs: res.data.results
      })
    })
  }
})