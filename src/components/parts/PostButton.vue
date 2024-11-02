<template>
  <v-btn
    large
    :color="color"
    @click="openModal"
    :disabled="isDisabled"
    depressed
  >
    {{ buttonName }}
  </v-btn>
</template>

<script>
  export default {
    name: 'Button',
    props: {
      'buttonName': {
        type: String,
        default: ''
      },
      'color': {
        type: String,
        default: ''
      },
      'isDisabled': {
        type: Boolean,
        default: false
      }
    },
    methods: {
        openModal() { 
          this.$emit('openModal');
        }
    }
  }
</script>