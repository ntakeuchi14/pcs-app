<template>
  <div>
    <PageTitle>{{ informationPageTitle }}</PageTitle>
    <v-container>
      <v-row v-if="isUpdate && isAdmin">
        <v-col class="text-right">
          {{$t('information.headers.informationId')}}: {{ key.informationId }}
        </v-col>
      </v-row>
      <v-form v-model="isFormValid">
        <v-row class="mt-5">
          <v-col cols="4" md="3">
            <v-subheader
              class="font-weight-bold"
            >{{$t('information.headers.releaseDate')}}
              <RequiredItemChip 
                v-if="isAdmin"
              />
            </v-subheader>
          </v-col>
          <v-col cols="8">
            <v-text-field
              v-model="releaseDateFormatted"
              solo
              flat
              outlined
              :readonly="!isAdmin"
              @blur="item.releaseDate = parseDate(releaseDateFormatted)"
              :placeholder="datePlaceholder"
              :maxlength="refConst.FORM.DATE_MAX_LENGTH"
              :rules="[required, checkDateFormat]"
              autocomplete="new-password"
            >
              <template v-slot:append-outer>
                <DatePicker 
                  v-model="item.releaseDate"
                  :isAdmin="isAdmin"
                  :inputDate="item.releaseDate"
                />
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row 
          class="mt-5"
          v-if="isAdmin"
        >
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.headers.startDate')}}
              <RequiredItemChip 
              />
            </v-subheader>
          </v-col>
          <v-col cols="8" class="p-0">
            <v-row>
              <v-col cols="5" class="p-0">
                <v-text-field
                  v-model="startDateFormatted"
                  solo
                  flat
                  outlined
                  :disabled="!isAdmin"
                  @blur="item.startDate = parseDate(startDateFormatted)"
                  :placeholder="datePlaceholder"
                  :rules="[required, checkDateFormat]"
                  :maxlength="refConst.FORM.DATE_MAX_LENGTH"
                  autocomplete="new-password"
                >
                  <template v-slot:append-outer>
                    <DatePicker 
                      v-model="item.startDate"
                      :isAdmin="isAdmin"
                      :inputDate="item.startDate"
                    />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="2" class="pt-5">
                <p class="text-h6">~</p>
              </v-col>
              <v-col cols="5" class="">
                <v-text-field
                  v-model="endDateFormatted"
                  solo
                  flat
                  outlined
                  :disabled="!isAdmin"
                  @blur="item.endDate = parseDate(endDateFormatted)"
                  :placeholder="datePlaceholder"
                  :rules="[required, checkDateFormat]"
                  :maxlength="refConst.FORM.DATE_MAX_LENGTH"
                  autocomplete="new-password"
                >
                  <template v-slot:append-outer>
                    <DatePicker 
                      v-model="item.endDate"
                      :isAdmin="isAdmin"
                      :inputDate="item.endDate"
                    />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        
        <!-- title -->
        <v-row class="mt-5" v-if="!isAdmin">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.headers.title')}}
            </v-subheader>
          </v-col>
          <v-col class="mt-5 text-md-left" cols="8">
            {{isJp ? item.title : item.titleEn ? item.titleEn : item.title}}
          </v-col>
        </v-row>
        <v-row class="mt-5" v-if="isAdmin">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.headers.titleJp')}}
              <RequiredItemChip/>
            </v-subheader>
          </v-col>
          <v-col cols="8">
            <v-text-field
              v-model="item.title"
              solo
              flat
              outlined
              :readonly="!isAdmin"
              :rules="[required]"
              :maxlength="refConst.FORM.MAX_LENGTH"
              autocomplete="new-password"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row class="mt-5" v-if="isAdmin">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.headers.titleEn')}}
            </v-subheader>
          </v-col>
          <v-col cols="8">
            <v-text-field
              v-model="item.titleEn"
              solo
              flat
              outlined
              :maxlength="refConst.FORM.MAX_LENGTH"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <!-- contents -->
        <v-row class="mt-5" v-if="!isAdmin">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.csvHeaders.contents')}}
            </v-subheader>
          </v-col>
          <v-col class="mt-5 text-md-left" cols="8">
            <v-textarea
              v-model="itemContents"
              solo
              flat
              no-resize
              auto-grow
              :readonly="!isAdmin"
              :rules="[required]"
              :maxlength="refConst.FORM.CONTENTS_MAX_LENGTH"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row class="mt-5" v-if="isAdmin">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.csvHeaders.contentsJp')}}
              <RequiredItemChip/>
            </v-subheader>
          </v-col>
          <v-col cols="8">
            <v-textarea
              v-model="item.contents"
              solo
              flat
              outlined
              no-resize
              auto-grow
              :readonly="!isAdmin"
              :rules="[required]"
              :maxlength="refConst.FORM.CONTENTS_MAX_LENGTH"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row class="mt-5" v-if="isAdmin">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.csvHeaders.contentsEn')}}
            </v-subheader>
          </v-col>
          <v-col cols="8">
            <v-textarea
              v-model="item.contentsEn"
              solo
              flat
              outlined
              no-resize
              auto-grow
              :maxlength="refConst.FORM.CONTENTS_MAX_LENGTH"
            ></v-textarea>
          </v-col>
        </v-row>
        
        <v-row v-if="isAdmin" align="center">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">
              {{$t('information.csvHeaders.allCompaniesCheck')}}
            </v-subheader>
          </v-col>
          <div class="ml-2">
            <v-checkbox
              v-model="selectedAll"
            ></v-checkbox>
          </div>
        </v-row>
        <div v-if="isAdmin" class="company-box">
          <v-row v-show="visibleCombo">
            <v-col cols="4" md="3">
              <v-subheader class="font-weight-bold">{{$t('information.headers.companyName')}}</v-subheader>
            </v-col>
            <v-col cols="8">
              <CompanyComboBox 
                @select="selectCompanyObject" 
                :multiple="true" 
                :dense="false"
                :singleLine="true"
                :companyCode.sync="item.companies"
                :returnObject="true"
                :selectRules="[true]"
                :paste="true"
              />
            </v-col>
          </v-row>
        </div>
        <v-row v-if="!isAdmin && item.isAttach===1" align="center">
          <v-col cols="4" md="3">
            <v-subheader class="font-weight-bold">{{$t('information.csvHeaders.filename')}}</v-subheader>
          </v-col>
          <InformationDownload v-if="!isAdmin" :item="informationModel"/>
        </v-row>
      </v-form>
      <div id="executeButtons" v-if="isAdmin">
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn depressed v-on:click="pushInformations()" color="primary">
                {{$t('common.cancel')}}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <CreateButtonWithModal
            v-if="isAdmin"
              ref="createButtonWithModal"
              @create="submitEvent"
              @validate="validateInputs"
            :buttonName="buttonName"
              :modalMessage="modalMessage"
              :valid='!isDisabled'
            />
        </v-col>
      </v-row>
      </div>
      <div class="mt-10" v-else>
        <ReturnIndexButton 
          :path="path"
        />
      </div>
    </v-container>
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
  import RequiredItemChip from '@/components/parts/RequiredItemChip.vue'
  import Overlay from '@/components/parts/Overlay'
  import CompanyComboBox from '@/components/modules/CompanyComboBox.vue'
  import DatePicker from '@/components/modules/DatePicker'
  import { API, Hub } from "aws-amplify"
  import * as Const from '@/const.js'
  import ReturnIndexButton from '@/components/parts/ReturnIndexButton'
  import CreateButtonWithModal from '@/components/modules/CreateButtonWithModal.vue'
  import InformationDownload from '@/components/modules/InformationDownload.vue'


  const apiName = 'PcsAPI'

  export default {
    name: 'InformationPage',
    components: {
      PageTitle,
      RequiredItemChip,
      Overlay,
      CompanyComboBox,
      ReturnIndexButton,
      DatePicker,
      CreateButtonWithModal,
      InformationDownload,
    },
    data(vm) {
      return {
        item:{
          releaseDate: '',
          startDate: '',
          endDate: '',
          title: '',
          contents: '',
          companies: [],
        },
        key: {
          informationId: null,
          version: null,
        },
        menu: false,
        path: '/information',
        releaseDateFormatted: vm.formatDate(),
        startDateFormatted: vm.formatDate(),
        endDateFormatted: vm.formatDate(),
        overlay: false,
        snackbarMessage: '',
        snackbarSucceed: false,
        snackbarFailed: false,
        disabled: false,
        visibleCombo: true,
        isFormValid: false,
        required: function(val) {
          return !!val
        },
        checkDateFormat: function(date) {
          return vm.$moment(date, vm.refConst.DATE.FORMAT).format(vm.refConst.DATE.FORMAT) == date
        },
      }
    },
    computed: {
      refConst() {
        return Const
      },
      informationId() {
        return this.$route.params.information_id
      },
      isUpdate() {
        return this.$route.name === "information"
      },
      informationPageTitle() {
        if( this.isAdmin ) {
          return this.$t('menu.information') + this.$t(this.isUpdate ? "common.edit" : "common.create")
        }
        return this.$t('menu.information')
      },
      selectedAll: {
        cache: false,
        get() {
          const firstCompany =  this.item.companies[0]
          if (firstCompany) {
            return firstCompany.companyCode == 'ALL' ?? false
          }
          else {
            return false
          }
        },
        set(val) {
          this.item.companies.length = 0
          this.visibleCombo = !val
          const selectCompany = {}
          const arr = []
          if (val) {
            selectCompany.companyCode = 'ALL'
            selectCompany.companyName = this.$t('common.allCompanies')
            arr[0] = selectCompany
            this.item['companies'] = arr
          }
          return val
        }
      },
      isDisabled() {
        return !this.isFormValid
      },
      checkDateRange() {
        return !this.$moment(this.item.startDate, this.refConst.DATE.FORMAT).isSameOrBefore(this.item.endDate, this.refConst.DATE.FORMAT)
      },
      buttonName() {
        return this.isUpdate ? this.$t('common.update') : this.$t('common.create')
      },
      modalMessage() {
        return this.isUpdate ? this.$t('messageModal.updatedConfirm') : this.$t('messageModal.createdConfirm') 
      },
      datePlaceholder() {
        return this.$t('common.datePlaceholder')
      },
      informationModel() {
        return {
          key: this.key,
          data: this.item
        }
      },
      itemContents() {
        return this.isJp ? this.item.contents : this.item.contentsEn ? this.item.contentsEn : this.item.contents
      },
    },
     watch: {
      item : {
        handler() {
          this.releaseDateFormatted = this.formatDate(this.item.releaseDate)
          this.startDateFormatted = this.formatDate(this.item.startDate)
          this.endDateFormatted = this.formatDate(this.item.endDate)
        },
        deep: true
      },
    },
    methods: {
      async getInformation() {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        
        const v = this
        const path = '/information'
        const myInit = {
          queryStringParameters: {
            informationId: this.informationId,
          }
        }
        await API
          .get(apiName, path, myInit)
          .then(response => {
            this.item = response.data
            this.key = response.key
            this.item.releaseDate = v.$moment(new Date(response.data.releaseDate)).format(this.refConst.DATE.PICKER_FORMAT)
            this.item.startDate = v.$moment(new Date(response.data.startDate)).format(this.refConst.DATE.PICKER_FORMAT)
            this.item.endDate = v.$moment(new Date(response.data.endDate)).format(this.refConst.DATE.PICKER_FORMAT)
            if (response.data.companies.length) {
              if (response.data.companies[0].companyCode === 'ALL') {
                this.visibleCombo = false
              }
            }
          })
          .finally(()=>{
              Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },
      async addInformation() {
        const { releaseDate, startDate, endDate, title, titleEn, contents, contentsEn, companies } = this.item
        const path = '/information'
        const body = {
          body: {
            releaseDate,
            startDate,
            endDate,
            title,
            contents,
          }
        }
        // 無効な公開期間は弾く
        if (this.checkDateRange) {
          this.snackbarFailed = true
          this.snackbarMessage = this.$t('messageSnackBar.invalidDateRange')
          return
        }
        if(companies.length) {
          body.body.companies = companies
        }
        if(titleEn) {
          body.body.titleEn = titleEn
        }
        if(contentsEn) {
          body.body.contentsEn = contentsEn
        }
        this.overlay = true
        this.disabled = true        
        
        await API
          .post(apiName, path, body)
          .then(() => {
            this.$router.push({ name: 'informations', params: { snackbarState: "success", snackbarMessage: this.$t('messageSnackBar.createSucceed') } })
          })
          .finally(() => {
            this.overlay = false
            this.disabled = false
          })
      },
      async updateInformation() {
        const { releaseDate, startDate, endDate, title, titleEn, contents, contentsEn, companies } = this.item
        const path = '/information'
        const body = {
          body: {
            key: this.key,
            data: {
              releaseDate,
              startDate,
              endDate,
              title,
              contents,
            }
          }
        }
        // 無効な公開期間は弾く
        if (this.checkDateRange) {
          this.snackbarFailed = true
          this.snackbarMessage = this.$t('messageSnackBar.invalidDateRange')
          return
        }
        if (companies.length) {
          body.body.data.companies = companies
        }
        if(titleEn) {
          body.body.data.titleEn = titleEn
        }
        if(contentsEn) {
          body.body.data.contentsEn = contentsEn
        }
        
        this.overlay = true
        this.disabled = true
        
        await API
          .put(apiName, path, body)
          .then(() => {
            this.$router.push({ name: 'informations', params: { snackbarState: "success", snackbarMessage: this.$t('messageSnackBar.updateSucceed') } })
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
          .finally(() => {
            this.overlay = false
            this.disabled = false
          })
      },
      pushInformations() {
        this.$router.push({name: 'informations'});
      },
      validateInputs() {
        this.$refs.createButtonWithModal.openDialog()
      },
      submitEvent() {
        if (this.isUpdate) {
          this.updateInformation()
        }
        else {
          this.addInformation()
        }
      },
      formatDate (date) {
        if (!date) return ''

        const [year, month, day] = date.split('-')
        return `${year}/${month}/${day}`
      },
      parseDate (date) {
        if (!date) return ''
        // yyyy-mm-ddの形式に変換
        const [year, month, day] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      },
      selectCompanyObject(obj) {
        this.item.companies = obj
      },
    },
    mounted() {
      if(this.isUpdate) {
        this.getInformation()
      }
    },

  }
</script>
<style scoped>
.v-input textarea,
.v-input input {
  color: #000 !important  
}

.company-box {
  min-height: 110px;
}

</style>
