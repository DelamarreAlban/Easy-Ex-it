import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import Home from '@/components/Home'
import Personality from '@/components/Personality'
// import Reflection from '@/components/Reflection'
import Profile from '@/components/Profile'
import Contact from '@/components/Contact'
import Feedback from '@/components/Feedback'
import PracticeHistory from '@/components/PracticeHistory'
import CharacterHistory from '@/components/CharacterHistory'
import LearnSchool from '@/components/LearnSchool'
import GameRules from '@/components/GameRules'
import MeetStudents from '@/components/MeetStudents'
import MeetColleagues from '@/components/MeetColleagues'
import ConfidenceRatings from '@/components/ConfidenceRatings'
import FinalReflections from '@/components/FinalReflections'
import TourClassroom from '@/components/TourClassroom'
import FAQ from '@/components/FAQ'
import Reflection from '@/components/Reflection'
import Admin from '@/components/Admin'
import OnlineCourse from '@/components/OnlineCourse'
import UserAnalytics from '@/components/UserAnalytics'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/Personality',
      name: 'Personality',
      component: Personality
    },
    {
      path:'/OnlineCourse',
      name: 'OnlineCourse',
      component: OnlineCourse
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact
    },
    {
      path: '/logs/practice/:studentName?/:sessionId?',
      name: 'PracticeHistory',
      component: PracticeHistory
    },
    {
      path: '/logs/confidence',
      name: 'ConfidenceRatings',
      component: ConfidenceRatings
    },
    {
      path: '/logs/reflections',
      name: 'FinalReflections',
      component: FinalReflections
    },
    {
      path: '/learn/school',
      name: 'LearnSchool',
      component: LearnSchool
    },
    {
      path: '/learn/rules/:ruleIndex',
      name: 'GameRules',
      component: GameRules
    },
    {
      path: '/learn/students/:studentName?',
      name: 'MeetStudents',
      component: MeetStudents
    },
    {
      path: '/logs/characters/:studentName?',
      name: 'CharacterHistory',
      component: CharacterHistory
    },
    {
      path: '/learn/colleagues/:colleagueName?',
      name: 'MeetColleagues',
      component: MeetColleagues
    },
    {
      path: '/tour',
      name: 'TourClassroom',
      component: TourClassroom
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: FAQ
    },
    {
      path: '/session/:sessionId',
      name: 'Reflection',
      component: Reflection
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin
    },
    {
      path: '/admin/analytics/:userId',
      name: 'UserAnalytics',
      component: UserAnalytics
    },
    {
      path: '*',
      component: Home
    }
  ]
})

router.afterEach((to, from) => {
  store.commit('clearAlert')
})

export default router
