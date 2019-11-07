import request from '@/utils/request'
// 获取数据
export function getEmailList(data) {
  return request({
    url: '/admin/email/list',
    method: 'post',
    data
  })
}
// 数据导出
export function getExportList(data) {
  return request({
    url: '/admin/email/export',
    method: 'post',
    data
  })
}
//活动列表
export function getInterestList(data) {
  return request({
    url: '/admin/invite/list',
    method: 'post',
    data
  })
}
//导出活动列表 
export function exportInterestList(data) {
  return request({
    url: '/admin/invite/export',
    method: 'post',
    data
  })
}
//活动审核列表
export function getShareList(data) {
  return request({
    url: '/admin/share/list',
    method: 'post',
    data
  })
}
//导出活动审核列表
export function exportShareList(data) {
  return request({
    url: '/admin/share/export',
    method: 'post',
    data
  })
}
//活动审核
export function editShareList(data) {
  return request({
    url: '/admin/share/audit',
    method: 'post',
    data
  })
}
export function activityList(data) {
  return request({
    url: '/admin/activity/apply/list',
    method: 'post',
    data
  })
}
export function exportActivityList(data) {
  return request({
    url: '/admin/activity/apply/export',
    method: 'post',
    data
  })
}
export function activityInfo(data) {
  return request({
    url: '/admin/activity/applyInfo/info',
    method: 'post',
    data
  })
}
export function activityAudit(data) {
  return request({
    url: '/admin/activity/apply/audit',
    method: 'post',
    data
  })
}
export function reviewList(data) {
  return request({
    url: '/admin/order/reviewList',
    method: 'post',
    data
  })
}
export function reviewExport(data) {
  return request({
    url: '/admin/order/reviewExport',
    method: 'post',
    data
  })
}
export function reviewCheck(data) {
  return request({
    url: '/admin/order/reviewCheck',
    method: 'post',
    data
  })
}
