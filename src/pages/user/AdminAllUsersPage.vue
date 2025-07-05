<template>
    <div id="wrapper">
        <PageTitle id="pageTitle">{{$t('menu.adminUsers')}}</PageTitle>
        
        <div id="serchBox" v-if=isAdmin>
            <div id="serchForm">
                <v-row>
                  <v-col cols="2">
                    <v-subheader>{{$t('user.conditions.companyName')}}</v-subheader>
                  </v-col>
                  <v-col cols="6">
                    <CompanyComboBox @select="selectCompany" :multiple="false" :dense="true" :rules="[true]" :singleLine="true" :companyCode.sync="companyCode" :returnObject="false" />
                  </v-col>
                </v-row>
                <v-row align="center">
                    <v-col class="d-flex" cols="4">
                        <v-select v-model="select" :items="items"  item-text="state" item-value="abbr" outlined @change="keyword=''"></v-select>
                    </v-col>
                    <v-col cols="8" v-if="showUserStatusPulldown">
                        <v-select v-model="keyword" :items="userStatusPulldownItems"  item-text="state" item-value="abbr" outlined></v-select>
                    </v-col>
                    <v-col cols="8" v-else-if="showStatusPulldown">
                        <v-select v-model="keyword" :items="statusPulldownItems"  item-text="state" item-value="abbr" outlined></v-select>
                    </v-col>
                    <v-col cols="8" v-else-if="showUserTypePulldown">
                        <v-select v-model="keyword" :items="userTypeCodes"  :item-text="isJp ? 'display_name' : 'display_name_en'" item-value="code_value" outlined></v-select>
                    </v-col>
                    <v-col cols="8" v-else>
                        <v-text-field
                            v-model="keyword"
                            outlined
                            :placeholder="placeholder"
                            :maxlength="maxlength"
                            autocomplete="new-password"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </div>
        
            <div id="serchButtons">
                <v-row align="center" justify="end">
                    <v-col cols="auto">
                        <v-btn depressed v-on:click="executeUserSerch()" color="primary" :loading="tableLoading" :disabled="tableLoading">
                            {{$t('user.actions.search')}}
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn depressed v-on:click="resetUserSerch()" color="primary" :disabled="tableLoading">
                            {{$t('user.actions.reset')}}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </div>
        <div id="annotation" v-else v-html="$t('user.annotation')"/>
        
        
        <div id="functionButtons" v-if=isAdmin>
            <v-row align="center" justify="end">
                <v-col cols="auto">
                    <v-btn depressed v-on:click="downloadCSVAsync()" color="primary" :loading="csvLoading" :disabled="csvLoading">
                        {{$t('user.actions.csv')}}
                    </v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn depressed v-on:click="pushAdminUserCreatioin()" color="primary">
                        {{$t('user.actions.add')}}
                    </v-btn>
                </v-col>
            </v-row>
        </div>
        
        <div id="allUsersList">
            <v-alert type="warning" dense text v-if="over50Users">
                {{ isAdmin ? $t('user.messages.listMaxAdmin')  :  $t('user.messages.listMax') }}
            </v-alert>
            <v-data-table 
                :headers="userHeaders"
                :items="users"
                hide-default-footer 
                :loading="tableLoading" 
                :items-per-page = "itemsPerPage"
                :loading-text="$t('message.loading')" 
                :no-data-text="$t('message.nodata')"
                >
                <template v-slot:item.companyCode="{ item }">
                    <div v-for="(it, index) in item.companies" :key="`c${index}`">
                        <!-- <span >{{ it.gdbCode }}</span><br> -->
                        <span  v-if="it"
                            class="d-inline-block text-truncate"
                            style="max-width: 300px;"
                        >
                        {{ it.name }}({{ it.gdbCode }})
                        </span>
                    </div>
                </template>
                <template v-slot:item.username="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 300px;"
                    >
                    {{ item.username }}
                    </span><br>
                    <span v-if=isAdmin
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ item.email }}
                    </span><br>
                    <span v-if="isAdmin && userTypeName(item.type)"
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ userTypeName(item.type) }}
                    </span>
                </template>
                <template v-slot:item.email="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ item.email }}
                    </span>
                </template>
                <template v-slot:item.userStatus="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ getUserStatus(item.userStatus) }}
                    </span>
                </template>
                <template v-slot:item.enabled="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ getEnabledText(item.enabled) }}
                    </span>
                </template>
                <!-- 最終更新者のデータ付与 -->
                <template v-slot:item.updatedUser="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ item.lastUpdatedUser }}
                    </span>
                </template>
                <template v-slot:item.updatedAt="{ item }">
                    <span
                        class="d-inline-block text-truncate"
                        style="max-width: 400px;"
                    >
                    {{ getFormatDate(item.updatedAt) }}
                    </span>
                </template>
                <template v-slot:item.switchButton="{ item }">
                    <v-btn v-if="item.enabled" depressed v-on:click="checkUser(item)" color="primary">
                         {{ getEnabledItem(!item.enabled).label }}
                     </v-btn>
                     <v-btn v-else depressed v-on:click="checkUser(item)" color="warning">
                         {{ getEnabledItem(!item.enabled).label }}
                     </v-btn>
                </template>
                <template v-slot:item.deleteButton="{ item }">
                    <DeleteButtonWithModal v-if="isAdmin" @delete="deleteUserAsync" :target="item.email" />
                    <DeleteButtonWithModal v-else @delete="changeUserStatusAsync" :target="item.email" />
                </template>
                <template v-slot:item.editButton="{ item }">
                    <v-btn depressed v-on:click="editUser(item)" color="primary" :disabled="!item.companyCode">
                         {{$t('user.actions.edit')}}
                     </v-btn>
                </template>
