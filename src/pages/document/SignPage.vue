<template>
    <div class="px-10" v-if="items && 0 < items.length">
      <div class="text-right" v-bind:class="{'float-right': isAdmin}">
        <v-chip
          label
        >
        {{$t('common.implNo')}}:{{ items[page].signKey.implNo }}
        {{$t('common.revisionNo')}}:{{ items[page].signKey.revisionNo }}
        </v-chip>
      </div>
      <h1 class="text-left" v-if="isAdmin">{{ items[page].companyName }}</h1>
      <div class="text-center">
          {{$t('common.historyNo')}}
      </div>
      <div>
        <v-btn
          icon
          @click="jumpFirst"
          :class="invisiblePrevButton"
        >
          <v-icon>mdi-page-first</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="prev"
          :class="invisiblePrevButton"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <span>{{ items[page].signKey.historyNo }}</span>
        <v-btn
          icon
          @click="next"
          :class="invisibleNextButton"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="jumpLast"
          :class="invisibleNextButton"
        >
          <v-icon>mdi-page-last</v-icon>
        </v-btn>
      </div>
      <PageTitle>{{ isJp ? items[page].title : items[page].titleEn }}</PageTitle>
      <div v-if="isSaved" class="text-right mt-5">
        <v-chip
          label
        >
        {{$t('common.signedAt')}}:{{ items[page].signedAt ? items[page].signedAt : items[page].lastUpdateDate }}
        </v-chip>
      </div>
      <div class="mt-10">
        <div class="text-left document-contents font-weight-bold" :style="contentsStyles" v-html="contents(page)"></div>
      </div>
      <div>
        <v-row>
          <div style="margin-left:auto;">
            <v-form v-model="isFormValid">
              <v-list  v-for="(signItem, index) in parseSignItems" :key="index">
                <v-row
                  :class="(isEditablePage && isNotSaved && !isAdmin) ? 'align-center' : ''"
                  dense
                  style="height: 50px;width:fit-content;"
                >
                <div>
                  <p
                    class="font-weight-bold text-right mt-3"
                    style="width:200px;"
                  >{{ signItem }}
                  <span class="required" 
                        :class="{'transparent': 
                                    (isAdmin
                                    || isSaved
                                    || requiredIndex.indexOf(index) === -1)
                                }">{{$t('common.required')}}</span>
                  </p>
                    
                </div>
                <template v-if="(isEditablePage && isNotSaved && !isAdmin)">
                  <div>
                    <v-text-field
                      class="pl-5"
                      v-model="parseSigns[index]"
                      v-if="!!signItem"
                      :solo="!(isEditablePage && isNotSaved && !isAdmin)"
                      :flat="true"
                      :rules="requiredIndex.indexOf(index) !== -1 ? [required] : []"
                      :maxlength="getFormConst.MAX_LENGTH"
                      autocomplete="new-password"
                    ></v-text-field>
                  </div>
                </template>
                <template v-else>
                  <v-col>
                    <p
                      class="pl-5 mt-3 text-left"
                      style="width:auto; min-width:150px; padding:0px">
                      {{ parseSigns[index] }}
                    </p>
                  </v-col>
                </template>
                </v-row>
              </v-list>
            </v-form>
          </div>
        </v-row>
      </div>
      <div class="mt-5">
        <v-row
          align="center"
          justify="space-around"
          class=""
        >
          <template v-if="(isEditablePage && isNotSaved && !isAdmin)">
            <v-col cols="6" class="pb-10">
              <PostButton
                :buttonName="$t('common.tempSave')"
                color="warning"
                @openModal="openModal('saved')"
              />
            </v-col>
            <v-col cols="6" class="pb-10">
              <PostButton
                :buttonName="$t('common.save')"
                color="primary"
                :isDisabled="!isFormValid"
                @openModal="openModal('done')"
              />
            </v-col>
          </template>
          <template v-if="isAdmin && isEditablePage && isSaved">
            <v-col cols="6" class="pb-10">
              <PostButton
                v-if="isSaved"
                :buttonName="$t('sign.actions.reject')"
                color="warning"
                @openModal="openModal('reject')"
              />
            </v-col>
            <v-col cols="6" class="pb-10">
              <PostButton
                :buttonName="$t('sign.actions.renew')"
                color="primary"
                @openModal="openModal('renew')"
              />
            </v-col>
          </template>
          <v-col cols="4" class="pb-10">
            <ReturnIndexButton
              :path="returnPath"
            />
          </v-col>
        </v-row>
        <v-dialog v-model="cofirmModal" width="500">
          <Modal
            @clickClose="closeModal"
            :message="message"
            :disabled="modalDisabled"
            @clickSubmit="submitEvent"
          ></Modal>
        </v-dialog>
      </div>
      <Overlay
        :overlay="overlay"
      />
      <v-snackbar
        v-model="snackbarSucceed"
        color="primary"
        text
        icon
        top
      >
       {{ snackbarMessage }}
       <template v-slot:action="{ attrs }">
         <v-btn color="primary" text v-bind="attrs" @click="snackbarSucceed = false" icon>
           <v-icon>mdi-close</v-icon>
         </v-btn>
       </template>
      </v-snackbar>
      <v-snackbar
        v-model="snackbarFailed"
        color="error"
        text
        icon
        top
      >
      {{ snackbarMessage }}
       <template v-slot:action="{ attrs }">
         <v-btn color="error" text v-bind="attrs" @click="snackbarFailed = false" icon>
           <v-icon>mdi-close</v-icon>
         </v-btn>
       </template>
      </v-snackbar>
    </div>
