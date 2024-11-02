import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    searchParams: [],
  },
  getters: {
    check(state) { 
      return !!state.user 
    },
    getUsername(state) {
      return state.user.attributes.name
    },
    isAdmin(state) {
      if (!state.user.signInUserSession.accessToken.payload["cognito:groups"]) {
        return false
      }
      return state.user.signInUserSession.accessToken
        .payload['cognito:groups'].filter(_ => _ === 'Admin').length > 0;
    },
    getEmail(state) {
      return state.user.attributes.email
    },
    getCompanyCode(state) {
      return state.user.attributes["preferred_username"] ? state.user.attributes["preferred_username"] : ''
    },
    getSearchParams(state) {
      return state.searchParams
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setSearchParams(state, payload) {
      state.searchParams = payload
    },
    getUser() {
      return this.state.user
    },
    getCompanyCode() {
      return this.user.attributes["preferred_username"]
    }
  },
  actions: {
    setSearchParams({commit}, payload) {
      commit('setSearchParams', payload)
    }
  },
  modules: {
  }
})
