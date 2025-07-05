<template>
    <div id="wrapper" v-if="isAdmin">
                <PageTitle id="pageTitle">{{pageTitle}}</PageTitle>
            
                <v-form ref="form" v-model="valid">
                    <div id="inputforms">                        
                        <v-row justify="start">
                            <v-col cols="1">
                                <RequiredItemChip />
                            </v-col>
                            <v-col cols="3" class="form">
                                <v-text-field
                                    v-model="gdbCode"
                                    :label="$t('company.csvHeaders.companyCode')"
                                    outlined
                                    :rules="[companyCodeRules, halfWidthIntRules]"
                                    required
                                    :maxlength="Const.FORM.COMPANY_CODE_LENGTH" autocomplete="new-password"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-col cols="1">
                                <RequiredItemChip />
                            </v-col>
                            <v-col cols="11" class="form">
                                <v-text-field
                                    :label="$t('company.csvHeaders.companyName')"
                                    :placeholder="$t('message.inputCompanyName')"
                                    v-model="companyName"
                                    :rules="companyNameRules"
                                    outlined
                                    required
                                    maxlength=255
                                    autocomplete="new-password"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-col cols="11" offset-md="1" class="form">
                                <v-text-field
                                    :label="$t('company.csvHeaders.phoneNumber')"
                                    :placeholder="$t('message.inputPhoneNumber')"
                                    v-model="phoneNumber"
                                    outlined
                                    :rules="[halfWidthIntSymbolRules]"
                                    required
                                    maxlength=20
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        
                        <v-row justify="start">
                            <v-col cols="3" offset-md="1" class="form">
                                <v-text-field
                                    :label="$t('company.csvHeaders.postCode')"
                                    :placeholder="$t('message.inputPostCode')"
                                    v-model="postCode"
                                    outlined
                                    :rules="[halfWidthIntSymbolRules]"
                                    required
                                    maxlength=12
                                ></v-text-field> 
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-col cols="11" offset-md="1" class="form">
                                <v-text-field
                                    :label="$t('company.csvHeaders.address')"
                                    :placeholder="$t('message.inputAddress')"
                                    v-model="address"
                                    outlined
                                    required
                                    maxlength=400
                                ></v-text-field>  
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-col cols="11" offset-md="1" class="form">
                                <DocumentComboBox @select="selectDocuments" :impl-no="documentImplNo" teSt="sssss"/>
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-col cols="11" offset-md="1" class="form">
                                <QuestionComboBox @select="selectQuestions" :multiple="true" :impl-no="questionImplNo" :label="$t('company.csvHeaders.question')" :placeholder="$t('message.inputQuestion')" :single-line="false" :dense="false" teSt="sssss"/>
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-col cols="11" offset-md="1" class="form">
                                <v-textarea
                                    :label="$t('company.csvHeaders.note')"
                                    v-model="note"
                                    outlined
                                    required
                                    maxlength=400
                                    auto-grow
                                ></v-textarea> 
                            </v-col>
                        </v-row>
                    </div>
                    
                    <div id="executeButtons">
                        <v-row justify="center">
                            <v-col cols="auto">
                        <v-btn depressed v-on:click="pushAdminAllCompanies()" color="primary">
                            {{$t('common.cancel')}}
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                                <CreateButtonWithModal
                                    ref="createButtonWithModal"
                                    @validate="validateInputs"
                                    @create="executeAction"
                                    :valid='valid'
                                    :buttonName="buttonName"
                                    :modalMessage="modalMessage"
                                />
                            </v-col>
                        </v-row>
                    </div>
                </v-form>
        
        <SwitchableSnackbars v-bind:snackbar="snackbar" />
    </div>
    
    <div id="error-wrapper" v-else>
        <p>{{$t('message.forbidden')}}</p>
    </div>
    
