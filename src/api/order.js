import request from '@/utils/request'
// 获取数据

export function getOrderList(data) {
  return request({
    url: '/admin/order/list',
    method: 'post',
    data
  })
}
// 数据导出
export function getExportList(data) {
  return request({
    url: '/admin/order/export',
    method: 'post',
    data
  })
}
