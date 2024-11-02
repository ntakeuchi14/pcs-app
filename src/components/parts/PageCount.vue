<template>
  <div class="mt-5 grey--text">
    <v-row justify="center">
      {{label}}
    </v-row>
  </div>
</template>

<script>
  export default {
    name: 'PageCount',
    props: {
      'allCount': {
        type: [String, Number],
        default: 0
      },
      'currentPageCount': {
        type: String,
        default: ''
      },
    },
    computed: {
      label(){
        return this.stringFormat(this.$t('pagination.format'), this.allCount, this.currentPageCount)
      }
    }
  }
</script>