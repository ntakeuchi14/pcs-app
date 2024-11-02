<template>
  <div>
    <v-btn depressed v-on:click="checkUser()" color="primary">{{$t('user.actions.delete')}}</v-btn>
    
    <v-dialog v-model="dialog" persistent max-width="500">
      <Modal
        @clickClose="dialog = false"
        @clickSubmit="emitDeletion"
        :message="$t('user.messages.confirmDelete')"
        modalType="yesOrNo"
      ></Modal>
    </v-dialog>
    
    <v-dialog v-model="isUnableToDelete" persistent max-width="500">
      <Modal
        @clickOk="isUnableToDelete = false"
        :message="$t('user.messages.alertDelete')"
        modalType="ok"
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
        isUnableToDelete: false
      }
    },
    props: ['target'],
    computed: {},
    components: {
      Modal
    },
    created() {},
    methods: {
      emitDeletion() {
        this.dialog = false
        this.$emit('delete', this.target)
      },
      checkUser(){
        const email = this.$store.state.user.attributes.email
        if(this.target === email){
          this.isUnableToDelete = true
        }else{
          this.dialog = true
        }
      }
    }
  }
</script>
