<template>
  <v-card>
    <div style="padding:10px">
      <p class="message"> {{ message }} </p>
    </div>
    <div>
      <textarea class="text_area" v-model="reason" name="comment" maxlength=400></textarea>
    </div>

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
      }
    },
    data() {
      return {
        isVisivle: {
          ok: false,
          yesOrNo: false
        },
        reason: ""
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
        this.$emit('clickSubmit', this.reason)
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
 .message {
   margin: 10px 40px 10px 40px;
   text-align: left;
   white-space: pre-line;
 }

  .text_area {
    border: 1px solid #000;
    margin: 10px;
    resize: none;
    width:400px;
    height:100px;
    padding: 5px;
 }
</style>
