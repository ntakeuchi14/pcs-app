<template>
    <p class="mr-2 mb-0">
      <v-bottom-sheet v-model="sheet">
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="txt">
            <v-icon>mdi-web</v-icon>
            language
          </div>
        </template>
        <v-sheet class="text-center">
          <v-tabs v-model="locale" background-color="blue accent-4" centered dark icons-and-text>
            <v-tab v-for="lang in langs" :key="lang.key" @click="select(lang.key)">{{lang.text}}</v-tab>
          </v-tabs>
        </v-sheet>
      </v-bottom-sheet>
    </p>
</template>

<script>
  import * as Const from '@/const.js'
  export default {
    data() {
      return {
        sheet: false,
        locale: undefined
      }
    },
    computed: {
      langs(){
        return Const.COOKIE.LANG.langs
      }
    },
    mounted() {
      const lang = this.$cookies.get(Const.COOKIE.LANG.key)
      for( let i = 0 ; i < this.langs.length ; i++ ) {
        if( this.langs[i].key === lang ) {
          this.changeLang(lang)
          this.locale = i
          break
        }
      }
    },
    methods: {
      select(lang) {
        this.changeLang(lang)
        this.sheet = false
      }
    }
  }
</script>

<style scoped>
.txt {
  font-size: xx-small;
  display: grid;
}
</style>