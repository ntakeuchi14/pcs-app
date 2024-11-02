<template>
    <v-navigation-drawer
      class="indigo darken-4"
      dark
      permanent
      app
      clipped
    >
      <v-list>
        <router-link 
          v-for="(menu, index) in menus"
          :key="index"
          :to="menu.path"
          style="text-decoration: none;"
        >
          <v-list-item
            link
            :class="!$route.path.indexOf(menu.path) ? 'primary' : ''"
            @click="deleteSearchParams">
          
            <v-list-item-content
              class="text-left"
            >
              <v-list-item-title>{{ menu.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
      </v-list>
      <template v-slot:append>
        <div class="pb-10">
          <v-btn
            color="primary"
            rounded
            @click="openModal"
          >
            {{$t('logout')}}
          </v-btn>
        </div>
      </template>
      <v-dialog v-model="modal" width="500">
        <Modal
          @clickClose="closeModal"
          @clickSubmit="onSubmit"
          :message="message"
        ></Modal>
      </v-dialog>
    </v-navigation-drawer>
</template>

<script>
import { Auth } from 'aws-amplify'
import Modal from '@/components/modules/Modal'

  export default {
    components: {
      Modal
    },
    data () {
      return {
        modal: false,
        message: '',
        active:'/dashboard'
      }
    },
    computed: {
      items(){ 
          return [
          { 
            title: this.$t('menu.dashboard'), 
            path: '/dashboard',
            isAdminMenu: false 
          },
          { 
            title: this.$t('menu.informations'),
            path: '/information',
            isAdminMenu: false 
            
          },
          { 
            title: this.$t('menu.signs'),
            // path: '/sign/all',
            path: '/sign',
            isAdminMenu: false
            },
          
          { 
            title: this.$t('menu.allAnswers'),
            path: '/answer',
            isAdminMenu: false,
            jpOnly: true
          },
          { 
            title: this.$t('menu.adminCompanies'),
            path: '/admin/company',
            isAdminMenu: true 
            
          },
          { 
            title: this.$t('menu.adminUsers'),
            path: '/user',
            isAdminMenu: false 
          },
        ]
      },
      menus() {
        if (!this.isAdmin) {
          return this.items.filter(item => {
            return item.isAdminMenu === false 
          }).filter(item => {
            return undefined === item.jpOnly || ( item.jpOnly === true && this.isJp )
          })
        }
        return this.items
      },
      
      // currentPath() {
      //   return this.$route
      // }
    },
    // TODO: パスの検討し直した方がいい
    // watch:{
    //   currentPath() {
    //     console.log("現在のパス" + this.currentPath)
    //     // console.log("インデックス" + this.)
    //   }
    // },
    methods: {
      openModal() {
        this.modal = true
        this.message = this.$t('message.logout.confirm')
      },
      closeModal() {
        this.modal = false
      },
      async onSubmit() {
        try {
          this.modal = false
          await Auth.signOut();
          this.$store.commit('setUser', null)
          this.$router.push({ path: '/login'}, () => {})
        }
        catch (error) {
          console.log('error signing out: ', error);
        }
      },
      deleteSearchParams() {
        this.$store.dispatch('setSearchParams', {})
      }
    },
  }
</script>

<style scoped>
.active { 
    background-color: #1976d2;
}
</style>