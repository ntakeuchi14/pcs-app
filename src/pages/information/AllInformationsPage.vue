<template>
  <div>
    <PageTitle>{{$t('menu.informations')}}</PageTitle>
    <div id="serchBox" v-if="isAdmin" class="mt-10">
      <div id="serchForm">
        <v-row>
            <v-col cols="2">
              <v-subheader>{{$t('information.conditions.freeword')}}</v-subheader>
            </v-col>
            <v-col cols="6">
              <v-text-field 
                v-model="keyword" 
                outlined 
                :placeholder="$t('message.enterFreewords')"
                dense
                :maxlength="refConst.FORM.MAX_LENGTH"
                autocomplete="new-password"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            <v-subheader>{{$t('information.conditions.status')}}</v-subheader>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="status" 
              :items="informationStatusItems"
              item-text="name" 
              item-value="val" 
              outlined
              dense
              ></v-select>
          </v-col>
        </v-row>
      </div>
      <div id="serchButtons">
        <v-row align="center" justify="end">
          <v-col cols="auto">
            <v-btn depressed @click="executeSearch" color="primary">
                {{$t('information.actions.search')}}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn depressed @click="executeReset" color="primary">
                {{$t('information.actions.reset')}}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
    <div class="mt-5 mr-5" v-if="isAdmin">
      <v-row align="center" justify="end">
        <v-col cols="auto">
          <v-btn depressed @click="infosCsvDownload" color="primary" :loading="csvLoading" :disabled="csvLoading">
            {{$t('information.actions.csv')}}
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn depressed @click="jumpCreatePage" color="primary">
            {{$t('information.actions.add')}}
          </v-btn>
        </v-col>
       </v-row>
     </div>
    <div class="mt-10">
      <v-data-table
        :headers="informationHeaders"
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
        <template v-slot:item.data.status="{ item }">
          <span :class="getInformationStatusColor(item.data.status)">{{ getInformationStatus(item.data.status) }}</span>
        </template>
        <template v-slot:item.data.title="{ item }">
          <span class="d-inline-block text-truncate" :style="isAdmin ? 'max-width: 250px;' : 'max-width: 950px;'">
            {{isJp ? item.data.title : item.data.titleEn ? item.data.titleEn : item.data.title}}
            <InformationDownload v-if="isAdmin" :item="item" @refresh="getInformations" @overlay="downloadOverlay"/>
          </span>
        </template>
        <template v-slot:item.data.titleEn="{ item }">
          <span class="d-inline-block text-truncate" :style="isAdmin ? 'max-width: 250px;' : 'max-width: 950px;'">
            {{isJp ? item.data.title : item.data.titleEn ? item.data.titleEn : item.data.title}}
            <InformationDownload v-if="isAdmin" :item="item" @refresh="getInformations" @overlay="downloadOverlay"/>
          </span>
        </template>
        <template v-slot:item.data.startDate="{ item }">
          {{ getTerm(item.data) }}
        </template>
        <template v-slot:item.companyCode="{ item }">
          {{ getCompanyId(item.data.companies) }}
        </template>
        <template v-slot:item.companyName="{ item }">
          <span
            class="d-inline-block text-truncate"
            style="max-width: 200px;"
          >
            <template
              v-if="item.data.companies.length > 1"
            >
              <span
                class="blue--text text-decoration-underline"
                @click.stop="openCompaniesModal(item.data.companies)"
              >{{ getCompanyName(item.data.companies) }}</span>
            </template>
            <template
              v-else
            >
              <span>{{ getCompanyName(item.data.companies) }}</span>
            </template>
          </span>
        </template>
        <template v-slot:item.attachmentButton="{ item }">
          <template v-if="!isAdmin && item.data.isAttach===1">
            <InformationDownload :item="item" @overlay="downloadOverlay"/>
          </template>
        </template>
      </v-data-table>
      <v-dialog
        v-model="companiesModal"
        width="600px"
      >
        <v-card>
          <v-card-title>
            {{$t('information.companies.title')}}
          </v-card-title>
          <v-simple-table
              fixed-header
              height="300px"
            >
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center">
                    {{$t('information.companies.id')}}
                  </th>
                  <th class="text-center">
                    {{$t('information.companies.name')}}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in currentCompanies"
                  :key="item.companyCode"
                >
                  <td>
                    {{ item.gdbCode }}
                  </td>
                  <td>
                    <span class="d-inline-block text-truncate" style="max-width: 200px;">
                      {{ item.companyName }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-dialog>
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
    <Overlay
      :overlay="overlay"
    />
    </div>
</template>
<script>
  import PageTitle from '@/components/parts/PageTitle'
  import PageCount from '@/components/parts/PageCount.vue'
  import InformationDownload from '@/components/modules/InformationDownload.vue'
  import Overlay from '@/components/parts/Overlay'
  
  import { API } from "aws-amplify";
  import * as Const from '@/const.js'
  const apiName = 'PcsAPI';

  export default {
    name: 'AllInformationsPage',
    components: {
      PageTitle,
      PageCount,
      InformationDownload,
      Overlay,
    },
    data() {
      const params = this.$store.getters.getSearchParams.infos
      return {
        items: [],
        isLoading: true,
        csvLoading: false,
        companiesModal: false,
        status: params ? params.status : null,
        keyword: params ? params.keyword : '',
        options: {
          sortBy: params ? params.sortBy : ["data.startDate"],
          sortDesc: params ? params.sortDesc : [ true ],
          page: params ? params.page : 1,
        },
        allCount: 0,
        page: params ? params.page : 1,
        currentCompanies: null,
        overlay: false,
      }
    },
    computed: {
      refConst() {
        return Const
      },
      headers() {
        return [
          {
            text: 'No.',
            align: 'start',
            sortable: false,
            value: 'num',
            admin: true,
            normal: true,
            width: '5%'
          },
          { 
            text: this.$t('information.headers.status'), 
            align: 'start',
            sortable: this.isSortable,
            value: 'data.status',
            admin: true,
            width: '10%'
          },
          {
            text: this.$t('information.headers.releaseDate'), 
            align: 'start',
            sortable: this.isSortable,
            value: 'data.releaseDate',
            admin: true,
            normal: true,
            width: '10%'
          },
          { 
            text: this.$t('information.headers.startDate'), 
            align: 'start',
            sortable: this.isSortable,
            value: 'data.startDate',
            admin: true,
            width: '10%'
          },
          { 
            text: this.$t('information.headers.informationId'),
            align: 'start',
            sortable: this.isSortable,
            value: 'key.informationId',
            admin: true,
            width: '5%'
          },
          { 
            text: this.$t('information.headers.title'), 
            align: 'start',
            sortable: this.isSortable,
            value: 'data.title',
            admin: true,
            normal: true,
            hidden: !this.isJp,
            width: this.isAdmin ?'20%' : ''
          },
          { 
            text: this.$t('information.headers.title'), 
            align: 'start',
            sortable: this.isSortable,
            value: 'data.titleEn',
            admin: true,
            normal: true,
            hidden: this.isJp,
            width: this.isAdmin ?'20%' : ''
          },
          { 
            text: this.$t('information.headers.companyId'), 
            align: 'start',
            value: 'companyCode',
            sortable: false,
            admin: true,
            width: '10%'
          },
          { 
            text: this.$t('information.headers.companyName'),
            align: 'start',
            value: 'companyName',
            sortable: false,
            admin: true,
            width: '15%',
          },
          { 
            text: this.$t('information.headers.attachment'),
            align: 'start',
            value: 'attachmentButton',
            sortable: false,
            admin: false,
            normal: true,
            width: '40%',
          },
        ]
      },
      informationHeaders() {
        if (this.isAdmin) {
          return this.headers.filter(h => h.admin).filter(h => !h.hidden)
        } else {
          return this.headers.filter(h => h.normal).filter(h => !h.hidden)
        }
      },
      perPage() {
        if (this.isAdmin) {
          return this.refConst.INFORMATION.ADMIN_INDEX_PER_PAGE
        } 
        else {
          return this.refConst.INFORMATION.NORMAL_INDEX_MAX_COUNT
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
      getCompanyId() {
        return function (item) {
          const companyCount = item.length
          if (companyCount === 1) {
            return item[0].gdbCode
          }
        }
      },
      getCompanyName() {
        return function (item) {
          const companyCount = item.length
          if (companyCount === 1) {
            if( item[0].companyCode==='ALL') {
              return this.$t('common.allCompanies')
            }
            return item[0].companyName
          }
          else if (companyCount > 1) {
            return `${item[0].companyName}...`
          }
          else {
            return ''
          }
        }
      },
    },
    methods: {
      async getInformations() {
        this.isLoading = true
        const { sortBy, sortDesc, page, itemsPerPage } = this.options
        const replaceStr = sortBy[0].replace('data.', '').replace('key.', '')
        const path = '/information/search'
        const myInit = {
          queryStringParameters: {
            sortBy: replaceStr,
            sortDesc: sortDesc[0],
            page: page,
            itemsPerPage: itemsPerPage,
            searchWord: this.keyword,
          }
         }
        if (this.status !== null) {
          myInit.queryStringParameters.status = this.status
        }
        await API
          .get(apiName, path, myInit)
          .then(response => {
            this.items = response.data
            this.allCount = response.allCount
            this.$store.dispatch('setSearchParams', {
             path: 'informations',
             infos: {
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
        this.options.sortBy[0] = 'data.startDate'
        this.options.sortDesc[0] = true
        
        this.getInformations()
      },
      executeReset() {
          this.keyword = null
          this.status = null
          this.options.page = 1
          this.options.sortBy[0] = 'data.startDate'
          this.options.sortDesc[0] = true

          this.getInformations()
      },
      clickRow(item) {
        this.$router.push({ name: 'information', params: { information_id: item.key.informationId } })
      },
      jumpCreatePage() {
        this.$router.push({ name: 'newInformation' })
      },
      openCompaniesModal(companies) {
        this.currentCompanies = companies
        this.companiesModal = true
      },
      async infosCsvDownload() {
        const { sortBy, sortDesc } = this.options
        const replaceStr = sortBy[0].replace('data.', '').replace('key.', '')
        let infos = []
        this.csvLoading = true
        
        const path = '/information/csv'
        const myInit = {
          queryStringParameters: {
            searchWord: this.keyword,
            sortBy: replaceStr,
            sortDesc: sortDesc[0],
            page: 1,
            itemsPerPage: this.refConst.CSV.INFOS_PER_PAGE
          }
        }
         
        if (this.status !== null) {
          myInit.queryStringParameters.status = this.status
        }
        
        const b = true

         while (b) {
           const result = await API
               .get(apiName, path, myInit)
               .then(response => {
                   return response
               })
           result.data.forEach((_) => infos.push(_))

           if (myInit.queryStringParameters.itemsPerPage * myInit.queryStringParameters.page >= result.allCount) {
               break
           }

           myInit.queryStringParameters.page++
         }
         
         const csvHeaders = [
           { text: this.$t('information.csvHeaders.informationId'), value: "informationId" },
           { text: this.$t('information.csvHeaders.companyCode'), value: "companyCode" },
           { text: this.$t('information.csvHeaders.contactInformation'), value: "contactInformation" },
           { text: this.$t('information.csvHeaders.startDate'), value: "startDate" },
           { text: this.$t('information.csvHeaders.endDate'), value: "endDate" },
           { text: this.$t('information.csvHeaders.releaseDate'), value: "releaseDate" },
           { text: this.$t('information.csvHeaders.title'), value: "title" },
           { text: this.$t('information.csvHeaders.title'), value: "titleEn" },
           { text: this.$t('information.csvHeaders.contents'), value: "contents" },
           { text: this.$t('information.csvHeaders.contents'), value: "contentsEn" },
           { text: this.$t('information.csvHeaders.status'), value: "status" },
           { text: this.$t('information.csvHeaders.filename'), value: "filename" },
         ]
        // 状態変換
         infos.forEach((info) => {
           info.status = this.getInformationStatus(info.status)
           if(info.contactInformation==='ALL') {
             info.contactInformation = this.$t('common.allCompanies')
           }
         })

         const date = this.$moment().format(Const.DATE.FORMAT_D)
         const fileName = `csr_${date}.csv`
         this.csvDownload(infos, csvHeaders, fileName)

         this.csvLoading = false
      },
      downloadOverlay(b) {
        this.overlay = b
      },
    },
    mounted() {
      this.$watch('options', function() {
        this.getInformations()
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