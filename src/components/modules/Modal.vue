<template>
  <v-card>
    <v-card-title class="headline">
    </v-card-title>
    
    <v-card-text>
      <div v-if="isHtml" class="message-html" v-html="message"></div>
      <div v-else class='pa-10'>{{ message }}</div>
    </v-card-text>

    <v-divider></v-divider>

    <div id="yesOrNo" v-if="isVisivle.yesOrNo">
        <v-card-actions
         class="px-10"
        >
          <v-btn
            color="primary"
            text
            @click="submit"
            :disabled="disabled"
          >
            {{$t('modal.yes')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="close"
          >
            {{$t('modal.no')}}
          </v-btn>
        </v-card-actions>
      </div>

    <div id="ok" v-if="isVisivle.ok">
      <v-card-actions class="px-10" >
        <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="ok"
          >
            OK
          </v-btn>
          <v-spacer></v-spacer>
      </v-card-actions>
    </div>
  </v-card>

</template>

<script>
  export default {
    props: {
      message: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false
      },
      modalType: {
        type: String,
        default: "yesOrNo"
      },
      isHtml: {
        type: Boolean,
        defailt: false
      }
    },
    data() {
      return {
        isVisivle: {
          ok: false,
          yesOrNo: false
        }
      }
    },
    created() {
      switch (this.modalType) {
        case "ok":
          this.isVisivle.ok = true
          break
        default:
          this.isVisivle.yesOrNo = true
      }
    },
    methods: {
      submit() {
        this.$emit('clickSubmit')
      },
      close() {
        this.$emit('clickClose')
      },
      ok() {
        this.$emit('clickOk')
      }
    }
  }
</script>

<style>
 .message-html {
   margin: 10px;
   text-align: left;
   white-space: pre-line;
   font-size: 1.2rem;
   color: black;
 }
 .message-html li {
   font-size: 0.9rem;
 }
 .message-desc {
   font-size: 0.3rem;
   color:red;
 }
</style>
