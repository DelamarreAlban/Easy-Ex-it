<template>
  <div id="app">
    <div v-if="user">
      <router-view ref="router" class="customViews" />
    </div>
    <div v-else>
      <Login/>
    </div>
  </div>
</template>

<script>

import Login from '@/components/Login'


import { mapGetters } from 'vuex'

export default {
  name: 'app',
  computed: {
    ...mapGetters(['user']),
    showFeedback: { // not using mapGetter for this one
      // getter
      get: function () {
        return this.$store.getters.showFeedback
      },
      // setter
      set: function (newValue) {
        this.$store.commit('toggleFeedback', newValue)
      }
    }
  },
  created() {
    this.$store.dispatch('load')
  },
  components: { Login }
}
</script>

<style scoped>
 .customViews {
   /*background-color: white;
   position: absolute;
   top: 80px;
   width: calc(100% - 40px);
   max-height: calc(100% - 100px);
   left: 20px;
   border-radius: 5px;
   overflow-y: scroll;*/
   padding-top: 80px;
 }
</style>
