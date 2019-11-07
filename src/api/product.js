import request from '@/utils/request'
// 获取数据
export function getProductList(data) {
  return request({
    url: '/admin/product/list',
    method: 'post',
    data
  })
}
// 添加产品
export function setAddProductItem(data) {
  return request({
    url: '/admin/product/addedit',
    method: 'post',
    data
  })
}
// 编辑产品
export function setEditProductItem(data) {
  return request({
    url: '/admin/product/edit',
    method: 'post',
    data
  })
}
// 删除数据
export function deleteProductItem(data) {
  return request({
    url: '/admin/product/delete',
    method: 'post',
    data
  })
}

// 同步数据
export function syncProductList(data) {
  return request({
    url: '/admin/product/sync',
    method: 'post',
    data
  })
}
// 数据导出
export function getExportList(data) {
  return request({
    url: '/admin/product/export',
    method: 'post',
    data
  })
}
