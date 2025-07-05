<template>
    <div>
      <PageTitle>{{$t('menu.dashboard')}}</PageTitle>
      <div class="mt-16" v-if="checkSystemAdmin()">
        <div class="post">
          <input type="file" v-on:click="open" v-on:change="onFileChange" accept="text/*,.xlsx" />
          <v-textarea
            v-model="csvHeader"
            solo
            flat
            outlined
            no-resize
            auto-grow
          ></v-textarea>
        </div>
      </div>
      <div class="mt-10" v-if="!isAdmin">
        <v-row>
          <v-card-title class="font-weight-bold">
            <v-icon color="primary" class="mr-1">mdi-square-medium</v-icon>
            <span>{{$t('menu.information')}}</span>
          </v-card-title>
          <v-spacer></v-spacer>
          <v-col
            cols="auto"
            class="pr-6"
          >
            <v-icon color="grey" size="15px">mdi-greater-than</v-icon>
            <v-btn
              text
              color="indigo darken-4"
              class="px-0 text-link"
              :to="{ name: 'informations' }"
            >{{$t('menu.informations')}}</v-btn>
          </v-col>
        </v-row>
        <v-data-table
          :headers="informationsHeaders"
          :items="informations.items"
          class="row-pointer"
          hide-default-footer
          disable-pagination
          disable-sort
          :no-data-text="$t('message.nodataInformation')"
          @click:row="clickInformationRow"
          :loading="informationLoading"
          :loading-text="$t('message.loading')"
        >
          <template v-slot:item.data.title="{ item }">
            <span 
              class="d-inline-block text-truncate"
              style="max-width: 950px;"
            >
              <template>{{isJp ? item.data.title : item.data.titleEn ? item.data.titleEn : item.data.title}}</template>
            </span>
          </template>
          <template v-slot:item.pdfDownloadBtn="{ item }">
            <InformationDownload :item="item"/>
          </template>
        </v-data-table>
      </div>

      <div class="mt-16" v-if="!isAdmin">
        <v-row>
          <v-card-title class="font-weight-bold">
            <v-icon color="primary" class="mr-1">mdi-square-medium</v-icon>
            <span>{{$t('dashboard.emptySign')}}</span>
          </v-card-title>
          <v-spacer></v-spacer>
            <v-col
              cols="auto"
            >
              <v-icon color="grey" size="15px">mdi-greater-than</v-icon>
              <v-btn
                text
                color="indigo darken-4"
                class="px-0 text-link"
                :to="{ name: 'signs' }"
              >{{$t('menu.signs')}}</v-btn>
            </v-col>
        </v-row>
        <v-data-table
          :fixed-header="signs.items.length > refConst.SIGN.DASHBOARD_MAX_COUNT ? true : false"
          :headers="signsHeaders"
          :items="signs.items"
          class="row-pointer"
          hide-default-footer
          disable-pagination
          disable-sort
          :no-data-text="$t('message.nodataSign')"
          @click:row="clickSingRow"
          :loading="signLoading"
          :loading-text="$t('message.loading')"
        >
          <template v-slot:item.status="{ item }">
            <span :class="getSignStatusColor(item.status)">{{ getSignStatus(item.status) }}</span>
          </template>
          <template v-slot:item.title="{ item }">
            <span 
              class="d-inline-block text-truncate"
              style="max-width: 800px;"
            >{{ item.title }}</span>
          </template>
        </v-data-table>
      </div>
      
      <div class="mt-16" v-if="!isAdmin && isJp">
        <v-row>
          <v-card-title class="font-weight-bold">
            <v-icon color="primary" class="mr-1">mdi-square-medium</v-icon>
            <span>{{$t('dashboard.emptyAnswer')}}</span>
          </v-card-title>
          <v-spacer></v-spacer>
            <v-col
              cols="auto"
            >
              <v-icon color="grey" size="15px">mdi-greater-than</v-icon>
              <v-btn
                text
                color="indigo darken-4"
                class="px-0 text-link"
                :to="{ name: 'allAnswers' }"
              >{{$t('menu.allAnswers')}}</v-btn>
            </v-col>
        </v-row>
        <v-data-table
          :fixed-header="answers.items.length > refConst.ANSWER.DASHBOARD_MAX_COUNT ? true : false"
          :headers="answerHeaders"
          :items="answers.items"
          class="row-pointer"
          hide-default-footer
          disable-pagination
          disable-sort
          :no-data-text="$t('message.nodataAnswer')"
          @click:row="clickAnswerRow"
          :loading="answerLoading"
          :loading-text="$t('message.loading')"
        >
          <template v-slot:item.period="{ item }">
            <span>{{ item.startDate }}</span>
            <span> - </span>
            <span>{{ item.endDate }}</span>
          </template>
          <template v-slot:item.title="{ item }">
            <span 
              class="d-inline-block text-truncate"
              style="max-width: 800px;"
            >{{ item.title }}</span>
          </template>
          <template v-slot:item.status="{ item }">
            <span :class="getAnswerStatusColor(item.status)">{{ getAnswerStatus(item.status) }}</span>
          </template>
        </v-data-table>
      </div>
    </div>
