<template>
  <div id="app">
    <v-app>
      <div id="nav"
        v-if=!isLogin
      >
      </div>
        <SideMenu
          v-if=isLogin
        />
        <Header
          v-if=isLogin
        />
        <v-main id="main">
          <v-container fluid class="pb-15">
            <ErrorModal
             :err="err"
             :errorMessage="errorMessage"
             :modalFailed="modalFailed"
             :errorCode="errorCode"
             @clickClose="closeModal"
            >
              <router-view />
            </ErrorModal>
            <OverlayWithLoader/>
          </v-container>
        </v-main>
        <Footer
          v-if=isLogin
        />
    </v-app>
  </div>
</template>

<script>
import Header from '@/components/modules/Header'
import SideMenu from '@/components/modules/SideMenu'
import Footer from '@/components/modules/Footer'
import ErrorModal from '@/components/modules/ErrorModal'
import OverlayWithLoader from '@/components/modules/OverlayWithLoader.vue'

import * as Const from '@/const.js'
import { Auth } from 'aws-amplify'

export default {
  name: 'app',
  data() {
    return {
      errorMessage: '',
      err: false,
      modalFailed: true,
      errorCode: '',
      isCloseLogout: false,
      jumpFlag: false,
    }
  },
  components : {
    Header,
    SideMenu,
    Footer,
    ErrorModal,
    OverlayWithLoader
  },
  computed: {
    isLogin() {
      return this.$store.getters.check
    },
    refConst() {
      return Const
    },
  },
  created() {
    window.addEventListener("unhandledrejection", error => {
      if (error.reason.message === 'Network Error') {
        this.err = true
        this.modalFailed = true
        this.errorMessage = this.$t('errorDescription.networkError')
      } 
      // 照会画面系のURL強制ブラウジング対策
      else if (error.reason.message === '404') {
        this.err = true
        this.modalFailed = true
        this.errorCode = error.reason.message
        this.errorMessage = this.$t('errorDescription.status_404')
        this.jumpFlag = true
      }
      // ログイン中にユーザーが削除された場合
      else if (error.reason.response && error.reason.response.data.message === 'User does not exist.') {
        this.err = true
        this.modalFailed = true
        this.errorCode = error.reason.response.data.code
        this.errorMessage = this.$t('errorDescription.userNotExists')
        this.isCloseLogout = true
      }
      else {
        if(error.reason.response) {
          this.err = true
          this.modalFailed = true
          const errorCode = error.reason.response.data.code
          this.errorCode = errorCode
          switch (errorCode) {
            case 400:
              this.errorMessage = this.$t('errorDescription.status_400')
              break;
            case 403:
              this.errorMessage = this.$t('errorDescription.status_403')
              this.isCloseLogout = true
              break;
            case 404:
              this.errorMessage = this.$t('errorDescription.status_404')
              this.jumpFlag = true
              break
            default:
              this.errorMessage = this.$t('errorDescription.statusUnknown')
          }
        } else {
          this.err = true
          this.modalFailed = true
          this.errorMessage = this.$t('errorDescription.statusUnknown')
        }
      }
    })
  },
  methods: {
    closeModal() {
      this.modalFailed = false
      setTimeout(function() {
        this.err = false
      }.bind(this), 1000)
      if (this.isCloseLogout) {
        this.logout()
      }
      if (this.jumpFlag) {
        this.$router.push({ path: '/dashboard'}, () => {})
      }
    },
    async logout() {
      await Auth.signOut();
      this.$store.commit('setUser', null)
      this.$router.push({ path: '/login'}, () => {})
    },
  },
  errorCaptured (err){
    if (err.message === 'Network Error') {
      this.err = true
      this.modalFailed = true
      this.errorMessage = this.$t('errorDescription.networkError')
    } else {
      if( err.message ) {
        // 照会画面系のURL強制ブラウジング対策
        if (err.message === "404") {
            this.err = true
            this.modalFailed = true
            this.errorCode = err.message
            this.errorMessage = this.$t('errorDescription.status_404')
            this.jumpFlag = true
        } else {
          // 不明なエラー
          this.err = true
          this.modalFailed = true
          this.errorMessage = this.$t('errorDescription.statusUnknown')
          console.error(err)
        }
      } else {
        if (err.response) {
          const errorCode = err.response.data.code
          this.err = !!err
          this.modalFailed = true
          this.errorCode = errorCode
      
          switch (errorCode) {
            case 400:
              this.errorMessage = this.$t('errorDescription.status_400')
              break;
            case 403:
              this.errorMessage = this.$t('errorDescription.status_403')
              this.isCloseLogout = true
              break;
            case 500:
              this.errorMessage = this.$t('errorDescription.status_500')
              break
            case 503:
              this.errorMessage = this.$t('errorDescription.status_500')
              break
            default:
              this.errorMessage = this.$t('errorDescription.statusUnknown')
          }
        }
      }
    } 
  }

}
</script>
<style src='@/style.css'></style>