</template>
<script>
    import { Hub } from 'aws-amplify';
    const apiName = 'PcsAPI';
    import * as Const from '@/const.js'

    import RequiredItemChip from '@/components/parts/RequiredItemChip.vue'
    import CreateButtonWithModal from '@/components/modules/CreateButtonWithModal.vue'
    import SwitchableSnackbars from '@/components/modules/SwitchableSnackbars.vue'
    import DocumentComboBox from '@/components/modules/DocumentComboBox.vue'
    import QuestionComboBox from '@/components/modules/QuestionComboBox.vue'
    import PageTitle from '@/components/parts/PageTitle'

    export default {
        name: 'AdminCompanyPage',
        data() {
            return {
                mode: null,
                pagetitle: null,
                valid: true,
                companyCode: this.company_id,
                companyKeyVersion: null,
                companyName: null,
                gdbCode: null,
                companyNameRules: [
                    v => !!v
                ],
                phoneNumber: null,
                postCode: null,
                address: null,
                note: null,
                documentImplNo: [],
                questionImplNo: [],
                snackbar: {
                    state: null,
                    message: null
                    }
            }
        },
        props: {
            company_id: String
        },
        computed: {
            Const() {
                return Const
            },
            buttonName() {
                return this.mode === "create" ? this.$t('common.create') : this.$t('common.update')
            },
            modalMessage() {
                return this.mode === "create" ? this.$t('messageModal.createdConfirm') : this.$t('messageModal.updatedConfirm')
            },
        },
        components: {
            RequiredItemChip,
            CreateButtonWithModal,
            SwitchableSnackbars,
            DocumentComboBox,
            QuestionComboBox,
            PageTitle
        },
        async created() {
            if (!this.company_id) {
                this.pageTitle = this.$t('company.title.create')
                this.mode = "create"
            }
            else {
                this.pageTitle = this.$t('company.title.edit')
                this.mode = "edit"
                await this.setCompanyInfoAsync()
            }
        },
        methods: {
            executeAction() {
                switch (this.mode) {
                    case "create":
                        this.createCompanyAsync()
                        break
                    case "edit":
                        this.updateCompanyAsync()
                        break
                }
            },
            createCompanyAsync() {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                
                const path = '/company';
                const myInit = {
                    body: {
                        companyName: this.companyName,
                        gdbCode: this.gdbCode,
                        phoneNumber: this.phoneNumber,
                        postCode: this.postCode,
                        address: this.address,
                        note: this.note,
                        documentImplNo: this.documentImplNo,
                        questionImplNo: this.questionImplNo
                    }
                };

                this.apiPost(apiName, path, myInit)
                    .then(function() {
                        const message = this.$t('messageSnackBar.createSucceed')
                        this.$router.push({ name: 'adminCompanies', params: { snackbarState: "success", snackbarMessage: message } });
                    }.bind(this))
                    .catch(error => {
                        const key = `addCompany_${error.response.status}`

                        if (this.$t('errorDescription')[key]) {
                            this.snackbar = {
                                state: "error",
                                message: this.$t('errorDescription')[key]
                            }
                        }
                        else {
                            if (error.response.status === 400) {
                                this.snackbar = {
                                    state: "error",
                                    message: error.response.data.message
                                }
                            }
                            else {
                                throw new Error(error)
                            }
                        }
                    })
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    });
            },
            updateCompanyAsync() {
                Hub.dispatch('OverlayChannel', { event: 'start' })
                
                const path = '/company';
                const myInit = {
                    body: {
                        companyKey: {
                            companyCode: this.companyCode,
                            version: this.companyKeyVersion
                        },
                        companyName: this.companyName,
                        gdbCode: this.gdbCode,
                        phoneNumber: this.phoneNumber,
                        postCode: this.postCode,
                        address: this.address,
                        note: this.note,
                        documentImplNo: this.documentImplNo,
                        questionImplNo: this.questionImplNo
                    },
                };
                
                this.apiPut(apiName, path, myInit)
                    .then(function() {
                        const message = this.$t('messageSnackBar.updateSucceed')
                        this.$router.push({ name: 'adminCompanies', params: { snackbarState: "success", snackbarMessage: message } });
                    }.bind(this))
                    .catch(error => {
                        const key = `UPDATE_COMPANY_${error.response.status}`

                        if (this.$t('errorDescription')[key]) {
                            this.snackbar = {
                                state: "error",
                                message: this.$t('errorDescription')[key]
                            }
                        }
                        else {
                            if (error.response.status === 400) {
                                this.snackbar = {
                                    state: "error",
                                    message: error.response.data.message
                                }
                            }
                            else if (error.response.status === 409) {
                                this.snackbar = {
                                    state: "error",
                                    message: this.$t('errorDescription.status_409')
                                }
                            }
                            else {
                                throw new Error(error)
                            }
                        }
                    })
                    .finally(()=>{
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    });
            },
            async setCompanyInfoAsync() {
                Hub.dispatch('OverlayChannel', { event: 'start' })

                const path = '/company'
                const myInit = {
                    queryStringParameters: {
                        companyCodes: this.company_id
                    },
                }
                const response = await this.apiGet(apiName, path, myInit)
                    .finally(() => {
                        Hub.dispatch('OverlayChannel', { event: 'end' })
                    })
                if (response.data.length === 0) {
                    throw new Error('404')
                }

                this.companyKeyVersion = response.data[0].companyKey.version
                this.companyName = response.data[0].companyName
                this.gdbCode = response.data[0].gdbCode
                this.phoneNumber = response.data[0].phoneNumber
                this.note = response.data[0].note
                this.postCode = response.data[0].postCode
                this.address = response.data[0].address
                this.documentImplNo = response.data[0].documentImplNo
                this.questionImplNo = response.data[0].questionImplNo
            },
            validateInputs() {
                if (this.$refs.form.validate()) {
                    this.$refs.createButtonWithModal.openDialog()
                }
            },
            pushAdminAllCompanies() {
                this.$router.push({name: 'adminCompanies'});
            },
            selectDocuments(documentImplNo) {
                this.documentImplNo = documentImplNo
            },
            selectQuestions(questionImplNo) {
                this.questionImplNo = questionImplNo
            },
            companyCodeRules(v) {
                return (!!v && Const.FORM.COMPANY_CODE_LENGTH == v.length) || this.stringFormat(this.$t('company.validMessage.maxLength'), Const.FORM.COMPANY_CODE_LENGTH)
            },
            halfWidthIntRules(v) {
                if (!v) return true
                return !!v.match(/^[0-9]+$/) || this.$t('company.validMessage.format')
            },
            halfWidthIntSymbolRules(v) {
                if (!v) return true
                return !!v.match(/^[0-9!-/:-@]*$/) || this.$t('company.validMessage.format')
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
