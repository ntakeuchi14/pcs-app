<template>
  <div class="signin">
    <div v-if="!signedIn" class="amplify">
      <amplify-auth-container>
        <amplify-authenticator v-if="!reset" username-alias="email">
          <amplify-sign-in
            :header-text="$t('login.title')"
            slot="sign-in"
            username-alias="email"
            hide-sign-up="true"
            ref="inputField"
          ></amplify-sign-in>
        </amplify-authenticator>
        <amplify-forgot-password
          v-if="reset"
          username-alias="email"
          :header-text="$t('signin.passwordSetting')"
          ref="inputField"
        ></amplify-forgot-password>
      </amplify-auth-container>
    </div>
  </div>
</template>
<script>
import { onAuthUIStateChange } from "@aws-amplify/ui-components";
import { Auth } from "aws-amplify";
import queryString from "query-string";
import * as Const from '@/const.js'

    export default {
        name: 'SignInPage',
        data() {
            const reset = queryString.parse(location.search)['reset']
            return {
                signedIn: false,
                reset: null === reset ? 'reset' : reset
            }
        },
        methods: {
          changeFontFamily() {
            if( this.$refs.inputField ) {
              // placeholderのfont-familyを強制的に変更
              const shadowRoot = this.$refs.inputField.shadowRoot
              if(shadowRoot) {
                shadowRoot.innerHTML = `<style>input { font-family: 'Noto Sans JP', sans-serif; }</style>`
              }
            }
          },
          deleteSearchParams() {
            this.$store.dispatch('setSearchParams', {})
          }
        },
        mounted() {
          const startLocation = this.$router.history._startLocation
          const langs = Const.COOKIE.LANG.langs.map(e=>e.key).filter(e=>`/${e}`===startLocation)
          if( langs.length > 0 ) {
            // set lang from start location
            this.changeLang(langs[0])
          } else {
            const lang = this.$cookies.get(Const.COOKIE.LANG.key)
            if( Const.COOKIE.LANG.langs.filter(e=>e.key===lang).length > 0 ) {
              // set lang from cookie
              this.changeLang(lang)
            }
          }
        },
        async beforeCreate() {
            try {
                await Auth.currentAuthenticatedUser()
                this.signedIn = true
                this.deleteSearchParams()
            }
            catch (err) {
                this.signedIn = false
            }
            onAuthUIStateChange(async (info) => {
                if( !this.reset ) {
                    if (info === 'signedin') {
                        this.signedIn = true
                        this.deleteSearchParams()
                    }
                    else {
                        this.signedIn = false
                    }
                } else {
                    this.reset = undefined
                }
            })
            this.changeFontFamily()
        },
        updated() {
            this.changeFontFamily()
        }
    }
</script>
<style>
    amplify-authenticator {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        height: 100vh;
    --container-align: 'none';
    --width: 600px;
    }
</style>
