import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    name: '获取中...',
    startTime: '获取中...',
    endTime: '获取中...',
    location: '获取中',
    limit: '获取中...',
    isParticipant: '获取中...',
    description: '获取中...',
    id: null,
    clockin: []
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '活动详情'
    });
    var self = this;
    R({
      url: config.serverRouter.activities + 'clockins/' + options.id + '/',
      method: 'GET'
    }, function (res) {
      self.setData({
        clockin: res.data
      })
    })
    R({
      url: config.serverRouter.activities + options.id + '/',
      method: 'GET'
    }, function (res) {
      res = res.data;
      self.setData({
        name: res.name,
        startTime: moment(res.time_start).format('YYYY-MM-DD HH:mm') + '，' + moment(res.time_start).fromNow(),
        endTime: moment(res.time_end).format('YYYY-MM-DD HH:mm') + '，' + moment(res.time_end).fromNow(),
        location: res.location,
        limit: res.participants_total_limit,
        isParticipant: res.my_enrollment_count > 0,
        description: res.description,
        enrollmentCount: res.enrollment_count,
        id: res.id
      });
    });
  }
})