</template>
<script>
  import PageTitle from '@/components/parts/PageTitle'
  import Modal from '@/components/modules/Modal'
  import PostButton from '@/components/parts/PostButton'
  import Overlay from '@/components/parts/Overlay'
  import ReturnIndexButton from '@/components/parts/ReturnIndexButton'

  import { Hub } from "aws-amplify"
  import { SIGN, FORM } from '@/const.js'

  const apiName = 'PcsAPI'

  export default {
    name: 'SignPage',
    components: {
      PageTitle,
      Modal,
      PostButton,
      Overlay,
      ReturnIndexButton,
    },
    data() {
      return {
        returnPath: '/sign',
        items: [],
        cofirmModal: false,
        overlay: false,
        message: '',
        modalDisabled: false,
        snackbarSucceed: false,
        snackbarFailed: false,
        snackbarMessage: null,
        postStatus: undefined,
        allCount: 0,
        page:0,
        isFormValid: false,
        required: function(val) {
          return !!val
        },
      }
    },
    computed: {
      getFormConst() {
        return FORM;
      },
      getImplNo() {
        return this.$route.params.impl_no
      },
      getCompanyCode() {
        return this.$route.params.company_code
      },
      parseSignItems() {
        const parseItems =  JSON.parse(this.isJp ? this.items[this.page].signItems : this.items[this.page].signItemsEn)
        return parseItems.signItems
      },
      requiredIndex() {
        const parseItems =  JSON.parse(this.isJp ? this.items[this.page].signItems : this.items[this.page].signItemsEn)
        return parseItems.requiredIndex ? parseItems.requiredIndex 
          : parseItems.signItems.map((e, i)=>e !== '' ? i : undefined).filter(e=>e!==undefined) // requiredIndexがない場合は全て必須
      },
      parseSigns() {
        if (this.items[this.page].sign) {
          const parseItems =  JSON.parse(this.items[this.page].sign)
          return parseItems.sign
        }
        else {
          return []
        }
      },
      isEditablePage(){
        return this.page === 0;
      },
      isNotSaved() {
        return this.items[this.page].status != SIGN.STATUS.SAVED 
      },
      isSaved() {
        return this.items[this.page].status == SIGN.STATUS.SAVED 
      },
      invisiblePrevButton() {
        return {
          'invisible-btn': this.page + 1 === this.allCount
        }
      },
      invisibleNextButton() {
        return {
          'invisible-btn': this.page === 0
        }
      },
      contents() {
        return (page) => {
          return this.format( this.isJp ? this.items[page].contents:this.items[page].contentsEn, this.items[page])
        }
      },
      contentsStyles() {
        return {
          '--display': (this.isEditablePage && this.isNotSaved && !this.isAdmin) ? 'block' : 'none'
        }
      }
    },
    methods: {
      format(template, values) {
        return new Function(...Object.keys(values), `return \`${template}\`;`)(
          ...Object.values(values).map((value) => value ?? "")
        );
      },
      // URLパラメータチェック
      checkUrlParams() {
        // 実施番号
        if (this.getImplNo === undefined || String(this.getImplNo).trim().length === 0) {
          throw new Error('404')
        }
        
        // 会社コード
        if (this.isAdmin && (this.getCompanyCode === undefined || String(this.getCompanyCode).trim().length === 0)) {
          throw new Error('404')
        }
      },
      async getSign() {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        await this.apiGet(apiName, '/sign', {
              queryStringParameters: {
                implNo: this.getImplNo,
                companyCode: this.isAdmin ? this.getCompanyCode:undefined
              }
            })
          .then(response => {
            this.items = response.data
            this.allCount = response.data.length
            if (response.data.length === 0) {
              throw new Error('404')
            }
          })
          .finally(()=>{
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },
      async addSign(isTempSaved) {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        this.overlay = true
        this.modalDisabled = true
        await this.apiPost(apiName, '/sign', {
              body: {
                signKey: this.items[0].signKey,
                sign: JSON.stringify({sign: this.parseSigns}),
                status: isTempSaved ? SIGN.STATUS.TEMPORARY_SAVED:SIGN.STATUS.SAVED
              },
            })
          .then(() => {
            if (!isTempSaved) {
               this.$router.push({ name: 'signComplete', params: { message: this.isJp ? this.items[0].message : this.items[0].messageEn } })
            }
            else {
              this.snackbarMessage = this.$t('messageSnackBar.tempSaveDone')
              this.snackbarSucceed = true
              this.getSign()
            }
          })
          .catch((error) => {
            if (error.response.status === 409) {
              this.snackbarMessage = this.$t('errorDescription.status_409')
              this.snackbarFailed = true
            }
            else {
              throw error
            }
          })
          .finally(() =>{
            this.cofirmModal = false
            this.overlay = false
            this.modalDisabled = false
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },
      async rejectSign() {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        this.overlay = true
        this.modalDisabled = true
        await this.apiPatch(apiName, '/sign', {
              body: this.items[0].signKey
            })
          .then(() => {
              this.snackbarMessage = this.$t('messageSnackBar.signRejectSucceed')
              this.snackbarSucceed = true
              this.getSign()
          })
          .catch((error) => {
            if (error.response.status === 409) {
              this.snackbarMessage = this.$t('errorDescription.status_409')
              this.snackbarFailed = true
            }
            else {
              throw error
            }
          })
          .finally(() =>{
            this.cofirmModal = false
            this.overlay = false
            this.modalDisabled = false
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },
      async renewSign() {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        this.overlay = true
        this.modalDisabled = true
        await this.apiPut(apiName, '/sign', {
              body: this.items[0].signKey
            })
          .then(() => {
              this.snackbarMessage = this.$t('messageSnackBar.signRenewSucceed')
              this.snackbarSucceed = true
              this.getSign()
          })
          .catch((error) => {
            if (error.response.status === 409) {
              this.snackbarMessage = this.$t('errorDescription.status_409')
              this.snackbarFailed = true
            }
            else {
              throw error
            }
          })
          .finally(() =>{
            this.cofirmModal = false
            this.overlay = false
            this.modalDisabled = false
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },
      prev() {
        if (this.page < this.allCount - 1) {
          this.items[this.page].sign = JSON.stringify({sign: this.parseSigns})
          this.page++
        }
      },
      next() {
        if (this.page > 0) {
          this.page--
        }
      },
      jumpFirst() {
        if (this.page < this.allCount - 1) {
          this.items[this.page].sign = JSON.stringify({sign: this.parseSigns})
          this.page = this.allCount - 1
        }
      },
      jumpLast() {
        if (this.page > 0) {
          this.page = 0
        }
      },
      openModal(status) {
        this.cofirmModal = true
        this.postStatus = status
        switch(status) {
          case 'saved':
            this.message = this.$t('messageModal.sign.temporarySavedConfirm')
            break
          case 'done':
            this.message = this.$t('messageModal.sign.savedConfirm')
            break
          case "reject":
            this.message = this.$t('messageModal.sign.rejectConfirm')
            break
          case "renew":
            this.message = this.$t('messageModal.sign.renewConfirm')
            break
        }
      },
      submitEvent() {
        switch(this.postStatus) {
          case 'saved':
            this.addSign(true)
            break
          case 'done':
            this.addSign(false)
            break
          case "reject":
            this.rejectSign()
            break
          case "renew":
            this.renewSign()
            break
        }
      },
      closeModal() {
        this.cofirmModal = false
      },
    },
    mounted() {
      this.checkUrlParams()
      this.getSign()
    }
  }
</script>

<style>
  .document-contents p {
    margin-left: 1rem;
    text-indent: -1rem
  }

  h2 > .v-card__title {
    word-break: break-word;
  }

  .invisible-btn {
    visibility:hidden;
  }

  .required {
    color: red;
    font-size: 0.625rem;
  }
  .transparent {
    visibility: hidden;
  }
  .editOnly {
    display: var(--display);
  }

</style>
