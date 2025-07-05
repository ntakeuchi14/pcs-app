<template>
    <div id="wrapper" v-if="isAdmin">
        <PageTitle id="pageTitle">{{$t('menu.adminCompanies')}}</PageTitle>
        
        <div id="serchBox">
            <div id="serchForm">
                <v-row align="center">
                    <v-col>
                        <v-text-field
                            :label="$t('company.conditions.freeword')"
                            v-model="companyName"
                            outlined
                            :maxlength="refConst.FORM.MAX_LENGTH"
                            autocomplete="new-password"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </div>
        
            <div id="serchButtons">
                <v-row align="center" justify="end">
                    <v-col cols="auto">
                        <v-btn depressed v-on:click="executeCompanySerch()" color="primary">
                            {{$t('company.actions.search')}}
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn depressed v-on:click="resetCompanySerch()" color="primary">
                            {{$t('company.actions.reset')}}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </div>
        
        <div id="functionButtons">
            <v-row align="center" justify="end">
                <v-col cols="auto">
                    <v-btn depressed v-on:click="downloadCSVAsync()" color="primary" :loading="csvLoading" :disabled="csvLoading">
                        {{$t('company.actions.csv')}}
                    </v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn depressed v-on:click="pushCreateCompanyPage()" color="primary">
                        {{$t('company.actions.add')}}
                    </v-btn>
                </v-col>
            </v-row>
        </div>
        
        <div id="allCompaniesList">
            <v-data-table 
                :headers="headers"
                :items="companies"
                :loading="tableLoading"
                :options.sync="options"
                :page.sync="options.page"
                :server-items-length="allCount"
                :items-per-page="itemsPerPage"
                :loading-text="$t('message.loading')"
                :no-data-text="$t('message.nodata')"
                hide-default-footer
                :must-sort=true
            >
                <template v-slot:item.companyName="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 800px;"
                    >
                    {{ item.companyName }}
                    </span>
                </template>
                <template v-slot:item.editButton="{ item }">
                    <v-btn depressed v-on:click="pushEditCompanyPage(item.companyCode)" color="primary" >
                        {{$t('company.actions.edit')}}
                    </v-btn>
                </template>
                <template v-slot:item.createUserButton="{ item }">
                    <v-btn depressed v-on:click="pushCreateUserPage(item.companyCode)" color="primary" >
                        {{$t('company.actions.userInventory')}}
                    </v-btn>
                </template>
</v-data-table>
<div id="pager">
    <div id="itemCounter" v-if="allCount">
        <v-row justify="center" class="grey--text">
            {{stringFormat($t('pagination.format'), allCount, currentPageCount)}}
        </v-row>
    </div>
    <v-row justify="center">
        <v-pagination v-model="options.page" :length="pageCount" :total-visible="7"></v-pagination>
    </v-row>
</div>
</div>

<SwitchableSnackbars v-bind:snackbar="snackbar" />

</div>

<div id="error-wrapper" v-else>
    <p>{{$t('message.forbidden')}}</p>
