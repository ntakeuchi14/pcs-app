<template>
    <div id="wrapper" v-if="isAdmin">
        <PageTitle id="pageTitle" v-if="!isEdit">{{$t('user.titleNew')}}</PageTitle>
        <PageTitle id="pageTitle" v-else>{{$t('user.titleEdit')}}</PageTitle>

        <v-form v-model="valid">
            <div id="inputforms">
                <v-row v-if="!presetCode">
                    <v-col cols="1">
                        <RequiredItemChip />
                    </v-col>
                    <v-col cols="11" class="form">
                        <CompanyComboBox @select="selectCompany" :multiple="false" :returnObject="false" :selectRules="selectRules" :companyCode.sync="companyCode"/>
                    </v-col>
                </v-row>
                
                <v-row v-else>
                    <v-col cols="1">
                        <v-chip class="ma-2" label text-color="white" small>
                            {{$t('common.required')}}
                        </v-chip>
                    </v-col>
                    <v-col cols="11" class="form">
                        <v-text-field
                        v-model="companyName"
                        :label="$t('common.company')"
                        disabled
                        ></v-text-field>
                    </v-col>
                </v-row>
                
                <v-row>
                    <v-col cols="1">
                        <RequiredItemChip/>
                    </v-col>
                    <v-col cols="11" class="form">
                        <v-text-field
                            :label="$t('user.headers.username')"
                            :placeholder="$t('user.messages.inputUsername')"
                            v-model="username"
                            :rules="usernameRules"
                            outlined
                            maxlength=50
                            autocomplete="new-password"
                        ></v-text-field>
                    </v-col>
                </v-row>
                
                <v-row>
                    <v-col cols="1">
                        <RequiredItemChip v-if="!isEdit" />
                        <v-chip v-else class="ma-2" label text-color="white" small>
                            {{$t('common.required')}}
                        </v-chip>
                    </v-col>
                    <v-col cols="11" class="form">
                        <v-text-field
                        :label="$t('user.headers.email')"
                        :placeholder="$t('user.messages.inputEmail')"
                        v-model="email"
                        email
                        :rules="emailRules"
                        :outlined = "!isEdit"
                        :maxlength="refConst.FORM.MAIL_MAX_LENGTH"
                        :disabled = "isEdit"
                        autocomplete="new-password"
                        ></v-text-field>
                    </v-col>
                </v-row>
                
                <v-row>
                    <v-col cols="1">
                    </v-col>
                    <v-col cols="11" class="form">
                        <v-select
                            clearable
                            :label="$t('user.headers.type')" 
                            v-model="selectUserType"
                            outlined
                            :items="userTypeCodes" 
                            :item-text="isJp ? 'display_name' : 'display_name_en'"
                            item-value="code_value"/>
                    </v-col>
                </v-row>
                
                <v-row>
                    <v-col cols="1">
                    </v-col>
                    <v-col cols="11" class="form">
                        <v-textarea
                        :label="$t('user.headers.note')"
                          v-model="note"
                          flat
                          outlined
                          no-resize
                          auto-grow
                          :maxlength="500"
                        ></v-textarea>
                    </v-col>
                </v-row>
            </div>
            <v-card class="mb-10 mt-10 ml-50 pa-6" outlined tile v-if="authEvents && authEvents.length > 0">
                <v-card-title>{{$t('user.accessHistory.title')}}</v-card-title>
                <v-data-table
                    disable-pagination hide-default-footer dense 
                    :headers="headers"
                    :items="authEvents">
                    <template v-slot:item.CreationDate="{ item }">
                        <span
                            class="d-inline-block text-truncate"
                            style="max-width: 400px;"
                        >
                        {{ format(item.CreationDate) }}
                        </span>
                    </template>
                </v-data-table>
            </v-card>
            
            <div id="executeButtons">
                <v-row justify="center">
                    <v-col cols="auto">
                        <v-btn depressed v-on:click="pushPreviousPage()" color="primary">
                            {{$t('common.cancel')}}
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn v-if="!isEdit" depressed v-on:click="validateInputs" color="primary" :disabled="!valid">
                            {{$t('common.create')}}
                        </v-btn>
                        <v-btn v-if="isEdit" depressed v-on:click="validateInputs" color="primary" :disabled="!valid">
                            {{$t('common.update')}}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-form>
        <SwitchableSnackbars v-bind:snackbar="snackbar" />
        <v-dialog v-model="modal" persistent max-width="500">
            <Modal
                @clickSubmit="isEdit ? updateUserAsync() : createUserAsync()"
                @clickClose="closeModal"
                :message="message"
            />
        </v-dialog>
    </div>
    
    <div id="error-wrapper" v-else>
        <p>{{$t('message.forbidden')}}</p>
    </div>

    </template>
