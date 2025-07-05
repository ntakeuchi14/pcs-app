import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    searchParams: [],
    selectedCompanyCode: undefined,
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
    },
    getSelectedCompanyCode(state) {
      return state.selectedCompanyCode
    },
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      if( null === user ) {
        state.selectedCompanyCode = undefined
      }
    },
    setSearchParams(state, payload) {
      state.searchParams = payload
    },
    getUser() {
      return this.state.user
    },
    getCompanyCode() {
      return this.user.attributes["preferred_username"]
    },
    setSelectedCompanyCode(state, code) {
      state.selectedCompanyCode = code
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
