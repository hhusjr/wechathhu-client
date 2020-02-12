import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    tabs: ['活动列表', '我报名的'],
    activeIndex: 0,
    activities: [],
    inputShowed: false,
    inputVal: '',
    queryParams: {},
    loaded: false
  },

  tabClick: function (e) {
    this.setData({
      activeIndex: e.currentTarget.id
    });

    var mapping = {
      0: 'no',
      1: 'yes'
    };

    this.data.queryParams['my'] = mapping[e.currentTarget.id];
    this.setData({
      queryParams: this.data.queryParams
    });
    this.queryList();
  },

  onLoad: function (options) {
    this.queryList();
  },

  queryList: function () {
    this.setData({
      loaded: false
    });
    var self = this;
    var params = self.data.queryParams;
    R({
      url: config.serverRouter.activities,
      method: 'GET',
      data: params
    }, function (res) {
      self.data.activities = []
      var results = res.data.results;
      for (var result of results) {
        self.data.activities.push({
          name: result.name,
          startTime: moment(result.time_start).format('MMMMDoHH时mm分') + '，' + moment(result.time_start).fromNow(),
          endTime: moment(result.time_end).format('MMMMDoHH时mm分') + '，' + moment(result.time_end).fromNow(),
          isParticipant: result.my_enrollment_count > 0,
          enrollmentCount: result.enrollment_count,
          limit: result.participants_total_limit,
          id: result.id
        });
      }
      self.setData({
        activities: self.data.activities,
        loaded: true
      });
    });
  },

  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputShowed: false
    });
    this.clearInput();
  },
  clearInput: function () {
    delete this.data.queryParams['search'];
    this.setData({
      inputVal: '',
      queryParams: this.data.queryParams
    });
    this.queryList();
  },
  inputTyping: function (e) {
    this.data.queryParams['search'] = e.detail.value;
    this.setData({
      inputVal: e.detail.value,
      queryParams: this.data.queryParams
    });
    this.queryList();
  }
})