<script>
    import { API, Hub } from 'aws-amplify';
    const apiName = 'PcsAPI';
    import * as Const from '@/const.js'

    import CompanyComboBox from '@/components/modules/CompanyComboBox.vue'
    import RequiredItemChip from '@/components/parts/RequiredItemChip.vue'
    import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
    import PageTitle from '@/components/parts/PageTitle'
    import Modal from '@/components/modules/Modal.vue'


    export default {
        name: 'AdminUserCreationPage',
        data() {
            return {
                valid: false,
                username: '',
                usernameRules: [
                    v => !!v
                ],
                email: '',
                emailRules: [
                    v => !!v
                ],
                selectRules: [
                    v => !!v
                ],
                snackbarSucceed: false,
                snackbarFailed: false,
                snackbarMessage: null,
                snackbar: {
                    state: null,
                    message: null
                },
                companyCode: this.presetCode,
                companyName: null,
                modal: false,
                authEvents: undefined,
                userTypeCodes: [],
                selectUserType: undefined,
                note: undefined,
            }
        },
        props: {
            presetCode: String,
            edit: Object,
        },
        components: {
            CompanyComboBox,
            RequiredItemChip,
            SwitchableSnackbars,
            PageTitle,
            Modal,
        },
        computed: {
            refConst() {
                return Const
            },
            message() {
                return this.edit ? this.$t('messageModal.updatedConfirm') : this.$t('messageModal.createdConfirm')
            },
            isEdit() {
                return this.edit ? true : false
            },
            format() {
              return (date) => {
                  return date ? this.$moment(date).format(Const.DATE.TIME_FORMAT) : undefined
              }
            },
            headers() {
                return  [
                  { text: this.$t('user.accessHistory.creationDate'), value: 'CreationDate' },
                  { text: this.$t('user.accessHistory.eventType'), value: 'EventType' },
                  { text: this.$t('user.accessHistory.eventResponse'), value: 'EventResponse' },
                  { text: this.$t('user.accessHistory.riskDecision'), value: 'EventRisk.RiskDecision' },
                  { text: this.$t('user.accessHistory.ipAddress'), value: 'EventContextData.IpAddress' },
                  { text: this.$t('user.accessHistory.deviceName'), value: 'EventContextData.DeviceName' },
                  { text: this.$t('user.accessHistory.city'), value: 'EventContextData.City' },
                  { text: this.$t('user.accessHistory.country'), value: 'EventContextData.Country' },
                ]
            },
        },
        async created() {
            this.getUserTypes()
            if (this.presetCode) {
                this.companyName = await this.getCompanyNameAsync()
            }
            if (this.edit) {
                this.getUser(this.edit.email)
            }
        },
        methods: {
            async createUserAsync() {
                this.closeModal()
                Hub.dispatch('OverlayChannel', { event: 'start' })

                const path = '/user';
                const myInit = {
                    body: {
                        username: this.username,
                        email: this.email,
                        companyCode: this.companyCode,
                        type: this.selectUserType === null ? undefined : this.selectUserType,
                        note: this.note,
                    },
                };

                await API
                    .post(apiName, path, myInit)
                    .then(() => {
                        this.pushAfterCompletion()

                    })
                    .catch(error => {
                        const key = `addUser_${error.response.status}`

                        if (this.$t('errorDescription')[key]) {
                            this.snackbar = {
                                state: "error",
                                message: this.$t('errorDescription')[key]
                            }
                        }
                        else {
                            if (error.response.data.message === 'Invalid email address format.') {
                                this.snackbar = {
                                    state: "error",
                                    message: this.$t('messageSnackBar.invalidMailFormt'),
                                }
                            }
                            else if (error.response.status === 400) {
                                this.snackbar = {
                                    state: "error",
                                    message: error.response.data.message
                                }
                            }
                            else {
                                throw error
                            }
                        }
                    })
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
            },
            async updateUserAsync() {
                this.closeModal()
                Hub.dispatch('OverlayChannel', { event: 'start' })

                const path = '/user';
                const myInit = {
                    body: {
                        username: this.username,
                        email: this.email,
                        companyCode: this.companyCode,
                        type: this.selectUserType === null ? undefined : this.selectUserType,
                        note: this.note,
                    },
                };

                await API
                    .put(apiName, path, myInit)
                    .then(() => {
                        this.pushAfterCompletion()

                    })
                    .catch(error => {
                        const key = `ADD_USER_${error.response.status}`

                        if (this.$t('errorDescription')[key]) {
                            this.snackbar = {
                                state: "error",
                                message: this.$t('errorDescription')[key]
                            }
                        }
                        else {
                            if (error.response.data.message === 'Invalid email address format.') {
                                this.snackbar = {
                                    state: "error",
                                    message: this.$t('refConst.messageSnackBar.invalidMailFormt'),
                                }
                            }
                            else if (error.response.status === 400) {
                                this.snackbar = {
                                    state: "error",
                                    message: error.response.data.message
                                }
                            }
                            else {
                                throw error
                            }
                        }
                    })
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
            },
            validateInputs() {
                if (this.valid) {
                    this.modal = true
                }
            },
            pushPreviousPage() {
                if (this.$router.referrer.path === '/user/all') {
                    this.$router.push({ name: 'adminUsers' });
                }
                else {
                    this.$router.push({name: 'adminEditCompanyUser', params: { company_id: this.presetCode } })
                }
            },
            pushAfterCompletion() {
                const message = this.$t('messageSnackBar.createSucceed')
                if (this.$router.referrer.path === '/user/all') {
                    this.$router.push({ name: 'adminUsers', params: { snackbarState: "success", snackbarMessage: message } });
                }
                else {
                    this.$router.push({name: 'adminEditCompanyUser', params: { snackbarState: "success", snackbarMessage: message, company_id: this.presetCode } })
                }
            },
            selectCompany(companyCode) {
                this.companyCode = companyCode
            },
            async getCompanyNameAsync() {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                const path = '/company'
                const myInit = {
                    queryStringParameters: {
                        companyCodes: this.presetCode
                    },
                }
                const response = await API
                    .get(apiName, path, myInit)

                Hub.dispatch('OverlayChannel', { event: 'end' })
                return response.data[0].companyName
            },
            openModal() {
                this.modal = true
            },
            closeModal() {
                this.modal = false
                this.confirmCheck = false
            },
            async getUser(mail) {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                const result = await API.get(apiName, '/user', { 
                    queryStringParameters: {
                        keyword: mail,
                        searchType: 'email',
                        limit: 1,
                        withAuthEvents: true
                    }})
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
                this.email = result.data[0].email
                this.username = result.data[0].username  
                this.authEvents = result.data[0].authEvents
                this.selectUserType = result.data[0].type
                this.note = result.data[0].note
            },
            async getUserTypes() {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                this.userTypeCodes = await API.get(apiName, '/code', { 
                    queryStringParameters: {
                        key: Const.CODE_KEYS.USER_TYPE
                    }})
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
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
    
    p {
        font-family: 'Noto Sans JP', sans-serif;
    }
</style>
