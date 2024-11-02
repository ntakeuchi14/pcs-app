<template>
  <div>
    <v-btn depressed :disabled="!valid" v-on:click="emitValitation()" :color="btnColor">
      {{ buttonName }}
    </v-btn>
    <v-dialog v-model="dialog" persistent max-width="500">
      <Modal
        @clickClose="dialog = false"
        @clickSubmit="emitCreation"
        :message="modalMessage"
        modalType="yesOrNo"
      ></Modal>
    </v-dialog>
  </div>
</template>
<script>
  import Modal from '@/components/modules/Modal'

  export default {
    data() {
      return {
        dialog: false,
      }
    },
    props: {
      valid: {
        type: Boolean,
        default: false,
      },
      buttonName: {
        type: String,
        default: "ok",
      },
      modalMessage: {
        type: String,
        default: "regist?",
      },
      btnColor: {
        type: String,
        default: "primary",
      },
    },
    components: {
      Modal
    },
    created() {},
    methods: {
      openDialog() {
        this.dialog = true
      },
      emitValitation() {
        this.$emit('validate')
      },
      emitCreation() {
        this.dialog = false
        this.$emit('create')
      }
    }
  }
</script>
