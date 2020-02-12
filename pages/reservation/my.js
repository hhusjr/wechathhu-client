import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    reservations: []
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '会议室预约'
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var self = this
    R({
      url: config.serverRouter.reservations,
      method: 'GET'
    }, function (res) {
      var reservations = []
      for (var reservation of res.data.results) {
        reservations.push({
          id: reservation.id,
          reserveFrom: moment(reservation.reserve_from).format('YYYY-MM-DD HH:mm'),
          reserveTo: moment(reservation.reserve_to).format('YYYY-MM-DD HH:mm'),
          meetingroom: reservation.meetingroom.name,
          location: reservation.meetingroom.location,
          seatsCount: reservation.meetingroom.seats_count,
          description: reservation.description
        })
      }
      self.setData({
        reservations: reservations
      })
      wx.hideLoading()
    })
  },

  cancelReservation: function (e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    var self = this
    wx.showModal({
      title: '提示',
      content: '确定取消预约吗？',
      success: function (res) {
        if (!res.confirm) return
        wx.showLoading({
          title: '解约中...',
          mask: true
        })
        R({
          url: config.serverRouter.reservations + id + '/',
          method: 'DELETE'
        }, function (res) {
          wx.hideLoading()
          self.data.reservations.splice(index, 1)
          self.setData({
            reservations: self.data.reservations
          })
        })
      }
    })
  }
})