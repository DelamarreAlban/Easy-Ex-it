<template>
  <div class="dismissableAlert">
    <b-alert :variant="alert.variant"
             dismissible
             :show="alert.show"
             @dismissed="clearAlert">
      {{alert.message}}
    </b-alert>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Alert',
  computed: {
    alert() { // not using mapGetter for this one
      return this.$store.getters.alert
    }
  },
  methods: {
    clearAlert() {
      this.$store.commit('clearAlert')
    }
  }
}
</script>

<style scoped>
</style>
