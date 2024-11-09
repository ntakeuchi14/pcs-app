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
        <v-col cols="auto" class="d-inline-block text-truncate" style="max-width: 400px;">{{ isAttach(item.data) === 'ja'
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
    <SwitchableSnackbars v-bind:snackbar="snackbar" />
    <Overlay :overlay="overlay" />
  </div>
</template>
<script>
import { API } from "aws-amplify";
import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
import ConfirmModal from '@/components/modules/ConfirmModal.vue'
import InformationAttachmentModal from '@/components/modules/InformationAttachmentModal.vue'
import Overlay from '@/components/parts/Overlay'
import * as Const from '@/const.js'
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
        message: ""
      },
      overlay: false,
    }
  },
  props: ['item'],
  computed: {
    isAttach() {
      return (d) => {
        if (this.isJp) {
          if (d.isAttach) {
            return 'ja'
          }
        } else {
          if (d.isAttachEn) {
            return 'en'
          } else if (d.isAttach) {
            return 'ja'
          }
        }
      }
    }
  },
  created() {
  },
  methods: {
    async download(id, lang) {
      const blobs = []
      for(let i=0 ; i < 11 ; i++ ) {
        const response = await API.get(apiName, '/information/attach', {
          queryStringParameters: {
            informationId: id,
            lang: lang,
            chunkSize: Const.SEGMENTSIZE,
            chunkIndex: i,
          }
        })
        if(!response.content) {
          return undefined
        }
        const blob = await this.base64DecodeAsBlobAll(response.content)
        blobs.push(blob)
        if( response.final ) {
          return { content: new Blob(blobs), filename: response.filename }
        }
      }
    },
    informationAttachDownload(e, information) {
      e.stopPropagation()
      this.targets.push(information.key.informationId)
      this.snackbar.state = ""
      this.snackbar.message = ""
      API.get(apiName, '/information/attach', {
        queryStringParameters: {
          informationId: information.key.informationId,
          lang: this.isAttach(information.data),
        }
      })
        .then(response => {
          if (this.isAttach(information.data) === 'ja') {
            if (response.content) {
              this.base64DecodeAsBlobAll(response.content).then(blob => this.dispatchDownload(blob, response.filename ? response.filename : 'attachment.pdf'))
            }
          } else {
            if (response.contentEn) {
              this.base64DecodeAsBlobAll(response.contentEn).then(blob => this.dispatchDownload(blob, response.filenameEn ? response.filenameEn : 'attachmentEn.pdf'))
            }
          }
        })
        .catch(() => {
          this.snackbar.state = "error"
          this.snackbar.message = this.$t('message.attachmentDownloadFailed')
        })
        .finally(() => {
          this.targets = this.targets.filter(v => v !== information.key.informationId)
        })
      return false
    },

    async informationAttachDownloadAdmin(e, information) {
      e.stopPropagation()
      this.targets.push(information.key.informationId)
      this.snackbar.state = ""
      this.snackbar.message = ""
      try {
        let response = await this.download(information.key.informationId, 'ja')
        if( response && response.content &&  response.filename) {
          this.dispatchDownload(response.content, response.filename)
        }
        response = await this.download(information.key.informationId, 'en')
        if( response && response.content &&  response.filename ) {
          this.dispatchDownload(response.content, response.filename )
        }
      } catch(e) {
        this.snackbar.state = "error"
        this.snackbar.message = this.$t('message.attachmentDownloadFailed')
      } finally {
        this.targets = this.targets.filter(v => v !== information.key.informationId)
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
              .then(() => this.$emit("refresh"))
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
              let version = undefined
              if(result.content) {
                version = await this.uploadAttachment(information.key.informationId, information.key.version, true, result.filename, result.content)
              }
              if (result.contentEn) {
                await this.uploadAttachment(information.key.informationId, version ? version:information.key.version, false, result.filenameEn, result.contentEn)
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

    async uploadAttachment(id, version, jp, filename, contents) {
      let res = undefined
      let v = version
      for (let i=0 ; i < contents.length; i++ ) {
        const content = contents[i]
        res = await API.post(apiName, '/information/attach', {
          body: {
            key: {
              informationId: id,
              version: v
            },
            data: {
              content: content,
              filename: filename,
              isJp: jp,
              chunk: i!=0
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
        v = res.version
      }
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
