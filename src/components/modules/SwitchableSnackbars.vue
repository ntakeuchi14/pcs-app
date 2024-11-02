<template>
    <div>
        <v-snackbar
            :timeout="timeout"
            v-model="visible"
            :color="color"
            text
            icon
            top
            centered>
            {{ snackbar.message }}
            <template v-slot:action="{ attrs }">
                <v-btn :color="color" text v-bind="attrs" @click="visible = false" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
</v-snackbar>
</div>
</template>
<script>
    export default {
        data() {
            return {
                timeout: 4000,
                color: null,
                visible: false
            }
        },
        props: {
            snackbar: Object
        },
        created() {
            this.switchSnackbarType()
        },
        watch: {
            snackbar: {
                handler() {
                    this.switchSnackbarType()
                },
                deep: true
            }
        },
        methods: {
            switchSnackbarType() {
                switch (this.snackbar.state) {
                    case "success":
                        this.color = "primary"
                        this.visible = true
                        break
                    case "error":
                        this.color = "error"
                        this.visible = true
                        break
                    default:
                        this.color = null
                        this.visible = false
                        break
                }
            }
        }
    }
</script>
