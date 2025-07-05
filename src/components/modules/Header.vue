<template>
  <v-app-bar
    color="white"
    scroll-target="#main"
    app
    clipped-left
  >
    <v-app-bar-nav-icon 
      class="pl-5"
      :href="$t('header.link')"
      target="_blank"
    >
      <v-img 
        :src="require('../../assets/images/nri_1_RGB.jpg')"
        contain
        width=50
        height=50
      />
    </v-app-bar-nav-icon>
    <v-toolbar-title
      class="title pl-5 pt-2"
    >
      {{$t('title')}}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <p class="mr-2 mb-0">
      <span style="max-width: 500px;" class="d-inline-block">
        <v-select v-model="selectedCompanyCode" :items="companies"  item-text="companyName" item-value="companyKey.companyCode" underlined @change="changeCompany" max-width="500px"></v-select>
      </span>
      <span style="max-width: 300px;" class="px-2 d-inline-block text-truncate">{{ userName }}</span>
    </p>
    <SelectLang/>
  </v-app-bar>
</template>

<script>
  import SelectLang from '@/components/modules/SelectLang'

  const apiName = 'PcsAPI';

  export default {
    components: {
      SelectLang,
    },
    data () {
      return {
        companies: [],
        selectedCompanyCode: undefined,
        userName: '',
      }
    },
    mounted() {
      this.getName()
    },
    watch: {
      isAdmin: {
        handler() {
          this.getName()
        }
      }
    },
    methods: {
      async getName() {
        const path = '/company/me'
        if (this.currentCompanyCode) {
          await this.apiGet(apiName, path)
            .then(response => {
                this.companies = response
                this.$store.commit('setSelectedCompanyCode', response[0].companyKey.companyCode)
                this.selectedCompanyCode = this.$store.getters.getSelectedCompanyCode
            })
        }
        // 会社名と同時にユーザー名を描画したいため
        this.userName = this.$store.getters.getUsername
      },
      changeCompany(code) {
        this.$store.commit('setSelectedCompanyCode', code)
        this.$router.push({ path: '/dummy' }).then(()=>this.$router.push({ path: '/dashboard' }));
      }
    },
  }
</script>

<style scoped>
</style>