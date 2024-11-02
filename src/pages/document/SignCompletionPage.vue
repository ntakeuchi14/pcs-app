<template>
    <div>
      <PageTitle>{{$t('menu.signComplete')}}</PageTitle>

      <v-row
        justify="center" align="center" style="min-height: 600px;"
      >
        <div class="text-center font-weight-bold complete-message" v-html="$attrs.message"></div>
      </v-row>
      <ReturnIndexButton 
        :path="path"
      />
    </div>
</template>
<script>
  import PageTitle from '@/components/parts/PageTitle'
  import ReturnIndexButton from '@/components/parts/ReturnIndexButton'


  export default {
    name: 'SignCompletionPage',
    components: {
      PageTitle,
      ReturnIndexButton,
    },
    data() {
      return {
        path: "/sign"
      }
    },
    props: {
      'messsage': {
        type: String,
        default: '',
      }
    },
  }
</script>

<style>
 .complete-message {
    font-size: 24px; 
 }
</style>