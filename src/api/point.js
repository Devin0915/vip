import request from '@/utils/request'
// 获取数据
export function getPointsList(data) {
  return request({
    url: '/admin/credit/list',
    method: 'post',
    data
  })
}
// 数据导出
export function getExportList(data) {
  return request({
    url: '/admin/credit/export',
    method: 'post',
    data
  })
}
