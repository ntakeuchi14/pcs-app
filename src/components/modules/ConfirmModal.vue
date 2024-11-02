<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title class="headline">
      </v-card-title>
      <v-card-text>
        <div class='pa-10'>{{ message }}</div>
      </v-card-text>
      <v-divider></v-divider>
      <div>
        <v-card-actions class="px-10">
          <v-btn color="primary" text @click="submit">{{$t('modal.yes')}}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="close">{{$t('modal.no')}}</v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data() {
      return {
        dialog: false,
        message: undefined,
        ok: undefined,
        cancel: undefined,
      }
    },
    methods: {
      show(message) {
        this.message = message
        this.dialog = true;
        return  new Promise((resolve) => {
          this.ok = () => resolve(true)
          this.cancel = () => resolve(false)
        })
      },
      submit() {
        this.ok();
        this.dialog = false;
      },
      close() {
        this.cancel();
        this.dialog = false;
      },
    }
  }
</script>
<style>
</style>