</template>
<script>
  import PageTitle from '@/components/parts/PageTitle'
  import InformationDownload from '@/components/modules/InformationDownload.vue'
  import * as Const from '@/const.js'

  const apiName = 'PcsAPI';

  export default {
    name: 'DashboardPage',
    components: {
      PageTitle,
      InformationDownload,
    },
    data() {
        return {
          informations: {
            items: [],
          },
          signs: {
            items: []
          },
          answers: {
            items: []
          },
          isScroll: false,
          informationLoading: true,
          signLoading: true,
          answerLoading: true,
          csvHeader: '',
        }
    },
    computed: {
      refConst() {
        return Const
      },
      informationsHeaders() {
        return [
          {
            text: this.$t('dashboard.informationsHeaders.releaseDate'),
            align: 'start',
            sortable: false,
            value: 'data.releaseDate',
            width: '15%',
          },
          { 
            text: this.$t('dashboard.informationsHeaders.title'),
            align: 'start',
            sortable: false,
            value: 'data.title',
            width: '45%',
          },
          { 
            text: this.$t('dashboard.informationsHeaders.pdfDownloadBtn'),
            align: 'start',
            value: 'pdfDownloadBtn',
            sortable: false,
            width: '45%',
          },
        ]
      },
      signsHeaders() {
        return [
          {
            text: this.$t('dashboard.signsHeaders.releaseDate'),
            align: 'start',
            sortable: false,
            value: 'requestDate',
            width: '15%',
          },
          { 
            text: this.$t('dashboard.signsHeaders.title'),
            align: 'start',
            sortable: false,
            value: this.isJp ? 'title' : 'titleEn',
            width: '70%',
          },
          { 
            text: this.$t('dashboard.signsHeaders.status'),
            align: 'start',
            sortable: false,
            value: 'status',
            width: '15%',
          },
        ]
      },
      answerHeaders() {
        return [
          {
            text: this.$t('dashboard.answerHeaders.period'),
            align: 'start',
            sortable: false,
            value: 'period',
            width: '20%',
          },
          { 
            text: this.$t('dashboard.answerHeaders.title'),
            align: 'start',
            sortable: false,
            value: this.isJp ? 'title' : 'titleEn',
            width: '65%',
          },
          { 
            text: this.$t('dashboard.answerHeaders.status'),
            align: 'start',
            sortable: false,
            value: 'status',
            width: '15%',
          },
        ]
      },
      selectedCompanyCode() {
        return this.$store.state.selectedCompanyCode
      }
    },
    mounted() {
      if (!this.isAdmin && this.selectedCompanyCode ) {
        this.getSigns()
        this.getInformations()
        this.getAnswers()
      }
    },
    watch: {
      selectedCompanyCode() {
        if (!this.isAdmin && this.selectedCompanyCode ) {
          this.getSigns()
          this.getInformations()
          this.getAnswers()
        }
      }
    },
    methods: {
      async getSigns() {
        const path = '/sign/search'
        const myInit = {
          queryStringParameters: {
            status:[
              this.refConst.SIGN.STATUS.NOT_ENTERD, 
              this.refConst.SIGN.STATUS.TEMPORARY_SAVED
            ], 
            sortBy: "requestDate",
            sortDesc: false,
            page: 1,
            itemsPerPage: this.refConst.SIGN.DASHBOARD_MAX_COUNT,
          }
         }
         await this.apiGet(apiName, path, myInit)
           .then(response => {
             this.signs.items = response.data
           })
           .finally(() => {
               this.signLoading = false
           });
      },
      async getInformations() {
        const path = '/information/search'
        const myInit = {
          queryStringParameters: {
            sortBy: "releaseDate",
            sortDesc: true,
            page: 1,
            itemsPerPage: this.refConst.INFORMATION.DASHBOARD_MAX_COUNT,
          }
         }
         await this.apiGet(apiName, path, myInit)
           .then(response => {
             this.informations.items = response.data
           })
           .finally(() => {
             this.informationLoading = false
           });
      },
      async getAnswers() {
        const path = '/answer/search'
        const myInit = {
          queryStringParameters: {
            status: 
              [
                this.refConst.ANSWER.STATUS.NOT_ENTERD,
                this.refConst.ANSWER.STATUS.TEMPORARY_SAVED
              ],
            sortBy: "endDate",
            sortDesc: false,
            page: 1,
            itemsPerPage: this.refConst.ANSWER.DASHBOARD_MAX_COUNT,
          }
         }
         await this.apiGet(apiName, path, myInit)
           .then(response => {
             this.answers.items = response.data
           })
           .finally(() => {
             this.answerLoading = false
           });
      },
      clickInformationRow(item) {
        this.$router.push({ name: 'information', params: { information_id: item.key.informationId } })
      },
      clickSingRow(item) {
        this.$router.push({ name: 'sign', params: { impl_no: item.implNo } })
      },
      clickAnswerRow(item) {
        this.$router.push({ name: 'answer', params: { impl_no: item.implNo, history_no: item.historyNo } })
      },
      open(e){
        e.target.value='';
      },
      async onFileChange(event) {
        const file = event.target.files[0];
        if (!file) {
          return false;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
          this.csvHeader = JSON.stringify((await this.getExcelDataForCsv(e.target.result, "ref-csv-header")), null, 2);
        };
        reader.readAsArrayBuffer(file);
      },
      checkSystemAdmin() {
        return this.isAdmin && '' === this.currentCompanyCode;
      },
    }
  }
</script>

<style scoped>
  .row-pointer >>> tbody tr :hover {
    cursor: pointer;
  }
  .row-pointer >>> tbody .v-data-table__empty-wrapper  :hover {
    cursor: default;
  }
  .table-scroll {
    max-height: 250px; 
    overflow-y: auto
  }
</style>>