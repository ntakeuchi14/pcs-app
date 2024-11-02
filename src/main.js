import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './localize'
import aws_exports from './aws-exports'
import vuetify from './plugins/vuetify'
import utilsMixIn from './utilsMixin'
import Amplify from 'aws-amplify';
import "@aws-amplify/ui-vue";
import VueI18n from 'vue-i18n'
import VueCookies from 'vue-cookies'

Vue.config.productionTip = false

aws_exports.storage = window.sessionStorage
Amplify.configure(aws_exports)
Vue.use(vuetify)
Vue.use(VueI18n)

Vue.use(require('vue-moment'));
Vue.use(VueCookies)
Vue.mixin(utilsMixIn);

Vue.config.errorHandler = (err) => {
  if (err.response) {
    const code = err.response.status
    const message = err.response.data.message
    console.log(code, message)
  }
}

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  i18n: new VueI18n({
    locale: 'ja',
    messages: {
      ja : require('./lang/ja.json'),
      en : require('./lang/en.json'),
    }
  }),
}).$mount('#app')

