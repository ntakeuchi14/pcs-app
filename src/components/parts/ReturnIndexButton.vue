<template>
  <v-row justify="center">
    <v-btn
      width="500px"
      :to="path"
      depressed
    >
      {{$t('common.returnIndex')}}
    </v-btn>
  </v-row>

</template>

<script>
  export default {
    name: 'ReturnIndexButton',
    props: {
      'path': {
        type: String(),
        default: '/'
      },
    }
  }
</script>