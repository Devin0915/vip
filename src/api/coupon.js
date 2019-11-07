import request from '@/utils/request'
// 获取数据
export function getCouponList(data) {
  return request({
    url: '/admin/coupon/list',
    method: 'post',
    data
  })
}
