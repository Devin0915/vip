import request from '@/utils/request'

export function login(data) {
  return request({
    // url: '/site/login',
    url: '/permission/user/login',
    method: 'post',
    data
  })
}

export function getWeb() {
  return request({
    // url: '/site/login',
    url: '/admin/store/getStore',
    method: 'post'
  })
}

export function getInfo(token, store_id, operator) {
  return request({
    // url: '/user/info',
    url: '/admin/user/info',
    method: 'post',
    params: { token, store_id, operator }
  })
}

export function logout() {
  return request({
    url: '/permission/user/logout',
    method: 'post'
  })
}

export function getSelectData(data){
  return request({
    url: '/common/dict/select',
    method: 'post',
    data:data
  })
}
