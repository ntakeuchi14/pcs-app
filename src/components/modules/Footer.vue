<template>
  <v-footer
    color="lighten-1"
    inset
  >
    <v-spacer></v-spacer>
    <v-row
      justify="center"
      no-gutters
    >
      <v-btn
        v-for="(link, index) in links"
        :key="index"
        color="gray"
        text
        rounded
        class="my-2"
        :to="link.path" 
        :href="link.url"
        :target="link.target"
        :download="link.file"
      >
        {{ link.title }}
      </v-btn>
      <v-col
        class="lighten-2 py-4 text-center gray--text"
        cols="12"
      >
        <small>Copyright(c) Nomura Research Institute, Ltd. All rights reserved.</small>
      </v-col>
    </v-row>
  </v-footer>
</template>
<script>
  export default {
    computed: {
      links() {
        const guideLink = this.$te('footer.guideLink') ? this.$t('footer.guideLink') : undefined
        return [
          {
            title:this.$t('footer.home'),
            path:'/'
          },
          {
            title:this.$t('footer.guide'),
            url: guideLink ? require(`@/assets/${guideLink}`) : undefined,
            file: 'guide.pdf'
          },
          {
            title:this.$t('footer.inquiry'),
            path:'/inquiry'
          },
          {
            title:this.$t('footer.environment'),
            path:'/environment'
          },
          {
            title:this.$t('footer.privacy'),
            url:this.$t('footer.privacyLink'),
            target: "_blank"
          },
        ]
      }
    }
  }
</script>