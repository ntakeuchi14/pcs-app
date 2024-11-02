<template>
    <div id="wrapper" v-if="isAdmin">
        <PageTitle id="pageTitle">{{company ? company.companyName : ''}}</PageTitle>
        <v-card class="pa-3">
        <v-card-title class="font-weight-bold">{{$t('company.inventory.validUser')}}</v-card-title>
        <v-container>
            <v-row justify="end">
                <v-btn depressed v-on:click="createUser()" color="primary" :disabled="userLoading">
                    {{$t('company.inventory.addUser')}}
                </v-btn>
            </v-row>
            <v-data-table 
                :headers="userHeaders"
                :items="enabledUsers"
                :loading="userLoading" 
                hide-default-footer 
                :loading-text="$t('message.loading')" 
                :no-data-text="$t('message.nodata')"
                >
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
                <template v-slot:item.button1="{ item }">
                    <v-btn depressed v-on:click="toggleStatus(item, false)" color="primary" :disabled="userLoading">{{$t('common.disable')}}</v-btn>
                </template>
            </v-data-table>
        </v-container>
        </v-card>
        <br/>
        <v-card class="px-3">
            <v-card-title class="font-weight-bold">{{$t('company.inventory.invalidUser')}}</v-card-title>
            <v-container>
            <v-row justify="end">
                <v-btn depressed v-on:click="deleteDisabledUsers()" color="error" :disabled="disabledUsers.length === 0 || userLoading">
                    {{$t('company.inventory.bulkDelete')}}
                </v-btn>
            </v-row>
            <v-data-table 
                :headers="userHeaders"
                :items="disabledUsers"
                :loading="userLoading" 
                hide-default-footer 
                :loading-text="$t('message.loading')" 
                :no-data-text="$t('message.nodata')"
                >
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
                <template v-slot:item.button1="{ item }">
                    <v-btn depressed v-on:click="toggleStatus(item, true)" color="primary" :disabled="userLoading">{{$t('common.enable')}}</v-btn>
                </template>
                <template v-slot:item.button2="{ item }">
                    <v-btn depressed v-on:click="deleteDisabledUsers(item)" color="error" :disabled="userLoading">{{$t('common.delete')}}</v-btn>
                </template>
            </v-data-table>
        </v-container>
        </v-card>
        <v-container>
        <div id="executeButtons">
            <v-row justify="center">
                <v-col cols="auto">
                    <v-btn depressed v-on:click="pushAdminAllCompanies()" color="primary" :disabled="userLoading">
                        {{$t('common.return')}}
                    </v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-btn depressed v-on:click="updateStatus()" color="primary" :disabled="userLoading">
                        {{$t('company.inventory.update')}}
                    </v-btn>
                </v-col>
            </v-row>
        </div>
        </v-container>
           
        
        <SwitchableSnackbars v-bind:snackbar="snackbar" />
        <ConfirmModal ref="confirmModal"/>
    </div>
    
    <div id="error-wrapper" v-else>
        <p>{{$t('message.forbidden')}}</p>
    </div>
    
