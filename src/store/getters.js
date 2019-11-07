const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  operator: state => state.user.operator,
  store_id: state => state.user.store_id,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  apiUrl: state => state.user.apiUrl
}
export default getters
