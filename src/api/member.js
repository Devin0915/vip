import request from '@/utils/request'
// 获取数据
export function getList(data) {
  return request({
    url: '/admin/customer/list',
    method: 'post',
    data
  })
}

// 获取row用户信息
export function getCustomerList(data) {
  return request({
    url: '/admin/customer/info',
    method: 'post',
    data
  })
}

// 修改信息
export function setItem(data) {
  return request({
    url: '/admin/customer/edit',
    method: 'post',
    data
  })
}

// 积分编辑
export function setPoints(data) {
  return request({
    url: '/admin/credit/edit',
    method: 'post',
    data
  })
}
// 经验编辑
export function setExp(data) {
  return request({
    url: '/admin/exp/edit',
    method: 'post',
    data
  })
}

export function getActionList(data) {
  return request({
    url: '/admin/store/actionlist',
    method: 'post',
    data
  })
}
// 同步拉取会员
export function syncMemberList(data) {
  return request({
    url: '/admin/customer/sync',
    method: 'post',
    data
  })
}
// 数据导出
export function getExportList(data) {
  return request({
    url: '/admin/customer/export',
    method: 'post',
    data
  })
}
export function deleteAccount(data) {
  return request({
    url: '/admin/customer/forceDelete',
    method: 'post',
    data
  })
}
export function getDetailsList(data) {
  return request({
    url: '/admin/customer/detailsList',
    method: 'post',
    data
  })
}
export function DetailsListExport(data) {
  return request({
    url: '/admin/customer/exportDetailsList',
    method: 'post',
    data
  })
}

// 获取国家
export function getCountryApi(data) {
  return request({
    url: '/common/country/list',
    method: 'post',
    data
  })
}
