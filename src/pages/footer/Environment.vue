<template>
  <div id="wrapper">
    <PageTitle id="pageTitle">{{$t('menu.environment')}}</PageTitle>
    
    <div id="content">
      <h3>{{$t('environment.recommendBrowser')}}</h3>
      <p>{{$t('environment.message')}}</p>
      <ul>
        <li>{{$t('environment.browserFirefox')}}</li>
        <li>{{$t('environment.browserChrome')}}</li>
        <li>{{$t('environment.browserEdge')}}</li>
        <li>{{$t('environment.browserSafari')}}</li>
      </ul>
    </div>
  </div>
</template>
<script>
  import PageTitle from "@/components/parts/PageTitle";
  export default {
    name: "EnvironmentPage",
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
    margin-right: auto;
    margin-left: auto;
    width: 90%;
    text-align: left
  }
</style>
