<template>
    <div>
      <PageTitle>{{$t('menu.signs')}}</PageTitle>
      <div id="serchBox" v-if="isAdmin" class="mt-10">
        <div id="serchForm">
            <v-row>
                <v-col cols="2">
                  <v-subheader>{{$t('sign.conditions.freeword')}}</v-subheader>
                </v-col>
                <v-col cols="6">
                  <v-text-field 
                    v-model="keyword" 
                    outlined 
                    :placeholder="placehoder"
                    dense
                    :maxlength="refConst.FORM.MAX_LENGTH"
                    autocomplete="new-password"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <v-subheader>{{$t('sign.conditions.status')}}</v-subheader>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="status" 
                  :items="signStatusItems"  
                  item-text="name" 
                  item-value="val" 
                  outlined
                  dense
                  ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <v-subheader>{{$t('sign.conditions.companyName')}}</v-subheader>
              </v-col>
              <v-col cols="6">
                <CompanyComboBox 
                  @select="selectCompany" 
                  :multiple="false" 
                  :dense="true"
                  :rules="[true]"
                  :singleLine="true"
                  :companyCode.sync="companyCode"
                  :returnObject="false"
                />
              </v-col>
            </v-row>
        </div>
        <div id="serchButtons">
          <v-row align="center" justify="end">
            <v-col cols="auto">
              <v-btn depressed @click="executeSearch" color="primary">
                  {{$t('sign.actions.search')}}
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn depressed @click="executeReset" color="primary">
                  {{$t('sign.actions.reset')}}
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
      <div class="mt-5 mr-5" v-if="isAdmin">
         <v-row align="center" justify="end">
           <v-col cols="auto">
             <v-btn depressed @click="signsCsvDownload" color="primary" :loading="csvLoading" :disabled="csvLoading">
                 {{$t('sign.actions.csv')}}
             </v-btn>
           </v-col>
         </v-row>
       </div>
      <div class="mt-10">
        <v-data-table
          :headers="signHeaders"
          :items="indexedItems"
          :options.sync="options"
          :page.sync="page"
          :items-per-page="perPage"
          :server-items-length="allCount"
          class="row-pointer"
          :hide-default-footer=true
          disable-pagination
          :no-data-text="$t('message.nodata')"
          :loading="isLoading"
          @click:row="clickRow"
          :loading-text="$t('message.loading')"
          :must-sort="isAdmin"
        >
          <template v-slot:item.num="{ item }">
            {{ item.id }}
          </template>
          <template v-slot:item.status="{ item }">
            <span :class="getSignStatusColor(item.status)">{{ getSignStatus(item.status) }}</span>
          </template>
          <template v-slot:item.title="{ item }">
            <span 
              class="d-inline-block text-truncate"
              :style="isAdmin ? 'max-width: 200px;' : 'max-width: 650px;'"
            >{{ item.title }}</span>
          </template>
          <template v-slot:item.startDate="{ item }">
            {{ getTerm(item) }}
          </template>
          <template v-slot:item.companyName="{ item }">
            <span
              class="d-inline-block text-truncate"
              style="max-width: 200px;"
            >
              {{ item.companyName }}
            </span>
          </template>
        </v-data-table>
      </div>
      <template v-if="isAdmin">
        <PageCount
          v-if="allCount"
          :allCount="allCount"
          :currentPageCount="currentPageCount"
        />
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
  import PageCount from '@/components/parts/PageCount.vue'

  import { API } from "aws-amplify";
  import * as Const from '@/const.js'

  const apiName = 'PcsAPI';

  export default {
    name: 'AllSignsPage',
    components: {
      PageTitle,
      CompanyComboBox,
      PageCount
    },
    data() {
      const params = this.$store.getters.getSearchParams.signs
      return {
        items: [],
        isLoading: true,
        csvLoading: false,
        status: params ? params.status : null,
        keyword: params ? params.keyword : '',
        companyCode: params ? params.companyCode : null,
        options: {
          sortBy: params ? params.sortBy : ["lastUpdateDate"],
          sortDesc: params ? params.sortDesc : [ true ],
          page: params ? params.page : 1,
        },
        allCount: 0,
        page: params ? params.page : 1,
      }
    },
    computed: {
      headers() {
        return [
        {
          text: 'No.',
          align: 'start',
          value: 'num',
          sortable: false,
          normal: true,
          width: '5%'
        },
        {
          text: this.$t('sign.headers.lastUpdateDate'),
          align: 'start',
          sortable: this.isSortable,
          value: 'lastUpdateDate',
          width: '10%'
        },
        {
          text: this.$t('common.signedAt'),
          align: 'start',
          sortable: this.isSortable,
          value: 'signedAt',
          normal: true,
          normalOnly: true,
          width: '10%'
        },
        {
          text: this.$t('sign.headers.requestDate'),
          align: 'start',
          sortable: this.isSortable,
          value: 'requestDate',
          normal: true,
          width: '10%'
        },
        {
          text: this.$t('sign.headers.implNo'),
          align: 'center',
          sortable: this.isSortable,
          value: 'implNo',
          normal: true,
          width: '10%'
        },
        { 
          text: this.$t('sign.headers.title'),
          align: 'start',
          sortable: this.isSortable,
          value: this.isJp ? 'title' : 'titleEn',
          normal: true,
          width: this.isAdmin ?'15%' : ''
        },
        { 
          text: this.$t('sign.headers.status'),
          align: 'start',
          sortable: this.isSortable,
          value: 'status',
          normal: true,
          width: '10%'
        },
        { 
          text: this.$t('sign.headers.startDate'),
          align: 'start',
          sortable: this.isSortable,
          value: 'startDate',
          width: '10%'
        },

        { 
          text: this.$t('sign.headers.companyCode'),
          align: 'start',
          sortable: this.isSortable,
          value: 'gdbCode',
          width: '10%'
        },
        { 
          text: this.$t('sign.headers.companyName'),
          align: 'start',
          sortable: this.isSortable,
          value: 'companyName',
          width: '15%'
        },
      ]
      },
      refConst() {
        return Const
      },
      signHeaders() {
        if (this.isAdmin) {
          return this.headers.filter(h => !h.normalOnly)
        } 
        else {
          return this.headers.filter(h => h.normal)
        } 
      },
      perPage() {
        if (this.isAdmin) {
          return this.refConst.SIGN.ADMIN_INDEX_PER_PAGE
        } 
        else {
          return this.refConst.SIGN.NORMAL_INDEX_MAX_COUNT
        } 
      },
      indexedItems() {
        return this.items.map((item, index) => ({
          id: (this.page - 1) * this.perPage + index + 1,
          ...item
        }))
      },
      currentPageCount() {
        const start = this.perPage  * (this.page -1) +1
        let end = null
        if(this.perPage * this.page <= this.allCount){
          end = this.perPage * this.page
        }else{
          end = this.perPage * (this.page -1) + this.allCount % this.perPage
        }
        return this.stringFormat(this.$t('pagination.formatBetween'), start, end)
      },
      isSortable() {
        return this.isAdmin
      },
      getTerm() {
        return function (item) {
          return `${item.startDate}~${item.endDate}`
        }
      },
      pageCount() {
         return Math.ceil(this.allCount / this.perPage)
      },
      placehoder() {
        return this.$t('message.enterFreewords')
      },
    },
    methods: {
      selectCompany(companyCode) {
        this.companyCode = companyCode
      },
      async getSigns() {
        this.isLoading = true
        const { sortBy, sortDesc, page, itemsPerPage } = this.options
        const path = '/sign/search'
        const myInit = {
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
         if (this.status !== null) {
            myInit.queryStringParameters.status = this.status
         }
         if (this.companyCode !== null) {
            myInit.queryStringParameters.companyCode = this.companyCode
         }

         await API
           .get(apiName, path, myInit)
           .then(response => {
             this.items = response.data
             this.allCount = response.allCount
             this.$store.dispatch('setSearchParams', {
              path: 'signs',
              signs: {
                companyCode: this.companyCode,
                status: this.status,
                keyword: this.keyword,
                page: this.page,
                sortBy: sortBy,
                sortDesc: sortDesc
              }
            })
           })
          .finally(() =>{
             this.isLoading = false
          })
      },
      executeSearch() {
        this.options.page = 1
        this.options.sortBy[0] = 'lastUpdateDate'
        this.options.sortDesc[0] = true
        
        this.getSigns()
      },
      executeReset() {
          this.keyword = null
          this.status = null
          this.companyCode = null
          this.options.page = 1
          this.options.sortBy[0] = 'lastUpdateDate'
          this.options.sortDesc[0] = true

          this.getSigns()
      },
      async signsCsvDownload() {
        const { sortBy, sortDesc } = this.options
        let signs = []
        this.csvLoading = true
        const path = '/sign/csv'
        const myInit = {
          queryStringParameters: {
            keyword: this.keyword,
            sortBy: sortBy[0],
            sortDesc: sortDesc[0],
            page: 1,
            itemsPerPage: this.refConst.CSV.SIGNS_PER_PAGE
          }
         }
         
        if (this.status !== null) {
          myInit.queryStringParameters.status = this.status
        }
        if (this.companyCode !== null) {
          myInit.queryStringParameters.companyCode = this.companyCode
        }

         const b = true
         
         while (b) {
           const result = await API
               .get(apiName, path, myInit)
               .then(response => {
                   return response
               })
           result.data.forEach((_) => signs.push(_))
           
           if (myInit.queryStringParameters.itemsPerPage * myInit.queryStringParameters.page >= result.allCount) {
               break
           }
  
           myInit.queryStringParameters.page++
           
         }
         
         const csvHeaders = [
           { text: this.$t('sign.csvHeaders.implNo'), value: "implNo" },
           { text: this.$t('sign.csvHeaders.title'), value: this.isJp ? "title":"titleEn" },
           { text: this.$t('sign.csvHeaders.revisionNo'), value: "revisionNo" },
           { text: this.$t('sign.csvHeaders.companyCode'), value: "gdbCode" },
           { text: this.$t('sign.csvHeaders.companyName'), value: "companyName" },
           { text: this.$t('sign.csvHeaders.historyNo'), value: "historyNo" },
           { text: this.$t('sign.csvHeaders.requestDate'), value: "requestDate" },
           { text: this.$t('sign.csvHeaders.startDate'), value: "startDate" },
           { text: this.$t('sign.csvHeaders.endDate'), value: "endDate" },
           { text: this.$t('sign.csvHeaders.status'), value: "status" },
           { text: this.$t('sign.csvHeaders.signedAt'), value: "signedAt" },
           { text: this.$t('sign.csvHeaders.lastUpdateUser'), value: "lastUpdateUser" },
           { text: this.$t('sign.csvHeaders.lastUpdateUserAddress'), value: "lastUpdateUserAddress" },
           { text: this.$t('sign.csvHeaders.lastUpdateDate'), value: "lastUpdateDate" },
           { text: "", value: "" },
           { text: "", value: "" },
         ]

         let signNum = 0; // 全データの最大の記名項目数
         signs.forEach((sign) => {
           sign.status = this.getSignStatus(sign.status)
           // 記名項目と記名をitemとsignのモデル構成に変換
           if (sign.signItems) {
             const data = JSON.parse(sign.signItems);
             let _signs = [];
             if (sign.sign) {
               _signs = JSON.parse(sign.sign);
             }
             if (data.signItems) {
               sign["signData"] = data.signItems
                 .map((_, i) => {
                   return {
                     item: _,
                     sign:
                       _signs.sign && _signs.sign.length > i ? _signs.sign[i] : "",
                   };
                 })
                 .filter((_) => "" !== _.item); // 間にある空行は除去
             }
           }
           if (!sign.signData) {
             sign.signData = [];
           }
           if (signNum < sign.signData.length) {
             signNum = sign.signData.length;
           }
         });
         // 最大の記名項目数分CSVのヘッダ列を追加
         for (let i = 0; i < signNum; i++) {
           csvHeaders.push({
             text: this.$t('sign.csvHeaders.signItemName') + (i + 1),
             value: "signItems" + i,
           });
           csvHeaders.push({ text: this.$t('sign.csvHeaders.signContent') + (i + 1), value: "sign" + i });
         }
         const date = this.$moment().format(Const.DATE.FORMAT_D);
         const fileName = `csd_${date}.csv`;
         this.csvDownload(
           signs.map((_) => {
             // 上でモデル化したものをCSVの列方向に分解
             _.signData.forEach((s, i) => {
               _["signItems" + i] = s.item;
               _["sign" + i] = s.sign;
             });
             return _;
           }),
           csvHeaders,
           fileName
         );
         
         this.csvLoading = false
      },
      clickRow(item) {
        // this.$router.push({ name: 'sign', params: { impl_no: item.implNo, company_code: item.companyCode } })
        if (this.isAdmin) {
          return this.$router.push({ name: 'adminSign', params: { impl_no: item.implNo, company_code: item.companyCode } })
        }
        else {
          return  this.$router.push({ name: 'sign', params: { impl_no: item.implNo } })
        }
      },
    },
    mounted() {
      this.$watch('options', function() {
        this.getSigns()
      }, {
        deep: true,
        immediate: true
      })
    },
  }
</script>
<style scoped>
  .row-pointer >>> tbody tr :hover {
    cursor: pointer;
  }
  .row-pointer >>> tbody .v-data-table__empty-wrapper  :hover {
    cursor: default;
  }
  #serchBox {
    padding: 1em 1em;
    color: #6091d3;
    background: #FFF;
    border: solid 3px #1A237E;
    border-radius: 10px;
  }
</style>