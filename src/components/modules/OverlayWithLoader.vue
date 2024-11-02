<template>
    <v-overlay :value="overlayWithLoader">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
</template>
<script>
    import { Hub } from 'aws-amplify';
    
    
    /*
      FIXME:
      チャンネル名 api は現状機能しないが、Amplifyによって保護されたチャンネル名であり、
      今後のアップデートで、チャンネル名 auth のように、Hub.dispatcherを使用しなくても
      api関連のイベントリスナーを使用できるようになる可能性がある。
      https://docs.amplify.aws/lib/utilities/hub/q/platform/js#channels
      
      Hub.dispatcherによるイベントの発火方法
      https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js#aws-regional-endpoints
     */

    export default {
        data() {
            return {
                overlayWithLoader: false
            }
        },
        created() {
            Hub.listen('OverlayChannel', (data) => {
                switch (data.payload.event) {
                    case 'start':
                        this.overlayWithLoader = true
                        break
                    case 'end':
                        this.overlayWithLoader = false
                        break
                }
            })
            
        }
    }
</script>