</div>
</template>
<script>
    import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
    import PageTitle from '@/components/parts/PageTitle'
    
    import * as Const from '@/const.js'

    const apiName = 'PcsAPI';

    export default {
        name: 'AdminAllCompaniesPage',
        data() {
            return {
                tableLoading: false,
                companyName: null,
                allCount: null,
                companies: [],
                options: {
                    page: 1,
                    itemsPerPage: 10,
                    sortBy: ["gdbCode"],
                    sortDesc: [false]
                },
                csvLoading: false,
                // page: 1,
                itemsPerPage: 10,
                snackbar: {
                    state: this.snackbarState,
                    message: this.snackbarMessage
                }
            }
        },
        computed: {
            pageCount() {
                return Math.ceil(this.allCount / this.itemsPerPage)
            },
            currentPageCount() {
                const start = this.itemsPerPage * (this.options.page - 1) + 1
                let end = null
                if (this.itemsPerPage * this.options.page <= this.allCount) {
                    end = this.itemsPerPage * this.options.page
                }
                else {
                    end = this.itemsPerPage * (this.options.page - 1) + this.allCount % this.itemsPerPage
                }
                return this.stringFormat(this.$t('pagination.formatBetween'), start, end)
            },
            presetSearchParams() {
                return this.$store.getters.getSearchParams
            },
            refConst(){
                return Const
            },
            headers() {
              return [{
                    text: this.$t('company.headers.companyCode'),
                    align: 'start',
                    value: 'gdbCode',
                    width: '15%',
                    sortable: true
                }, {
                    text: this.$t('company.headers.companyName'),
                    align: 'start',
                    value: 'companyName',
                    width: '75%',
                    sortable: true
                },
                {
                    text: '',
                    align: 'end',
                    sortable: false,
                    value: 'editButton',
                    width: '5%'
                },
                {
                    text: '',
                    align: 'end',
                    sortable: false,
                    value: 'createUserButton',
                    width: '5%'
                },
            ]},
        },
        props: {
            snackbarMessage: String,
            snackbarState: String
        },
        components: {
            SwitchableSnackbars,
            PageTitle
        },
        mounted() {
            if (this.presetSearchParams && this.presetSearchParams.path === this.$route.name) {
                this.companyName = this.presetSearchParams.myInit.queryStringParameters.companyName
                this.options.page = this.presetSearchParams.myInit.queryStringParameters.page
                this.options.itemsPerPage = this.presetSearchParams.myInit.queryStringParameters.itemsPerPage
                this.options.sortBy[0] = this.presetSearchParams.myInit.queryStringParameters.sortBy
                this.options.sortDesc[0] = this.presetSearchParams.myInit.queryStringParameters.sortDesc
            }

            this.$watch('options', function() {
                this.getCompaniesAsync()
            }, {
                deep: true,
                immediate: true
            })
        },
        methods: {
            async getCompaniesAsync() {
                const { sortBy, sortDesc, page, itemsPerPage } = this.options
                this.tableLoading = true
                const path = '/company/search';
                let companies = []

                let myInit = {
                    queryStringParameters: {
                        companyName: this.companyName,
                        page: page,
                        itemsPerPage: itemsPerPage,
                        sortBy: sortBy[0],
                        sortDesc: sortDesc[0]
                    }
                };

                const result = await this.apiGet(apiName, path, myInit)
                    .then(response => {
                        return response
                    })
                    .finally(() => {
                        //  
                    })
                result.data.forEach((_) => companies.push(_));


                this.companies = companies
                this.allCount = result.allCount

                this.$store.dispatch('setSearchParams', {
                    path: this.$route.name,
                    myInit,
                })

                this.tableLoading = false
            },
            async deleteCompaniesAsync() {},
            async downloadCSVAsync() {
                const { sortBy, sortDesc } = this.options
                this.csvLoading = true
                const path = '/company/csv'
                let companies = []
                let myInit = {
                    queryStringParameters: {
                        companyName: this.companyName,
                        sortBy: sortBy[0],
                        sortDesc: sortDesc[0],
                        page: 1,
                        itemsPerPage: Const.CSV.COMPANYS_PER_PAGE
                    }
                };

                const b = true

                while (b) {
                    const result = await this.apiGet(apiName, path, myInit)
                        .then(response => {
                            return response
                        })
                    result.data.forEach((_) => {
                        if( _['documents'] && 0 < _.documents.length) {
                            _.document = _.documents.filter(d=>d['implNo']).map(d=>d.implNo).join(',')
                        }
                        if( _['questions'] && 0 < _.questions.length) {
                            _.question = _.questions.filter(d=>d['implNo']).map(d=>d.implNo).join(',')
                        }
                        companies.push(_)
                        })

                    if (myInit.queryStringParameters.itemsPerPage * myInit.queryStringParameters.page >= result.allCount) {
                        break
                    }

                    myInit.queryStringParameters.page++
                }

                const csvHeaders = [
                    { text: this.$t('company.csvHeaders.companyCode'), value: "gdbCode" },
                    { text: this.$t('company.csvHeaders.companyInnerCode'), value: "companyCode" },
                    { text: this.$t('company.csvHeaders.companyName'), value: "companyName" },
                    { text: this.$t('company.csvHeaders.phoneNumber'), value: "phoneNumber" },
                    { text: this.$t('company.csvHeaders.postCode'), value: "postCode" },
                    { text: this.$t('company.csvHeaders.address'), value: "address" },
                    { text: this.$t('company.csvHeaders.document'), value: "document" },
                    { text: this.$t('company.csvHeaders.question'), value: "question" },
                    { text: this.$t('company.csvHeaders.note'), value: "note" },
                    { text: this.$t('company.csvHeaders.lastUpdateUser'), value: "lastUpdateUser" },
                    { text: this.$t('company.csvHeaders.lastUpdateUserAddress'), value: "lastUpdateMailAddress" },
                    { text: this.$t('company.csvHeaders.lastUpdateDate'), value: "lastUpdatedAt" }
                ]

                const date = this.$moment().format(Const.DATE.FORMAT_D)
                const fileName = `csk_${date}.csv`
                this.csvDownload(companies, csvHeaders, fileName)

                this.csvLoading = false
            },
            pushEditCompanyPage(companyCode) {
                this.$router.push({ name: 'adminEditCompany', params: { company_id: companyCode } })
            },
            pushCreateCompanyPage() {
                this.$router.push({name: 'adminCreateCompany'})

            },
            pushCreateUserPage(companyCode) {
                this.$router.push({name: 'adminEditCompanyUser', params: { company_id: companyCode } })
            },
            executeCompanySerch() {
                this.options.page = 1
                this.options.sortBy[0] = "gdbCode"
                this.options.sortDesc[0] = false
                this.getCompaniesAsync()
            },
            resetCompanySerch() {
                this.companyName = null
                this.options.page = 1
                this.options.sortBy[0] = "gdbCode"
                this.options.sortDesc[0] = false
                this.getCompaniesAsync()
            },
        }
    }
</script>
<style scoped>
    #wrapper {
        margin: 0em 2em 1em 2em;
    }
    
    #pageTitle {
        margin: 0 0 1em 0;
    }

    #serchBox {
        padding: 1em 1em;
        color: #6091d3;
        background: #FFF;
        border: solid 3px #1A237E;
        border-radius: 10px;
    }

    #functionButtons {
        margin: 1em 0;
    }

    #pager {
        margin: 1em 0;
    }

    #itemCounter {
        margin: 1em 0;
    }
</style>