</template>
<script>
    import { API } from 'aws-amplify';
    const apiName = 'PcsAPI';
    import * as Const from '@/const.js'
    import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
    import PageTitle from '@/components/parts/PageTitle'
    import ConfirmModal from '@/components/modules/ConfirmModal.vue'

    export default {
        name: 'AdminCompanyPage',
        data() {
            return {
                companyCode: this.company_id,
                snackbar: {
                    state: this.snackbarState,
                    message: this.snackbarMessage
                },
                enabledUsers: [],
                disabledUsers: [],
                deleteUsers: [],
                userLoading: false,
                company: undefined,
                userTypeCodes: [],
            }
        },
        props: {
            snackbarMessage: String,
            snackbarState: String,
            company_id: String
        },
        computed: {
            Const() {
                return Const
            },
            userHeaders() {
                return [
                    {
                        text: this.$t('user.headers.user'),
                        align: 'start',
                        sortable: true,
                        value: 'username',
                        width: '20%'
                    },
                    {
                        text: this.$t('user.headers.userStatus'),
                        align: 'start',
                        sortable: true,
                        value: 'userStatus',
                        width: '10%'
                    },
                    {
                        text: this.$t('user.headers.updatedUser'),
                        align: 'start',
                        sortable: true,
                        value: 'updatedUser',
                        width: '20%'
                    },
                    {
                        text: this.$t('user.headers.updatedAt'),
                        align: 'start',
                        sortable: true,
                        value: 'updatedAt',
                        width: '10%'
                    },
                    {
                        text: '',
                        align: 'start',
                        sortable: false,
                        value: 'button1',
                        width: '5%'
                    },
                    {
                        text: '',
                        align: 'start',
                        sortable: false,
                        value: 'button2',
                        width: '5%'
                    }
                ]
            },
            userTypeName() {
                return (type) => {
                    if( type ) {
                        const c = this.userTypeCodes.filter(v=>v.code_value === type)[0]
                        if(!c) {
                            return undefined
                        }
                        return this.isJp ? c.display_name : c.display_name_en
                    }
                    return undefined
                }
            },
        },
        components: {
            SwitchableSnackbars,
            PageTitle,
            ConfirmModal,
        },
        async created() {
            if (this.isAdmin) {
                this.getUserTypes()
            }
            await this.getCompany()
            await this.getUsersAsync()
        },
        methods: {
            async getCompany() {
                const response = await API.get(apiName, '/company', {queryStringParameters: {companyCodes: this.company_id}})
                this.company = response.data[0]
            },
            pushAdminAllCompanies() {
                this.$router.push({name: 'adminCompanies'});
            },
            async getUsersAsync() {
                this.userLoading = true;
                const enabledUsers = []
                const disabledUsers = []
                try {
                    const params = {
                        searchType: 'userStatus',
                        limit: 50,
                        companyCode: this.company_id,
                    };
                    const b = true;
                    while (b) {
                        const result = await API.get(apiName, '/user', { queryStringParameters: params })
                        result.data.forEach(u => {
                            if( u.enabled ) {
                                enabledUsers.push(u)
                            } else {
                                disabledUsers.push(u)
                            }
                        });
                        if (!result.nextToken) {
                            break;
                        }
                        params.nextToken = result.nextToken
                    }
                } finally {
                    this.enabledUsers = enabledUsers
                    this.disabledUsers = disabledUsers
                    this.deleteUsers = []
                    this.userLoading = false;
                }
            },
            deleteDisabledUsers(user = undefined){
                if( user ) {
                    this.deleteUsers.push(user)
                    this.disabledUsers = this.disabledUsers.filter(u=>u.email!==user.email)
                } else {
                    this.deleteUsers = []
                    for( const u of this.disabledUsers) {
                        this.deleteUsers.push(u)
                    }
                    this.disabledUsers = []
                }
            },
            toggleStatus(user, b) {
                if( b ) {
                    this.enabledUsers.push(user)
                    this.disabledUsers = this.disabledUsers.filter(u=>u.email!==user.email)
                } else {
                    this.disabledUsers.push(user)
                    this.enabledUsers = this.enabledUsers.filter(u=>u.email!==user.email)
                }
            },
            async updateStatus() {
                this.$refs.confirmModal.show(this.$t('company.inventory.confirmUpdate'))
                  .then(async (b)=>{
                    if(b) {
                        this.userLoading = true;
                        try {
                            for( const user of this.enabledUsers ) {
                                await API.patch(apiName, '/user', { body: {email: user.email, enabled: true} }).catch(e=>console.error(e.message))
                            }
                            for( const user of this.disabledUsers ) {
                                await API.patch(apiName, '/user', { body: {email: user.email, enabled: false} }).catch(e=>console.error(e.message))
                            }
                            for( const user of this.deleteUsers ) {
                                await API.del(apiName, '/user', { body: {email: user.email} }).catch(e=>console.error(e.message))
                            }
                        } finally {
                            await this.sleep(500)
                            this.userLoading = false;
                            this.getUsersAsync()
                        }
                    }
                  })
            },
            createUser(){
                this.$router.push({name: 'adminCreateUser', params: { presetCode: this.companyCode } })
            },
            async getUserTypes() {
                this.userLoading = true
                this.userTypeCodes = await API.get(apiName, '/code', { 
                    queryStringParameters: {
                        key: Const.CODE_KEYS.USER_TYPE
                    }})
                    .finally(() => {
                        this.userLoading = false
                    })
            },
        }
    }
</script>
<style scoped>
    #wrapper {
        margin: 0em 2em 1em 2em;
    }

    #pageTitle {
        margin: 0 0 2em 0;
    }

    .form {
        padding: 0 1em;
    }
</style>
