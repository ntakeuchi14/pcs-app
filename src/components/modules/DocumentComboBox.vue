<template>
        <v-autocomplete
            v-model="implNo"
            :items="items"
            item-text="title"
            item-value="implNo"
            :label="$t('common.sign')"
            :placeholder="$t('message.selectSign')"
            multiple
            outlined
            clearable
            autocomplete="new-password"
        >
            <template v-slot:item="data">
                <v-row justify="start">
                    <v-col cols="auto">
                        <span class="grey--text">{{ data.item.implNo }}</span>
                    </v-col>
                    <v-col cols="auto" class="d-inline-block text-truncate " style="max-width: 900px;">
                        <span>{{ data.item.title }}
                        </span>
                    </v-col>
                </v-row>
            </template>
            <template v-slot:selection="{ item,  selected }">
                <v-chip :input-value="selected" close  @click:close="remove(item)">
                    <strong>{{ item.title }}</strong>&nbsp;
                </v-chip>
            </template>
        </v-autocomplete>
</template>
<script>
    import { API } from 'aws-amplify';
    const apiName = 'PcsAPI';

    export default {
        data: () => ({
            data: [],
        }),
        props: {
            implNo: Array,
            teSt: String
        },
        watch: {
            implNo() {
                this.emitSelection(this.implNo)
             }
        },
        created() {
            this.getDocumentAsync()
        },
        computed: {
          items() {
              return this.data.map(e=>({
                implNo: e.impl_no,
                title: this.isJp ? e.title : e.titleEn
              }))
          }  
        },
        methods: {
            async getDocumentAsync() {
                await API
                    .get(apiName, '/document')
                    .then(function(response) {
                        this.data = response.data
                    }.bind(this))
            },
            emitSelection(implNo) {
                this.$emit('select', implNo)
            },
            remove(item) {
                this.implNo = this.implNo.filter(e=>e !== item.implNo)
            },
        }
    }
</script>
