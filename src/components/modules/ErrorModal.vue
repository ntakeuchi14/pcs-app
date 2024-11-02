<template>
  <div>
    <slot
      v-if="err"
      name="error"
      v-bind:err="err"
      >
      <v-dialog
        v-model="modalFailed"
        width="500"
        @click:outside="close"
      >
      <v-card>
        <v-card-title class="headline"
          v-if="errorCode"
        >
          {{$t('common.error')}}：{{ errorCode }}
        </v-card-title>
    
        <v-card-text>
          <div class="pa-10">{{ errorMessage }}</div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions
         class="px-10"
        >
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="close"
          >
            {{$t('common.close')}}
          </v-btn>
        </v-card-actions>
        </v-card>
      </v-dialog>
    </slot>
    <slot v-else></slot>
  </div>
</template>
<script>
export default {
  name: 'ErrorSnackbar',
  props: {
    errorMessage: {
        type: String,
        default: '',
    },
    err: {
      type: Boolean,
      default: false
    },
    modalFailed: {
      type: Boolean,
      default: true
    },
    errorCode: {
      type: String(),
      default: ''
    }
  },
  data() {
    return {
      
    }
  },
  methods: {
    close() {
      this.$emit('clickClose')
    }
  },
};
</script>