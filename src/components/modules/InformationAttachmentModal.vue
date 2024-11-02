<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title class="headline">
      {{$t('information.attachment.title')}}
      </v-card-title>
      <v-card-text>
        <v-form v-model="isFormValid">
          <v-row align="center">
            <v-col cols="8" v-if="isAttach || attach">
              <v-subheader align="left">{{filename}}</v-subheader>
            </v-col>
            <v-col cols="1">
              <v-btn @click="fileSelect(true)">{{$t('information.attachment.selectFile')}}</v-btn>
              <input type="file" ref="inputJp" v-on:change="fileChange(true, $event)" style="display:none"/>
            </v-col>
          </v-row>
          <v-row align="center" v-if="isAttach || attach">
            <v-col cols="8" v-if="isAttachEn || attachEn">
              <v-subheader align="left">{{filenameEn}}</v-subheader>
            </v-col>
            <v-col cols="1">
              <v-btn @click="fileSelect(false)">{{$t('information.attachment.selectFileEn')}}</v-btn>
              <input type="file" ref="inputEn" v-on:change="fileChange(false, $event)" style="display:none"/>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <div>
        <v-card-actions class="px-10">
              <v-btn color="primary" @click="uploadAttachment" :disabled='!((isAttach || attach ) && !isDisabled)' :loading="loading">{{$t('common.update')}}</v-btn>
          <v-spacer></v-spacer>
            <v-btn @click="dialog=false">{{$t('common.cancel')}}</v-btn> 
        </v-card-actions>
      </div>
    </v-card>
    <ConfirmModal ref="confirmModal"/>
  </v-dialog>
</template>
<script>
  import * as Const from '@/const.js'
  import ConfirmModal from '@/components/modules/ConfirmModal.vue'
  export default {
    data() {
      return {
        isFormValid: false,
        required: function(val) {
          return !!val
        },
        dialog: false,
        id: undefined,
        isAttach: undefined,
        isAttachEn: undefined,
        filename: undefined,
        filenameEn: undefined,
        attach: undefined,
        attachEn: undefined,
        success: undefined,
        failure: undefined,
        loading: false,
      }
    },
    props: {},
    components: {
      ConfirmModal,
    },
    computed: {
      refConst() {
        return Const
      },
      isDisabled() {
        return !this.isFormValid
      },
    },
    created() {
    },
    methods: {
      async show(isAttach, filename, isAttachEn, filenameEn) {
        this.isAttach = isAttach
        this.filename = filename
        this.isAttachEn = isAttachEn
        this.filenameEn = filenameEn
        this.attach = undefined
        this.attachEn = undefined
        this.dialog = true
        return new Promise((resolve) => {
          this.success = () => resolve({
            filename: this.filename, 
            content: this.attach,
            filenameEn: this.filenameEn, 
            contentEn: this.attachEn,
          })
          this.failure = () => resolve()
        })
      },
      uploadAttachment(){
        this.$refs.confirmModal.show(this.$t('information.attachment.confirmAttachment'))
          .then((b)=>{
            if(b) {
              this.success()
              this.dialog = false
            }
          });
      },
      fileSelect(jp){
        if(jp) {
          this.$refs.inputJp.click();
        } else {
          this.$refs.inputEn.click();
        }
      },
      fileChange(jp, event) {
        this.loading = true
        this.$emit("error", "")
        try{
          const file = event.target.files[0];
          if (!file) {
            throw new Error(this.$t('information.attachment.invalidFile'))
          }
          event.target.value = "";
          if(Const.CHECK_FILENAME_PATTERN.test(file.name)) {
            throw new Error(this.$t('information.attachment.invalidFilename'))
          }
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const attach = btoa(this.arrayBufferToBinaryString(e.target.result));
              const filename = file.name.substr(0, Const.FORM.FILENAME_MAX_LENGTH);
              if(jp) {
                this.attach = attach
                this.filename = filename
              } else {
                this.attachEn = attach
                this.filenameEn = filename
              }
            } catch (e) {
              this.$emit("error", e.message)
              return false
            } finally {
              this.loading = false
            }
          }
          reader.readAsArrayBuffer(file);
        } catch (e) {
          this.loading = false
          this.$emit("error", e.message)
          return false
        }
      },
    }
  }
</script>
<style>
</style>
