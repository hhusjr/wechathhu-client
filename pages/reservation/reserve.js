import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    peopleCount: null,
    length: null,
    location: null,
    label: null,
    date: '',
    timeFrom: '',
    timeTo: '',
    today: '',
    end: '',
    showQueryForm: true,
    availableMeetingrooms: {},
    locations: [],
    chosenLocation: null,
    isShowing: {},
    reason: '',
    confirmReserve: false
  },

  inputPeopleCount: function (e) {
    this.setData({
      peopleCount: e.detail.value
    });
  },
  inputLabel: function (e) {
    this.setData({
      label: e.detail.value
    });
  },
  inputLocation: function (e) {
    this.setData({
      location: e.detail.value
    });
  },
  inputLength: function (e) {
    this.setData({
      length: e.detail.value
    });
  },
  onFromTimeChange: function (e) {
    this.setData({
      timeFrom: e.detail.value
    })
  },
  onToTimeChange: function (e) {
    this.setData({
      timeTo: e.detail.value
    })
  },
  onDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '会议室预约'
    });
    var date = new Date();
    this.setData({
      today: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay()
    });

    let list = [{}];
    for (let i = 0; i < 26; i++) {
      list[i] = {};
      list[i].name = String.fromCharCode(65 + i);
      list[i].id = i;
    }
    this.setData({
      list: list,
      listCur: list[0]
    })
  },
  doShowMeetingrooms: function (options) {
    var self = this
    if (!this.data.peopleCount || !this.data.date || !this.data.timeFrom || !this.data.timeTo) {
      wx.showToast({
        title: '请完整填写必填字段。',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      title: '查询中...',
    });
    var params = {};
    if (this.data.label) params['label'] = this.data.label;
    if (this.data.length) params['length'] = this.data.length;
    if (this.data.location) params['location'] = this.data.location;
    params['people_count'] = this.data.peopleCount;
    params['time_from'] = moment(this.data.date + ' ' + this.data.timeFrom).format();
    params['time_to'] = moment(this.data.date + ' ' + this.data.timeTo).format();
    wx.showLoading({
      title: '查询中...'
    });
    R({
      url: config.serverRouter.meetingrooms + 'available/',
      method: 'GET',
      data: params
    }, function (res) {
      var availableMeetingrooms = {}
      var locations = []

      var data = res.data

      if (!(data.length)) {
        wx.showToast({
          title: '该条件下无可用会议室',
          icon: 'none'
        })
        return
      }

      var tmp
      for (var meta of data) {
        locations.push(meta.location)
        availableMeetingrooms[meta.location] = []
        for (var meetingroom of meta.meetingrooms) {
          tmp = {
            id: meetingroom.id,
            info: {
              name: meetingroom.info.name,
              location: meetingroom.info.location,
              seatsCount: meetingroom.info.seats_count,
              label: meetingroom.info.label,
              description: meetingroom.info.description
            },
            choices: []
          }
          for (var choice of meetingroom.choices) {
            tmp.choices.push({
              display: {
                timeFrom: moment(choice[0]).format('HH:mm'),
                timeTo: moment(choice[1]).format('HH:mm')
              },
              raw: {
                timeFrom: choice[0],
                timeTo: choice[1]
              }
            })
          }
          availableMeetingrooms[meta.location].push(tmp)
        }
      }

      self.setData({
        availableMeetingrooms: availableMeetingrooms,
        chosenLocation: locations[0],
        locations: locations,
        showQueryForm: false
      })

      wx.hideLoading()
    }, function (res) {
      wx.hideLoading();
      wx.showToast({
        title: res.data['detail'],
        icon: 'none'
      });
    });
  },

  tabSelect: function (e) {
    this.setData({
      chosenLocation: e.currentTarget.dataset.location,
      isShowing: {}
    })
  },

  goBack: function (e) {
    this.setData({
      isShowing: {},
      showQueryForm: true
    })
  },

  toggleShowing: function (e) {
    var index = e.currentTarget.dataset.index
    this.data.isShowing[index] = this.data.isShowing[index] ? false : true
    this.setData({
      isShowing: this.data.isShowing
    })
  },

  inputReason: function (e) {
    this.setData({
      reason: e.detail.value
    })
  },

  chooseMeetingroom: function (e) {
    var self = this

    if (!self.data.reason) {
      wx.showToast({
        title: '请输入预约原因',
        icon: 'none'
      })
      return
    }

    var location = this.data.chosenLocation
    var meetingroomIndex = e.currentTarget.dataset.meetingroom
    var choiceIndex = e.currentTarget.dataset.choice

    var meetingroomId = this.data.availableMeetingrooms[location][meetingroomIndex].id
    var reserveFrom = this.data.availableMeetingrooms[location][meetingroomIndex].choices[choiceIndex].raw.timeFrom
    var reserveTo = this.data.availableMeetingrooms[location][meetingroomIndex].choices[choiceIndex].raw.timeTo

    wx.showLoading({
      title: '预约中',
      mask: true
    })

    R({
      url: config.serverRouter.reservations,
      method: 'POST',
      data: {
        'meetingroom_object': meetingroomId,
        'reserve_from': reserveFrom,
        'reserve_to': reserveTo,
        'description': self.data.reason
      }
    }, function () {
      wx.hideLoading()
      wx.showToast({
        title: '预约成功',
        mask: true,
        duration: 2000
      })
      setTimeout(function () {
        wx.redirectTo({
          url: 'my',
        })
      }, 2000)
    }, function () {
      wx.showToast({
        title: '会议室在该时间段已经被占用',
        mask: true,
        icon: 'none',
        duration: 2000
      })
      setTimeout(function () {
        self.goBack()
      }, 2000)
    }, function () {
      self.setData({
        confirmReserve: false
      })
    })
  },

  confirmReserve: function (e) {
    this.setData({
      confirmReserve: true,
      choiceIndex: e.currentTarget.dataset.choice,
      meetingroomIndex: e.currentTarget.dataset.meetingroom
    })
  },

  hideConfirmReserve: function () {
    this.setData({
      confirmReserve: false
    })
  }
})