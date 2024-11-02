<template>
    <v-autocomplete v-if="!isPaste"
      v-model="code"
      :items="items"
      item-text="companyName"
      item-value="companyCode"
      :label="$t('common.company')"
      :placeholder="$t('message.selectCompany')"
      :rules="rules"
      outlined
      :multiple="multiple"
      required
      :dense="dense"
      :single-line="singleLine"
      :return-object="returnObject"
      clearable
      :counter="multiple"
      autocomplete="new-password"
    >
    <template v-slot:item="data">
            <v-row justify="start">
                <v-col cols="auto" class="d-inline-block text-truncate" style="max-width: 500px;">
                    <span>{{ data.item.companyName }}</span>
                </v-col>
            </v-row>
    </template>
    <template v-slot:selection="{ item, selected }">
        <v-chip :input-value="selected" close @click:close="remove(item)">
            <strong>{{ item.text }}</strong>&nbsp;
        </v-chip>
    </template>
    
    <template v-if="multiple && paste" v-slot:append-outer>
        <v-icon @click="prePaste">mdi-circle-edit-outline</v-icon>
    </template>
    </v-autocomplete>
    <v-textarea v-else filled clearable 
        v-model="companyCodeString" :label="$t('message.inputCompanyCode')">
    <template v-slot:append-outer>
        <v-icon @click="pasted">mdi-check-outline</v-icon>
    </template>
    </v-textarea>
</template>
<script>
    import { API } from 'aws-amplify';
    const apiName = 'PcsAPI';
    
    export default {
        data() {
            return {
                select: "",
                items: [],
                rules: this.selectRules,
                isPaste: false,
                companyCodeString: "",
            }
        },
        watch: {
            select() {
                this.emitSelection(this.select)
            },
            companyCode(val) {
                this.select = val
            }  
        },
        props: ['multiple', 'dense', 'selectRules', 'singleLine', 'companyCode', 'returnObject', 'paste'],
        created() {
            this.getCompaniesAsync()
        },
        computed: {
            code: {
                get() {
                    return this.companyCode
                },
                set(newVal) {
                    this.$emit('select', newVal)
                }
            }
        },
        methods: {
            async getCompaniesAsync() {
                await API
                    .get(apiName, '/company/all')
                    .then(function(response) {
                        this.items = this.formatResponse(response)
                    }.bind(this))
            },
            formatResponse(companies) {
                let items = []
                companies.forEach(function(company) {
                    const item = {
                        text: company.companyName,
                        companyName: `${company.gdbCode} ${company.companyName}`,
                        companyCode: company.companyCode,
                        gdbCode: company.gdbCode
                    }
                    items.push(item)
                })
                return items
            },
            emitSelection(companyCode) {
                this.$emit('select', companyCode)
            },
            remove(item) {
                if( this.multiple ) {
                    this.code = this.code.filter(e=>e.companyCode !== item.companyCode)
                } else {
                    this.code = undefined
                }
            },
            prePaste(){
                this.companyCodeString = this.code.map(c=>c.gdbCode).join("\t")
                this.isPaste=true
            },
            pasted(){
                const gdbCodes = this.companyCodeString ? this.companyCodeString.split("\t")
                    .map(e=>e.split(",")).flat()
                    .map(e=>e.split(" ")).flat()
                    .map(e=>e.split("\r\n")).flat()
                    .map(e=>e.split("\n")).flat() : []
                this.code = this.items.filter(item=>gdbCodes.indexOf(item.gdbCode)!==-1)
                this.companyCodeString = ""
                this.isPaste = false
            }
        }
    }
</script>
