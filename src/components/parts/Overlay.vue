<template>
  <v-overlay
    z-index="999"
    :value="overlay"
  >
    <v-progress-circular
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>
</template>

<script>
  export default {
    name: 'Loader',
    props: {
      'overlay': {
        type: Boolean,
        default: false
      },
    }
  }
</script>