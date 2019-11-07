import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

console.log(process.env)
const state = {
  token: getToken(),
  operator: '',
  avatar: '',
  store_id: '',
  roles: [],
  apiUrl: process.env.VUE_APP_BASE_DOWNLOAD_URL
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, operator) => {
    state.operator = operator
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_STORE: (state, store_id) => {
    state.store_id = store_id
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, store_id } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password, store_id }).then(response => {
        const { data } = response
        sessionStorage.setItem('store_id', data.store_id)
        sessionStorage.setItem('operator', data.username)
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      const store_id = sessionStorage.getItem('store_id')
      const operator = sessionStorage.getItem('operator')
      getInfo(state.token, store_id, operator).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { roles, username, avatar, store_id } = data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROLES', roles)
        commit('SET_NAME', username)
        commit('SET_STORE', store_id)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

