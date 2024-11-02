<template>
  <div id="wrapper">
    <PageTitle id="pageTitle">{{$t('inquiry.title')}}</PageTitle>
    <div id="content" v-html="$t('inquiry.contents')"/>
  </div>
</template>
<script>
  import PageTitle from "@/components/parts/PageTitle";
  export default {
    name: "InquiryPage",
    components: {
      PageTitle,
    },
  };
</script>
<style scoped>
  #wrapper {
    margin: 0em 2em 1em 2em;
  }

  #pageTitle {
    margin: 0 0 2em 0;
  }
  
  #content {
   margin-right:auto;
   margin-left:auto;
   width:90%;
   text-align: left
  }
</style>
