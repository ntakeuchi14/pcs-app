<template>
  <v-menu v-model="menu" offset-y :close-on-content-click="false">
    <template 
      v-slot:activator="{ on }"
      v-if="isAdmin"
    >
      <v-btn icon color="primary" dark elevation="0" v-on="on">
        <v-icon>mdi-calendar</v-icon>
      </v-btn>
    </template>
    <v-date-picker 
      v-model="picker" 
      @click="menu = false"
      no-title
      locale="jp-ja"
      :day-format="date => new Date(date).getDate()"
    />
  </v-menu>
</template>
<script>
export default {
  props: {
    inputDate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      menu: false
    };
  },
  computed: {
    picker: {
      get() {
        return this.inputDate;
      },
      set(val) {
        this.menu = false;
        this.$emit("input", val);
      }
    }
  }
};
</script>