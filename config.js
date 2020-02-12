export const organization = '河海大学计信院';

export const serverRoot = 'http://192.168.0.2:8000';

export const serverRouter = {
  code2token: serverRoot + '/auth/wechat-code2token/',
  getToken: serverRoot + '/auth/get-token/',
  wechatAuth: serverRoot + '/auth/wechat-auth/',
  currentUser: serverRoot + '/current-user/',

  activities: serverRoot + '/activities/',
  enrollments: serverRoot + '/enrollments/',
  meetingrooms: serverRoot + '/meetingrooms/',
  reservations: serverRoot + '/reservations/',
  repairs: serverRoot + '/repairs/',
  guides: serverRoot + '/guides/',
  contacts: serverRoot + '/contacts/',
  friends: serverRoot + '/friends/'
}
