// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import Parse from 'parse'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-awesome/icons/long-arrow-right'

Vue.use(BootstrapVue);

Vue.config.productionTip = false

Parse.initialize('myAppId');
Parse.serverURL = '/parse'

import { mapGetters } from 'vuex'

/* eslint-disable no-new */
window.vm = new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  data: () => {
    return {
      instanceObj: null
    }
  },
  created() {
    window.addEventListener('onunload', this.beforePageDestroyed)
    this.instanceLoop()
  },
  methods: {
    beforePageDestroyed(event) {
      alert('beforePageDestroyed')
    },
    instanceLoop() {
      //things that could be user in every pages.
    }
  }
})
