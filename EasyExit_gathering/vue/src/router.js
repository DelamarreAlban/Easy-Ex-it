import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import Gender from '@/components/Gender'
import ECAGender from '@/components/ECAGender'
import Personality from '@/components/Personality'
import Relationship from '@/components/Relationship'
import Scenarios from '@/components/Scenarios'
import UnityApp from '@/components/UnityApp'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Gender',
      component: Gender
    },
    {
      path: '/Personality',
      name: 'Personality',
      component: Personality
    },
    {
      path: '/Relationship',
      name: 'Relationship',
      component: Relationship
    },
    {
      path: '/ECAGender',
      name: 'ECAGender',
      component: ECAGender
    },
    {
      path: '/Scenarios',
      name: 'Scenarios',
      component: Scenarios
    },
    {
      path: '/UnityApp',
      name: 'UnityApp',
      component: UnityApp
    },
    {
      path: '*',
      component: Gender
    }
  ]
})

router.afterEach((to, from) => {
  store.commit('clearAlert')
})

export default router
