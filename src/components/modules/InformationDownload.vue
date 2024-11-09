<template>
  <div>
    <div v-if="isAdmin">
      <v-btn icon @click="informationAttachEdit($event, item)" :loading="targets.indexOf(item.key.informationId) !== -1">
        <v-icon v-if="item.data.isAttach === 1" color="primary">mdi-content-save-edit</v-icon>
        <v-icon v-else color="primary">mdi-upload</v-icon>
      </v-btn>
      <v-btn icon v-if="item.data.isAttach === 1" @click="informationAttachDownloadAdmin($event, item)"
        :loading="targets.indexOf(item.key.informationId) !== -1">
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-btn icon v-if="item.data.isAttach === 1" @click="informationAttachDelete($event, item)"
        :loading="targets.indexOf(item.key.informationId) !== -1">
        <v-icon color="error">mdi-delete-forever-outline</v-icon>
      </v-btn>
      <InformationAttachmentModal ref="informationAttachmentModal" @error="attachError" />
      <ConfirmModal ref="confirmModal" />
    </div>

    <div v-else>
      <v-row v-if="isAttach(item.data)">
        <v-col cols="auto" class="d-inline-block text-truncate" style="max-width: 400px;">{{ isAttach(item.data) === LANG_JAPANESE
          ?
          item.data.filename : item.data.filenameEn }}</v-col>
        <v-col>
          <v-btn icon depressed @click="informationAttachDownload($event, item)"
            :loading="targets.indexOf(item.key.informationId) !== -1"
            :disabled="targets.indexOf(item.key.informationId) !== -1">
            <v-icon large>mdi-download</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <SwitchableSnackbars v-bind:snackbar="snackbar" @click.native.stop="" />
    <Overlay :overlay="overlay" @click.native.stop="" />
  </div>
</template>
<script>
import { API } from "aws-amplify";
import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
import ConfirmModal from '@/components/modules/ConfirmModal.vue'
import InformationAttachmentModal from '@/components/modules/InformationAttachmentModal.vue'
import Overlay from '@/components/parts/Overlay'
import { Storage } from 'aws-amplify';
const apiName = 'PcsAPI';

export default {
  components: {
    SwitchableSnackbars,
    InformationAttachmentModal,
    ConfirmModal,
    Overlay,
  },
  data() {
    return {
      targets: [],
      snackbar: {
        state: "",
        message: "",
      },
      overlay: false,
      LANG_JAPANESE: "ja",
      LANG_ENGLISH: "en",
      S3_PATH_PREFIX: "information/attachments",
    }
  },
  props: ['item'],
  computed: {
    isAttach() {
      return (d) => {
        if (this.isJp) {
          if (d.isAttach) {
            return this.LANG_JAPANESE
          }
        } else {
          if (d.isAttachEn) {
            return this.LANG_ENGLISH
          } else if (d.isAttach) {
            return this.LANG_JAPANESE
          }
        }
      }
    }
  },
  created() {
  },
  methods: {
    storageGet(id, lang){
      API.get(apiName, '/information', {
        queryStringParameters: {
          informationId: id,
        }
      })
        .then(ar => {
          Storage.get(`${this.S3_PATH_PREFIX}/${id}/${lang}`, { download: true })
            .then(sr => {
              if( sr.Body ) {
                if (lang === this.LANG_JAPANESE) {
                  this.dispatchDownload(sr.Body, ar.data.filename ? ar.data.filename : 'attachment')
                } else {
                  this.dispatchDownload(sr.Body, ar.data.filenameEn ? ar.data.filenameEn : 'attachmentEn')
                }
              }
            })
            .catch(() => {
              this.snackbar.state = "error"
              this.snackbar.message = this.$t('message.attachmentDownloadFailed')
            })
            .finally(() => {
              this.targets = this.targets.filter(v => v !== id)
            })
        })
        .catch(() => {
          this.snackbar.state = "error"
          this.snackbar.message = this.$t('message.attachmentDownloadFailed')
        })
        .finally(() => {
          this.targets = this.targets.filter(v => v !== id)
        })
    },
    informationAttachDownload(e, information) {
      e.stopPropagation()
      this.targets.push(information.key.informationId)
      this.snackbar.state = ""
      this.snackbar.message = ""
      this.storageGet(information.key.informationId, this.isAttach(information.data))
      return false
    },

    informationAttachDownloadAdmin(e, information) {
      e.stopPropagation()
      this.targets.push(information.key.informationId)
      this.snackbar.state = ""
      this.snackbar.message = ""
      if(information.data.filename) {
        this.storageGet(information.key.informationId, this.LANG_JAPANESE)
      }
      if(information.data.filenameEn) {
        this.storageGet(information.key.informationId, this.LANG_ENGLISH)
      }
      return false
    },

    informationAttachDelete(e, information) {
      e.stopPropagation()
      this.$refs.confirmModal.show(this.$t('message.confirmDeleteAttachment'))
        .then((b) => {
          if (b) {
            this.targets.push(information.key.informationId)
            this.overlay = true
            this.snackbar.state = ""
            this.snackbar.message = ""
            API.del(apiName, '/information/attach', { body: information.key })
              .then(() => {
                Storage.remove(`${this.S3_PATH_PREFIX}/${information.key.informationId}/ja`).catch((e)=>console.log(e))
                Storage.remove(`${this.S3_PATH_PREFIX}/${information.key.informationId}/en`).catch((e)=>console.log(e))
                this.$emit("refresh")
              })
              .catch((error) => {
                if (error.response.status === 409) {
                  this.snackbar.message = this.$t('errorDescription.status_409')
                  this.snackbar.state = "error"
                }
                else {
                  throw error
                }
              })
              .finally(() => {
                this.targets = this.targets.filter(v => v !== information.key.informationId)
                this.overlay = false
              })
          }
        })
      return false
    },

    informationAttachEdit(e, information) {
      e.stopPropagation()
      this.snackbar.state = ""
      this.snackbar.message = ""
      this.$refs.informationAttachmentModal.show(information.data.isAttach, information.data.filename, information.data.isAttachEn, information.data.filenameEn)
        .then(async (result) => {
          if (result) {
            this.targets.push(information.key.informationId)
            this.overlay = true
            try {
              const version = await this.uploadAttachment(information.key.informationId, information.key.version, true, result.filename)
              if ( version ) {
                if (result.content) {
                  await Storage.put(`${this.S3_PATH_PREFIX}/${information.key.informationId}/ja` , result.content)
                }
                if (result.filenameEn) {
                  await this.uploadAttachment(information.key.informationId, version, false, result.filenameEn)
                  if(result.contentEn) {
                    await Storage.put(`${this.S3_PATH_PREFIX}/${information.key.informationId}/en` , result.contentEn)
                  }
                }
              }
              this.$emit("refresh")
            } finally {
              this.overlay = false
              this.targets = this.targets.filter(v => v !== information.key.informationId)
            }
          }
        })
      return false
    },

    async uploadAttachment(id, version, jp, filename) {
      const res = await API.post(apiName, '/information/attach', {
        body: {
          key: {
            informationId: id,
            version: version
          },
          data: {
            filename: filename,
            isJp: jp,
          }
        }
      })
        .catch((error) => {
          if (error.response.status === 409) {
            this.snackbar.message = this.$t('errorDescription.status_409')
            this.snackbar.state = "error"
          }
          else {
            throw error
          }
        })
      return res ? res.version : res
    },
    attachError(msg) {
      this.snackbar.state = msg ? "error" : ""
      this.snackbar.message = msg
    },
  }
}
</script>
<style></style>