</v-data-table>
</div>

<SwitchableSnackbars v-bind:snackbar="snackbar" />
<v-dialog v-model="confirmModal" :width="500">
    <Modal
        @clickClose="closeModal"
        :message="modalMessage"
        :disabled="modalDisabled"
        @clickSubmit="submitEvent"
    ></Modal>
</v-dialog>
<v-dialog v-model="errorModal" width="500">
    <Modal
        @clickOk="closeModal"
        :message="modalMessage"
        :disabled="modalDisabled"
        modalType="ok"
    ></Modal>
</v-dialog>
</div>
</template>
<script>
    import { Hub } from 'aws-amplify';
    import * as Const from '@/const.js'
        const apiName = 'PcsAPI';

    import DeleteButtonWithModal from '@/components/modules/DeleteButtonWithModal.vue'
    import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
    import PageTitle from '@/components/parts/PageTitle'
    import Modal from '@/components/modules/Modal'
    import CompanyComboBox from '@/components/modules/CompanyComboBox.vue'

    export default {
        name: 'AdminAllUsersPage',
        data() {
            return {
                // モーダル用
                confirmModal: false,
                errorModal: false,
                modalDisabled: false,
                modalMessage: '',

                adminUser: false,
                keyword: null,
                searchType: "name",
                limit: 50,
                select: "name",
                selectValue: "CONFIRMED",
                users: [],
                selectedItem: undefined,
                tableLoading: false,
                itemsPerPage: 50,
                showUserStatusPulldown: false,
                showStatusPulldown: false,
                showUserTypePulldown: false,
                maxlength: 50,
                csvLoading: false,
                snackbar: {
                    state: this.snackbarState,
                    message: this.snackbarMessage
                },
                companyCode: undefined,
                userTypeCodes: [],
            }
        },
        props: {
            snackbarMessage: String,
            snackbarState: String
        },
        watch: {
            select() {
                if (this.select == "name") {
                    this.maxlength = this.refConst.FORM.MAX_LENGTH
                    this.showUserStatusPulldown = false
                    this.showStatusPulldown = false
                    this.showUserTypePulldown = false
                }
                else if (this.select == "email") {
                    this.maxlength = this.refConst.FORM.MAIL_MAX_LENGTH
                    this.showUserStatusPulldown = false
                    this.showStatusPulldown = false
                    this.showUserTypePulldown = false
                }
                else if (this.select == "userStatus")  {
                    this.maxlength = 0
                    this.showUserStatusPulldown = true
                    this.showStatusPulldown = false
                    this.showUserTypePulldown = false
                }
                else if (this.select == "status")  {
                    this.maxlength = 0
                    this.showUserStatusPulldown = false
                    this.showStatusPulldown = true
                    this.showUserTypePulldown = false
                }
                else if (this.select == "userType")  {
                    this.maxlength = 0
                    this.showUserStatusPulldown = false
                    this.showStatusPulldown = false
                    this.showUserTypePulldown = true
                }
            }
        },
        computed: {
            authenticatedUser() {
                return this.$store.state.user
            },
            over50Users() {
                if (this.users.length >= 50) {
                    return true
                }
                else {
                    return false
                }
            },
            presetSearchParams() {
                return this.$store.getters.getSearchParams
            },
            refConst() {
                return Const
            },
            userHeaders() {
                return this.isAdmin ? this.adminHeaders : this.headers
            },
            
            items(){ 
                return [
                    { state: this.$t('user.headers.username'), abbr: 'name' },
                    { state: this.$t('user.headers.email'), abbr: 'email' },
                    { state: this.$t('user.headers.userStatus'), abbr: 'userStatus'},
                    { state: this.$t('user.headers.status'), abbr: 'status'},
                    { state: this.$t('user.headers.type'), abbr: 'userType'}
                ]
            },
            userStatusPulldownItems() {
                return [
                    { state: this.$t('user.status.status1'), abbr: "CONFIRMED" },
                    { state: this.$t('user.status.status2'), abbr: "RESET_REQUIRED" }
                ]
            },
            statusPulldownItems() {
                return [
                    { state: this.$t('common.enabled'), abbr: "Enabled" },
                    { state: this.$t('common.disabled'), abbr: "Disabled" }
                ]
            },
            enabledItems() {
                return [
                     { state: this.$t('common.enabled'), abbr: true, label: this.$t('common.enable')},
                     { state: this.$t('common.disabled'), abbr: false, label: this.$t('common.disable') }
                ]
            },
            adminHeaders() {
                return [
                    {
                        text: this.$t('user.headers.company'),
                        align: 'start',
                        sortable: false,
                        value: 'companyCode',
                        width: '20%'
                    },
                    {
                        text: this.$t('user.headers.user'),
                        align: 'start',
                        sortable: false,
                        value: 'username',
                        width: '20%'
                    },
                    {
                        text: this.$t('user.headers.userStatus'),
                        align: 'start',
                        sortable: false,
                        value: 'userStatus',
                        width: '10%'
                    },
                    {
                        text: this.$t('user.headers.status'),
                        align: 'start',
                        sortable: false,
                        value: 'enabled',
                        width: '10%'
                    },
                    {
                        text: this.$t('user.headers.updatedUser'),
                        align: 'start',
                        sortable: false,
                        value: 'updatedUser',
                        width: '20%'
                    },
                    {
                        text: this.$t('user.headers.updatedAt'),
                        align: 'start',
                        sortable: false,
                        value: 'updatedAt',
                        width: '10%'
                    },
                    {
                        text: '',
                        align: 'start',
                        sortable: false,
                        value: 'switchButton',
                        width: '5%'
                    },
                    {
                        text: '',
                        align: 'start',
                        sortable: false,
                        value: 'editButton',
                        width: '5%'
                    },
                    {
                        text: '',
                        align: 'start',
                        sortable: false,
                        value: 'deleteButton',
                        width: '5%'
                    }
                ]
            },
            headers() {
                return [
                    {
                        text: this.$t('user.headers.username'),
                        align: 'start',
                        sortable: false,
                        value: 'username',
                        width: '15%'
                    },
                    {
                        text: this.$t('user.headers.email'),
                        align: 'start',
                        sortable: false,
                        value: 'email',
                        width: '20%'
                    },
                    {
                        text: this.$t('user.headers.userStatus'),
                        align: 'start',
                        sortable: false,
                        value: 'userStatus',
                        width: '10%'
                    },
                    {
                        text: this.$t('user.headers.updatedAt'),
                        align: 'start',
                        sortable: false,
                        value: 'updatedAt',
                        width: '10%'
                    },
                    {
                        text: '',
                        align: 'start',
                        sortable: false,
                        value: 'deleteButton',
                        width: '5%'
                    }
                ]
            },
            placeholder() {
                switch(this.select) {
                    case "name":
                        return this.$t('user.placeholder.name')
                    case "email":
                        return this.$t('user.placeholder.mail')
                    case "userStatus":
                    case "status":
                        return ""
                    default:
                        return `enter the ${this.select}`
                }
            },
            getEnabledText() {
                return (status) => {
                    let result = this.enabledItems[0].state
                    this.enabledItems.forEach (function(item){
                        if (item.abbr == status) {
                            result = item.state
                        }
                    })
                    return result
                }
            },
            getEnabledItem() {
                return (status) => {
                    return this.enabledItems.filter(v=>v.abbr === status)[0]
                }
            },
            userTypeName() {
                return (type) => {
                    if( type ) {
                        const c = this.userTypeCodes.filter(v=>v.code_value === type)[0]
                        if ( !c ) {
                            return undefined
                        }
                        return this.isJp ? c.display_name : c.display_name_en
                    }
                    return undefined
                }
            }
        },
        components: {
            DeleteButtonWithModal,
            SwitchableSnackbars,
            PageTitle,
            Modal,
            CompanyComboBox,
        },
        async created() {
            if (this.isAdmin) {
                this.getUserTypes()
            }
            if (this.presetSearchParams && this.presetSearchParams.path === this.$route.name) {
                this.keyword = this.presetSearchParams.myInit.queryStringParameters.keyword
                this.select = this.presetSearchParams.myInit.queryStringParameters.searchType
                this.limit = this.presetSearchParams.myInit.queryStringParameters.limit
                this.companyCode = this.presetSearchParams.myInit.queryStringParameters.companyCode
            }

            await this.getUsersAsync()
        },
        methods: {
            async getUsersAsync() {
                this.tableLoading = true
                const path = '/user';
                let users = []
                let myInit = {
                    queryStringParameters: {
                        keyword: this.keyword,
                        searchType: this.select,
                        limit: this.limit,
                        companyCode: this.companyCode,
                    },
                };

                const b = true;

                while (b) {
                    const result = await this.apiGet(apiName, path, myInit)
                        .then(response => {
                            return response
                        })

                    result.data.forEach((d) => {
                        if(d.companyCode) {
                            d.companyCode = d.companyCode.split(',')
                        }
                        users.push(d)
                    });

                    if (!result.nextToken || users.length >= 50) {
                        break;
                    }
                    myInit.queryStringParameters.nextToken = result.nextToken
                }

                if (this.isAdmin) {
                    const companies = await this.getCompaniesAsync(users)
                    this.users = users.map(_ => {
                        if (_.companyCode) {
                            _.companies = _.companyCode.map(c=>{
                                const s = companies.filter(__ => __.companyCode === c);
                                if (0 < s.length) {
                                    return {
                                        code: c,
                                        name: s[0].companyName,
                                        gdbCode: s[0].gdbCode
                                    }
                                }
                            })
                        }
                        return _;
                    })
                } else {
                    // 一般ユーザーのみユーザー名の昇順
                    this.users = users.sort(function(a, b) {
                        if (a.username > b.username) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                }

                this.$store.dispatch('setSearchParams', {
                    path: this.$route.name,
                    myInit,
                })

                this.tableLoading = false
            },
            async getCompaniesAsync(users) {
                if (0 < users.length) {
                    const response = await this.apiGet(apiName, '/company/all')
                    return response
                }
                return [];
            },
            async deleteUserAsync(email) {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                
                const path = '/user';
                const myInit = {
                    body: {
                        email: email
                    }
                };

                await this.apiDel(apiName, path, myInit)
                    .then(async function() {
                        await this.sleep(500)
                        await this.getUsersAsync()

                        this.snackbar = {
                            message: this.$t('messageSnackBar.deleteSucceed'),
                            state: "success",
                        }
                    }.bind(this))
                    .catch((error) =>{
                        if (error.response.status === 400 || error.response.status === 503) {
                            this.snackbar = {
                                state: "error",
                                message: error.response.data.message
                            }
                        }
                        else {
                            throw error
                        }
                    }) 
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
            },
            async changeUserStatusAsync(email, enabled = false) {
                Hub.dispatch('OverlayChannel', { event: 'start' })
    
                await this.apiPatch(apiName, '/user', { body: {email: email, enabled: enabled} })
                    .then(async function() {
                        await this.sleep(500)
                        await this.getUsersAsync()

                        this.snackbar = {
                            message: this.$t('messageSnackBar.updateSucceed'),
                            state: "success",
                        }
                    }.bind(this))
                    .catch((error) =>{
                        if (error.response.status === 400 || error.response.status === 500) {
                            this.snackbar = {
                                state: "error",
                                message: error.response.data.message
                            }
                        }
                        else {
                            throw error
                        }
                    }) 
                    .finally(() =>{
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
            },
            async downloadCSVAsync() {
                this.csvLoading = true
                const path = '/user';
                let users = []
                let myInit = {
                    queryStringParameters: {
                        keyword: this.keyword,
                        searchType: this.select,
                        limit: this.refConst.CSV.USERS_PER_PAGE,
                        companyCode: this.companyCode,
                    },
                };
                const b = true;

                while (b) {
                    const result = await this.apiGet(apiName, path, myInit)
                        .then(response => {
                            return response
                        })
                    result.data.forEach((_) => users.push(_));

                    if (!result.nextToken) {
                        break;
                    }
                    myInit.queryStringParameters.nextToken = result.nextToken
                }

                const companies = await this.getCompaniesAsync(users)
                const csvHeaders = [
                    { text: this.$t('user.csvHeaders.companyCode'), value: "gdbCode" },
                    { text: this.$t('user.csvHeaders.companyName'), value: "companyName" },
                    { text: this.$t('user.csvHeaders.email'), value: "email" },
                    { text: this.$t('user.csvHeaders.username'), value: "username" },
                    { text: this.$t('user.csvHeaders.userStatus'), value: "userStatus" },
                    { text: this.$t('user.csvHeaders.status'), value: "enabled" },
                    { text: this.$t('user.csvHeaders.type'), value: "type" },
                    { text: this.$t('user.csvHeaders.note'), value: "note" },
                    { text: this.$t('user.csvHeaders.updatedUser'), value: "lastUpdatedUser" },
                    { text: this.$t('user.csvHeaders.updatedAt'), value: "updatedAt" }
                ]
                const _users = []
                for( const user of users ) {
                    user.userStatus = this.getUserStatus(user.userStatus)
                    user.enabled = this.getEnabledText(user.enabled)
                    user.updatedAt = this.$moment(user.updatedAt).format(Const.DATE.TIME_FORMAT)
                    if (user.companyCode) {
                        for( const c of user.companyCode.split(',') ) {
                            const s = companies.filter(__ => __.companyCode === c);
                            if (0 < s.length) {
                                const u = JSON.parse(JSON.stringify(user))
                                u.companyName = s[0].companyName
                                u.gdbCode = s[0].gdbCode
                                u.companyCode = c
                                _users.push(u)
                            }
                        }
                    } else {
                        _users.push(user)
                    }
                }

                const date = this.$moment().format(Const.DATE.FORMAT_D)
                const fileName = `csu_${date}.csv`
                this.csvDownload(_users, csvHeaders, fileName)
                this.csvLoading = false

            },
            pushAdminUserCreatioin() {
                this.$router.push({name: 'adminCreateUser', params: { presetCode: this.companyCode } })
            },
            resetUserSerch() {
                this.keyword = null
                this.nextToken = null
                this.companyCode = null
                this.getUsersAsync()
            },
            executeUserSerch() {
                this.nextToken = null
                this.getUsersAsync()
            },
            findCompanyName(companyCode) {
                try {
                    const target = this.companies.find((company) => {
                        return (company.companyKey.companyCode == companyCode);
                    });
                    return target.companyName
                }
                catch {
                    return
                }
            },
            checkUser(item) {
                const email = this.$store.state.user.attributes.email

                if(item.email === email){
                    this.openModal(item, true)
                }else{
                    this.openModal(item, false)
                }
            },
            editUser(item) {
                this.$router.push({name: 'adminEditUser', params: { presetCode: item.companyCode, edit: item } })
            },
            // モーダル関係
            openModal(item, isErrorModal) {
                if (isErrorModal) {
                    this.modalMessage = this.$t('messageModal.user.checkUserError')
                    this.errorModal = true
                } else {
                    this.selectedItem = item
                    if (item.enabled) {
                        this.modalMessage = this.$t('messageModal.user.toDisableConfirm')
                        this.confirmModal = true
                    } else {
                        this.modalMessage = this.$t('messageModal.user.toEnableConfirm')
                        this.confirmModal = true
                    }
                }
            },
            submitEvent() {
                this.changeUserStatusAsync(this.selectedItem.email, !this.selectedItem.enabled)
                this.selectedItem = undefined
                this.confirmModal = false
            },
            closeModal() {
                this.selectedItem = undefined
                this.confirmModal = false
                this.errorModal = false
            },
            selectCompany(companyCode) {
                this.companyCode = companyCode
            },
            async getUserTypes() {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                this.userTypeCodes = await this.apiGet(apiName, '/code', { 
                    queryStringParameters: {
                        key: Const.CODE_KEYS.USER_TYPE
                    }})
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
            },
        },
    }
</script>
<style scoped>
    #wrapper {
        margin: 0em 2em 1em 2em;
    }

    #serchBox {
        padding: 1em 1em;
        color: #6091d3;
        background: #FFF;
        border: solid 3px #1A237E;
        border-radius: 10px;
    }
    
    #annotation {
        padding: 1em 1em;
        color: #6091d3;
        background: #FFF;
        border: solid 3px #1A237E;
        border-radius: 10px;
        text-align: left;
        margin-bottom: 10px;
        width: 55%;
    }

    #functionButtons {
        margin: 1em 0;
    }

    #pageTitle {
        margin: 0 0 1em 0;
    }

    /deep/ .note {
        color: #222222;
        font-size: 0.5em;
        padding-top:1em;
        text-indent:3em;
    }
    /deep/ .mail {
        padding-top:0.5em;
        text-indent:5em;
    }

</style>
