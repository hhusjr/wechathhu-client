import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    peopleCount: null,
    date: '',
    showSelectMeetingroom: false,
    fromTime: '06:00',
    toTime: '23:00',
    chosenMeetingroom: null,
    chosenTime: {},
    reserveFrom: '',
    reserveTo: '',
    reserveFromDisplay: '',
    reserveToDisplay: '',
    isChosen: false
  },

  inputPeopleCount: function (e) {
    this.setData({
      peopleCount: e.detail.value
    });
  },

  onDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.clearChosen()
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '会议室预约'
    });
    var today = moment().format('YYYY-MM-DD')
    this.setData({
      today: today,
      date: today
    });
  },

  selectMeetingroom: function () {
    var params = {}
    if (this.data.peopleCount) params['people_count'] = this.data.peopleCount

    if (!this.data.date) {
      wx.showToast({
        title: '开会日期是必填项',
        icon: 'none'
      })
      return
    }

    var fromTime = moment(this.data.date + ' 00:00:00')
    var toTime = moment(this.data.date + ' 23:59:59')
    params['query_from'] = fromTime.utc().format()
    params['query_to'] = toTime.utc().format()

    var self = this

    wx.showLoading({
      title: '正获取会议室',
      mask: true
    })

    R({
      url: config.serverRouter.meetingrooms + 'available/',
      method: 'GET',
      data: params
    }, function (res) {
      var data = res.data
      var meetingrooms = []
      var index = 0
      var fromTime = moment(self.data.date + ' ' + self.data.fromTime)
      var toTime = moment(self.data.date + ' ' + self.data.toTime)
      var time = moment(self.data.date + ' ' + self.data.fromTime)
      var timelineTmp = {}
      var index = 0
      var timeline = []
      while (time.isBefore(toTime)) {
        var formatted = time.format('HH:mm')
        timelineTmp[formatted] = {
          time: formatted,
          reserved: false,
          index: index++
        }
        timeline.push(formatted)
        time.add(30, 'm')
      }
      self.data.timeline = timeline
      self.data.meetingroomInfos = []
      for (var meetingroom of data) {
        var timeline = JSON.parse(JSON.stringify(timelineTmp))
        for (var reservation of meetingroom.reservations) {
          var time = moment(reservation.time_range[0])
          var final = moment(reservation.time_range[1])
          while (time.isBefore(final)) {
            var formatted = time.format('HH:mm')
            if (!(formatted in timeline) || time.isBefore(fromTime) || time.isAfter(toTime)) {
              time.add(30, 'm')
              continue
            }
            timeline[formatted].reserved = {
              reserveUser: reservation.reserve_user,
              contact: reservation.contact,
              reserveFrom: reservation.time_range[0],
              reserveTo: reservation.time_range[1],
              description: reservation.description
            }
            time.add(30, 'm')
          }
        }

        var timelineArr = []
        for (var key in timeline) {
          timelineArr.push(timeline[key])
        }

        timelineArr.sort(function (a, b) {
          return a.index - b.index
        })

        meetingrooms.push({
          id: meetingroom.meetingroom.id,
          name: meetingroom.meetingroom.name,
          seatsCount: meetingroom.meetingroom.seats_count,
          timeline: timelineArr
        })
        self.data.meetingroomInfos[meetingroom.meetingroom.id] = {
          id: meetingroom.meetingroom.id,
          name: meetingroom.meetingroom.name,
          seatsCount: meetingroom.meetingroom.seats_count
        }
      }

      if (!meetingrooms.length) {
        wx.hideLoading()
        wx.showToast({
          title: '该条件下无可用会议室',
          icon: 'none'
        })
        return
      }

      self.setData({
        showSelectMeetingroom: true,
        meetingrooms: meetingrooms
      }, function () {
        wx.hideLoading()
      })
    })
  },

  hideModal: function () {
    this.setData({
      showSelectMeetingroom: false
    })
  },

  toggleState: function (option) {
    var meetingroomId = option.currentTarget.dataset.meetingroom
    var meetingroomName = option.currentTarget.dataset.meetingroomName
    var timePoint = option.currentTarget.dataset.timePoint
    if (meetingroomId == this.data.chosenMeetingroom) {
      var state = this.data.chosenTime[timePoint] ? false : true
      this.setData({
        ['chosenTime.' + timePoint]: state
      })
      return
    }
    var chosenTime = {
      [timePoint]: true
    }
    this.setData({
      chosenTime: chosenTime,
      chosenMeetingroom: meetingroomId,
      chosenMeetingroomName: meetingroomName
    })
  },

  confirmModal: function () {
    var max = -1
    var min = -1
    var len = 0
    for (var index in this.data.chosenTime) {
      index = parseInt(index)
      if (!this.data.chosenTime[index]) continue;
      len++
      if (max == -1 || index > max) max = index;
      if (min == -1 || index < min) min = index;
    }
    if (max - min + 1 != len) {
      wx.showToast({
        title: '请选择一个连续区间',
        icon: 'none'
      })
      return
    }
    var reserveFrom = moment(this.data.date + ' ' + this.data.timeline[min])
    var reserveTo = moment(this.data.date + ' ' + this.data.timeline[max]).add(30, 'm')

    this.setData({
      reserveFromDisplay: reserveFrom.format('HH:mm'),
      reserveToDisplay: reserveTo.format('HH:mm'),
    })

    this.setData({
      reserveFrom: reserveFrom.utc().format(),
      reserveTo: reserveTo.utc().format(),
      isChosen: true,
      showSelectMeetingroom: false
    })
  },

  showReserveInfo: function (option) {
    var reserveInfo = option.currentTarget.dataset.reserve
    var meetingroomName = option.currentTarget.dataset.meetingroomName
    var contact = reserveInfo.contact
    wx.showModal({
      title: meetingroomName + '预约情况',
      showCancel: true,
      content: reserveInfo.reserveUser + '已预约' + moment(reserveInfo.reserveFrom).format('HH:mm') + '到' + moment(reserveInfo.reserveTo).format('HH:mm') + '，原因是：“' + reserveInfo.description + '”。' + (contact ? '是否立即电话协商？' : ''),
      success: function (res) {
        if (!res.confirm || !contact) return
        wx.makePhoneCall({
          phoneNumber: contact,
        })
      }
    })
  },

  clearChosen: function () {
    this.setData({
      chosenMeetingroom: null,
      chosenTime: {},
      chosenMeetingroomName: null,
      isChosen: false
    })
  },

  doReserve: function () {
    var self = this
    
    if (!this.data.isChosen) {
      wx.showToast({
        title: '请先选择会议时间地点',
        icon: 'none'
      })
      return
    }
    var description = this.data.description
    if (!description) {
      wx.showToast({
        title: '请填写预约原因',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认预约',
      content: '您确认要预约吗？',
      showCancel: true,
      success: function (res) {
        if (!res.confirm) return

        wx.showLoading({
          title: '预约中',
        })

        R({
          url: config.serverRouter.reservations,
          method: 'POST',
          data: {
            'reserve_from': self.data.reserveFrom,
            'reserve_to': self.data.reserveTo,
            'description': self.data.description,
            'meetingroom_object': self.data.chosenMeetingroom
          }
        }, function (res) {
          wx.hideLoading()
          self.clearChosen()
          wx.showModal({
            title: '消息提示',
            showCancel: false,
            content: '预约成功！',
            success: function () {
              wx.redirectTo({
                url: 'my',
              })
            }
          })
        }, function (res) {
          wx.hideLoading()
          self.clearChosen()
          wx.showToast({
            title: res.data.non_field_errors[0],
            icon: 'none'
          })
        })
      }
    })
  },

  inputDescription: function (e) {
    this.setData({
      description: e.detail.value
    })
  }
})