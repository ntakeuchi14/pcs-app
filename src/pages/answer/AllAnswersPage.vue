<template>
  <div>
    <PageTitle>{{$t('menu.allAnswers')}}</PageTitle>
    <div id="serchBox" v-if="isAdmin" class="mt-10 mb-10">
      <div id="serchForm">
        <v-row>
          <v-col cols="2">
            <v-subheader>{{$t('answer.conditions.freeword')}}</v-subheader>
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="keyword" outlined dense :placeholder="$t('message.enterFreewords')" :maxlength="refConst.FORM.MAX_LENGTH" autocomplete="new-password"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-subheader>{{$t('answer.conditions.status')}}</v-subheader>
          </v-col>
          <v-col cols="6">
            <v-select v-model="status" :items="answerStatusItems" :placeholder="$t('common.status')" outlined dense></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-subheader>{{$t('answer.conditions.companyName')}}</v-subheader>
          </v-col>
          <v-col cols="6">
            <CompanyComboBox @select="selectCompany" :multiple="false" :dense="true" :rules="[true]" :singleLine="true" :companyCode.sync="companyCode" :returnObject="false" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-subheader>{{$t('answer.conditions.implNo')}}</v-subheader>
          </v-col>
          <v-col cols="6">
            <QuestionComboBox @select="selectImplNo" :multiple="false" :implNo.sync="implNo" :label="$t('answer.conditions.implNo')" :placeholder="$t('message.selectImplNo')" :single-line="true" :dense="true" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-subheader>{{$t('answer.conditions.revision')}}</v-subheader>
          </v-col>
          <v-col cols="6">
            <v-autocomplete v-model="revisionNo" :items="revisionItems" item-text="title" item-value="revisionNo" :label="$t('answer.conditions.revision')" :placeholder="$t('message.selectRevisionNo')" outlined dense @change="selectRevision" :disabled="revisonDisable" single-line autocomplete="new-password">
              <template v-slot:item="data">
                <v-row justify="start">
                    <v-col cols="auto">
                        <span class="grey--text">{{ data.item.revisionNo }}</span>
                    </v-col>
                    <v-col cols="auto" class="d-inline-block text-truncate " style="max-width: 900px;">
                        <span>{{ data.item.title }}
                        </span>
                    </v-col>
                </v-row>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <div id="serchButtons">
          <v-row align="center" justify="end">
            <v-col cols="auto">
              <v-btn depressed @click="executeSearch" color="primary">
                {{$t('answer.actions.search')}}
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn depressed @click="executeReset" color="primary">
                {{$t('answer.actions.reset')}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row align="center" justify="end">
            <v-col cols="auto">
              <v-btn depressed @click="answersCsvDownload" color="primary" :disabled="answerCsvDisable" :loading="csvLoading">
                {{$t('answer.actions.csv')}}
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>

    <div class="notice-box" v-if="!commentDisable" v-html="$t('answer.annotation')"/>

    <div class="mt-16">
      <v-data-table :items="indexedItems" :headers="answerHeaders" class="row-pointer" hide-default-footer disable-pagination :no-data-text="$t('message.nodata')" @click:row="clickAnswerRow" :loading="answerLoading" :loading-text="$t('message.loading')" :must-sort="isAdmin" :options.sync="options" :page.sync="page" :items-per-page="perPage" :server-items-length="allCount">
        <template v-slot:item.num="{ item }">
          {{ item.id }}
        </template>
        <template v-slot:item.implNo="{ item }">
          <span>{{ item.implNo }}</span><br>
          <span class="d-inline-block text-truncate" :style="getWidth">{{ isJp ? item.title : item.titleEn }}</span>
        </template>
        <template v-slot:item.status="{ item }">
          <span :class="getAnswerStatusColor(item.status)">{{ getAnswerStatus(item.status) }}</span>
        </template>
        <template v-slot:item.revisionNo="{ item }">
          <span>{{ item.revisionNo }}</span><br>
          <span class="d-inline-block text-truncate" :style="getWidth">{{ isJp ? item.revisionTitle : item.revisionTitleEn }}</span>
        </template>
         <template v-slot:item.gdbCode="{ item }">
          <span>{{ item.gdbCode }}</span><br>
          <span class="d-inline-block text-truncate" style="max-width: 200px;">{{ item.companyName }}</span>
        </template>
        <template v-slot:item.historyNo="{ item }">
          <span>{{ item.historyNo }}</span><br>
          <span class="d-inline-block text-truncate" style="max-width: 200px;">{{ isAdmin ? item.reason : '' }}</span>
        </template>
        <template v-slot:item.startDate="{ item }">
            {{ item.startDate }}~{{ item.endDate }}
        </template>
      </v-data-table>
    </div>
    <template v-if="isAdmin">
      <PageCount v-if="allCount" :allCount="allCount" :currentPageCount="currentPageCount" />
      <div class="mt-5">
        <v-row justify="center">
          <v-pagination v-model="page" :length="pageCount" :total-visible="7"></v-pagination>
        </v-row>
      </div>
    </template>
  </div>
</template>
<script>
  import PageTitle from '@/components/parts/PageTitle'
  import CompanyComboBox from '@/components/modules/CompanyComboBox.vue'
  import QuestionComboBox from '@/components/modules/QuestionComboBox.vue'
  import PageCount from '@/components/parts/PageCount.vue'

  import { API } from "aws-amplify";
  import * as Const from '@/const.js'

  const apiName = 'PcsAPI';

  export default {
    name: 'AnswerList',
    components: {
      PageTitle,
      CompanyComboBox,
      QuestionComboBox,
      PageCount,
    },
    data() {
      const params = this.$store.getters.getSearchParams.answers
      if (params && params.implNo) {
        if(this.$store.getters.isAdmin)
          this.selectImplNo(params.implNo)
      }
      return {
        answers: [],
        revisonDisable: params ? params.revisonDisable : true,
        isScroll: false,
        answerLoading: true,
        answerCsvDisable: params && params.revisionNo ? false : true,
        commentDisable: params && params.revisionNo ? false : true,
        csvLoading: false,
        options: {
          sortBy: params ? params.sortBy : ["lastUpdateDate"],
          sortDesc: params ? params.sortDesc : [true],
          page: params ? params.page : 1,
        },
        allCount: 0,
        page: params ? params.page : 1,
        keyword: params ? params.keyword : '',
        status: params ? params.status : null,
        companyCode: params ? params.companyCode : null,
        implNo: params ? params.implNo : null,
        revisionNo: params ? params.revisionNo : null,
        revisionItems: params ? this.revisionItems : [],
      }
    },
    computed: {
      refConst() {
        return Const
      },
      answerHeaders() {
        if (this.isAdmin) {
          return [{
              text: 'No',
              align: 'start',
              sortable: false,
              value: 'num',
              width: '5%',
            },
            {
              text: this.$t('answer.headers.requestDate'),
              align: 'start',
              sortable: this.isSortable,
              value: 'requestDate',
              width: '10%',
            },
            {
              text: this.$t('answer.headers.lastUpdateDate'),
              align: 'start',
              sortable: this.isSortable,
              value: 'lastUpdateDate',
              width: '10%',
            },
            { 
              text: this.$t('answer.headers.startDate'), 
              align: 'start',
              sortable: this.isSortable,
              value: 'startDate',
              width: '10%'
            },
            {
              text: this.$t('answer.headers.companyCode'),
              align: 'start',
              sortable: this.isSortable,
              value: 'gdbCode',
              width: '15%',
            },
            {
              text: this.$t('answer.headers.implNo'),
              align: 'start',
              sortable: this.isSortable,
              value: 'implNo',
              width: '15%',
            },
            {
              text: this.$t('answer.headers.revisionNo'),
              align: 'start',
              sortable: this.isSortable,
              value: 'revisionNo',
              width: '15%',
            },
            {
              text: this.$t('answer.headers.historyNo'),
              align: 'start',
              sortable: this.isSortable,
              value: 'historyNo',
              width: '10%',
            },
            {
              text: this.$t('answer.headers.status'),
              align: 'start',
              sortable: this.isSortable,
              value: 'status',
              width: '10%',
            },
          ]
        } else {
          return [{
              text: 'No',
              align: 'start',
              sortable: false,
              value: 'num',
              width: '5%',
            },
            {
              text: this.$t('answer.headers.requestDate'),
              align: 'start',
              sortable: this.isSortable,
              value: 'requestDate',
              width: '10%',
            },
            {
              text: this.$t('answer.answeredDate'),
              align: 'start',
              sortable: this.isSortable,
              value: 'answeredAt',
              width: '20%',
            },
            {
              text: this.$t('answer.headers.implNo'),
              align: 'start',
              sortable: this.isSortable,
              value: 'implNo',
              width: '20%',
            },
            {
              text: this.$t('answer.headers.revisionNo'),
              align: 'start',
              sortable: this.isSortable,
              value: 'revisionNo',
              width: '20%',
            },
            {
              text: this.$t('answer.headers.historyNo'),
              align: 'start',
              sortable: this.isSortable,
              value: 'historyNo',
              width: '10%',
            },
            {
              text: this.$t('answer.headers.status'),
              align: 'start',
              sortable: this.isSortable,
              value: 'status',
              width: '10%',
            },
          ]
        }
      },
      perPage() {
        if (this.isAdmin) {
          return this.refConst.ANSWER.ADMIN_INDEX_PER_PAGE
        }
        else {
          return this.refConst.ANSWER.NORMAL_INDEX_MAX_COUNT
        }
      },
      indexedItems() {
        return this.answers.map((item, index) => ({
          id: (this.page - 1) * this.perPage + index + 1,
          ...item
        }))
      },
      currentPageCount() {
        const start = this.perPage * (this.page - 1) + 1
        let end = null
        if (this.perPage * this.page <= this.allCount) {
          end = this.perPage * this.page
        }
        else {
          end = this.perPage * (this.page - 1) + this.allCount % this.perPage
        }
        return this.stringFormat(this.$t('pagination.formatBetween'), start, end)
      },
      pageCount() {
        return Math.ceil(this.allCount / this.perPage)
      },
      isSortable() {
        return this.isAdmin
      },
      getWidth() {
        if (this.isAdmin) {
          return "max-width: 200px;"
        } else {
          return "max-width: 350px;"
        }
      },
    },
    mounted() {
      this.$watch('options', function() {
        this.getAnswers()
      }, {
        deep: true,
        immediate: true
      })
    },
    methods: {
      selectCompany(companyCode) {
        this.companyCode = companyCode
      },
      async getAnswers() {
        this.answerLoading = true
        const { sortBy, sortDesc, page, itemsPerPage } = this.options
        const path = '/answer/search'
        let myInit = {
          queryStringParameters: {
            sortBy: sortBy[0],
            sortDesc: sortDesc[0],
            page: page,
            itemsPerPage: itemsPerPage,
            keyword: this.keyword,
          }
        }
        if (!this.isAdmin) {
          myInit.queryStringParameters.pastFlg = true
        }
        if (this.status != null) {
          myInit.queryStringParameters.status = this.status
        }
        if (this.companyCode) {
          myInit.queryStringParameters.companyCode = this.companyCode
        }
        if (this.implNo) {
          myInit.queryStringParameters.implNo = this.implNo
        }
        if (this.revisionNo) {
          myInit.queryStringParameters.revisionNo = this.revisionNo
        }

        await API
          .get(apiName, path, myInit)
          .then(response => {
            this.answers = response.data
            this.allCount = response.allCount
            this.$store.dispatch('setSearchParams', {
              path: 'answers',
              answers: {
                keyword: this.keyword,
                status: this.status,
                companyCode: this.companyCode,
                implNo: this.implNo,
                revisionNo: this.revisionNo,
                page: this.page,
                sortBy: sortBy,
                sortDesc: sortDesc,
                revisonDisable: this.revisonDisable,
              }
            })
          })
          .finally(() => {
            this.answerLoading = false
            this.csvLoading = false
          });
      },
      clickAnswerRow(item) {
        if (this.isAdmin) {
          this.$router.push({ name: 'answerAdmin', params: { impl_no: item.implNo, company_code: item.companyCode, history_no: item.historyNo } })
        }
        else {
          this.$router.push({ name: 'answer', params: { impl_no: item.implNo, history_no: item.historyNo } })
        }

      },
      executeSearch() {
        this.options.page = 1
        this.options.sortBy[0] = 'lastUpdateDate'
        this.options.sortDesc[0] = true

        this.getAnswers()
      },
      async executeReset() {
        this.keyword = null
        this.status = null
        this.companyCode = null
        this.implNo = null
        this.revisonDisable = true
        this.revisionNo = null
        this.options.page = 1
        this.options.sortBy[0] = 'lastUpdateDate'
        this.options.sortDesc[0] = true
        this.answerCsvDisable = true
        this.commentDisable = true
        this.csvLoading = false

        this.getAnswers()
      },
      async selectImplNo(implNo) {

        this.implNo = implNo

        this.revisonDisable = true
        this.revisionNo = null
        this.answerCsvDisable = true
        this.commentDisable = true
        this.csvLoading = false
        this.revisionItems = []

        if(this.implNo) {
          await API
            .get(apiName, '/question/revisions', {
            queryStringParameters: {
              implNo: this.implNo
            },
          })
            .then(function(response) {
              this.revisonDisable = false
              this.revisionItems = response.data.map(e=>({
                revisionNo: e.revisionNo,
                title: e.title
              }))
            }.bind(this))
        }
      },
      async selectRevision(revisionNo) {
        this.revisionNo = revisionNo
        this.answerCsvDisable = false
        this.commentDisable = false
        this.csvLoading = false
      },
      async answersCsvDownload() {
        this.csvLoading = true
        this.answerCsvDisable = true
        const { sortBy, sortDesc } = this.options
        let answers = []
        const path = '/answer/csv'
        const myInit = {
          queryStringParameters: {
            keyword: this.keyword,
            sortBy: sortBy[0],
            sortDesc: sortDesc[0],
            page: 1,
            itemsPerPage: this.refConst.CSV.ANSWERS_PER_PAGE,
            isWithHeader: false,
          }
        }

        if (this.status) {
          myInit.queryStringParameters.status = this.status
        }
        if (this.companyCode) {
          myInit.queryStringParameters.companyCode = this.companyCode
        }
        if (this.implNo) {
          myInit.queryStringParameters.implNo = this.implNo
        }
        if (this.revisionNo) {
          myInit.queryStringParameters.revisionNo = this.revisionNo
        }

        const b = true
        while (b) {

          const result = await API
            .get(apiName, path, myInit)
            .then(response => {
              return response
            })

          result.data.forEach((_) => answers.push(_))

          if (myInit.queryStringParameters.itemsPerPage * myInit.queryStringParameters.page >= result.allCount) {
            break
          }

          myInit.queryStringParameters.page++
          myInit.queryStringParameters.isWithHeader = false
        }

        // 該当アンケートのフォーマット取得
        const excelRsp = await API.get(apiName, '/question/excel', { queryStringParameters: { implNo: this.implNo, revisionNo: this.revisionNo } });
        const excelBlob = await fetch(this.refConst.BASE64_HEADER + excelRsp.file).then(response => response.blob())
        const excelBuf = await excelBlob.arrayBuffer();
        const header = await this.getExcelDataForCsv(excelBuf, "ref-csv-header");

        // 共通のヘッダ
        const commonHeaders = [
          { text: this.$t('answer.csvHeaders.implNo'), value: "implNo" },
          { text: this.$t('answer.csvHeaders.title'), value: this.isJp ? "title":"titleEn" },
          { text: this.$t('answer.csvHeaders.revisionNo'), value: "revisionNo" },
          { text: this.$t('answer.csvHeaders.companyCode'), value: "gdbCode" },
          { text: this.$t('answer.csvHeaders.companyName'), value: "companyName" },
          { text: this.$t('answer.csvHeaders.historyNo'), value: "historyNo" },
          { text: this.$t('answer.csvHeaders.startDate'), value: "startDate" },
          { text: this.$t('answer.csvHeaders.endDate'), value: "endDate" },
          { text: this.$t('answer.csvHeaders.status'), value: "status" },
          { text: this.$t('answer.csvHeaders.answeredAt'), value: "answeredAt" },
          { text: this.$t('answer.csvHeaders.lastUpdateUser'), value: "lastUpdateUser" },
          { text: this.$t('answer.csvHeaders.lastUpdateUserAddress'), value: "lastUpdateUserAddress" },
          { text: this.$t('answer.csvHeaders.lastUpdateDate'), value: "lastUpdateDate" },
        ];

        // データマッピング用のCSVヘッダ
        let mappingHeaders = [];
        mappingHeaders = mappingHeaders.concat(commonHeaders);
        header[header.length - 1].forEach((_, i) => {
          mappingHeaders.push({ text: `csvrow${i}`, value: `csvrow${i}` })
        })

        // 置き換え用の複数行ヘッダ（下詰め）
        let replaceHeaders = [];
        header.forEach((h, i) => {
          if (i === header.length - 1) {
            replaceHeaders.push(commonHeaders.map(_ => _.text).concat(h))
          }
          else {
            replaceHeaders.push(Array.apply(null, new Array(commonHeaders.length)).map(String.prototype.valueOf, '').concat(h))
          }
        })

        // CSVデータ部作成
        const csvData = [];
        answers.forEach(row => {
          row.status = this.getAnswerStatus(row.status)
          const ans = JSON.parse(row.answer)
          if (ans) {
            ans.forEach((col, i) => {
              row[`csvrow${i}`] = col
            })
          }
          csvData.push(row);
        })

        // CSV出力
        const impl = (await API.get(apiName, '/question', {})).data.filter(_ => _.impl_no === this.implNo)[0];
        const date = this.$moment().format(Const.DATE.FORMAT_D);
        this.csvDownload(csvData, mappingHeaders, `${this.implNo}_${this.isJp ? impl.title : impl.titleEn}_${this.revisionNo}_${date}.csv`, false, replaceHeaders)
        
        this.answerCsvDisable = false
        this.csvLoading = false
      },
    },
  }
</script>

<style scoped>
  .row-pointer>>>tbody tr :hover {
    cursor: pointer;
  }

  .row-pointer>>>tbody .v-data-table__empty-wrapper :hover {
    cursor: default;
  }

  .table-scroll {
    max-height: 250px;
    overflow-y: auto
  }

  #serchBox {
    padding: 1em 1em;
    color: #6091d3;
    background: #FFF;
    border: solid 3px #1A237E;
    border-radius: 10px;
  }

  .notice-box {
    padding: 1em 1em;
    margin: 0 0 0 auto;
    color: #6091d3;
    background: #FFF;
    border: solid 3px #1A237E;
    border-radius: 10px;
    width: 500px;
    text-align: left;
  }
</style>>
