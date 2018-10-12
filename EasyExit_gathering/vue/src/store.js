/*
  Below is the state management system for the Vue application. It's main
  function is to keep a consistent and predictable state of the system. In other
  words, through this system you can access shared data as well as mutate the
  shared data. Mutations are done with actions, and you can get the data using
  getters. More information can be found here: https://vuex.vuejs.org/en/
*/

import Vue from 'vue'
import Vuex from 'vuex'
import Parse from 'parse'
import { forEach, max, isBoolean, isString, isObject } from 'lodash'
// import * as actions from './actions'
// import * as getters from './getters'

Vue.use(Vuex)

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function capitalize(word) {
  return word[0].toUpperCase() + word.substr(1).toLowerCase()
}

function isValidEmail(emailAddress) {
  if(!isString(emailAddress)) return false
  var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
  return pattern.test(emailAddress);
};

export default new Vuex.Store({
  state: {
    user: null,
    showFeedback: false,
    instance: null,
    alert: {},
    questions: {},
    classrooms: {},
    students: {},
    colleagues: {},
    descriptions: {},
    sessions: {},
    vignettes: {},
    feedbacks: {},
    gatekeepers: {},
    supports: {},
    supportCount: 0,
    users: {},
    userCount: 0
  },
  getters: {
    user(state) {
      return state.user
    },
    questions(state) {
      return state.questions
    },
    instance(state) {
      return state.instance
    },
    classrooms(state) {
      return state.classrooms
    },
    students(state) {
      return state.students
    },
    colleagues(state) {
      return state.colleagues
    },
    descriptions(state) {
      return state.descriptions
    },
    showFeedback(state) {
      return state.showFeedback
    },
    sessions(state) {
      return state.sessions
    },
    vignettes(state) {
      return state.vignettes
    },
    feedbacks(state) {
      return state.feedbacks
    },
    gatekeepers(state) {
      return state.gatekeepers
    },
    alert(state) {
      return {
        message: state.alert.message,
        variant: state.alert.variant,
        show: state.alert.message ? true : false
      }
    },
    supports(state) {
      return state.supports
    },
    supportCount (state) {
      return state.supportCount
    },
    users(state) {
      return state.users
    },
    userCount (state) {
      return state.userCount
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user ? {
        email: user.get('email'),
        //fullName: capitalize(user.get('firstName')) + ' ' + capitalize(user.get('lastName')),
        //useWebcam: user.get('useWebcam'),
        //avatar: user.get('avatar') ? user.get('avatar').url() : null,
        //admin: user.get('admin'),
        _user: user
      } : null
    },
    toggleFeedback(state, toggle) {
      state.showFeedback = toggle
    },
    setAlert(state, alert) {
      state.alert = alert
    },
    clearAlert(state) {
      state.alert = {}
    },
    updateInstance(state, instance) {
      state.instance = instance
    },
    addQuestions(state, questions) {
      let newQuestions = {}
      questions.forEach((question, i) => {
        newQuestions[i] = {
          domain: question.get('domain'),
          type: question.get('type'),
          question: question.get('question'),
          _id: question.id,
          _question: question
        }
      })

      state.questions = newQuestions
    },
    addClassrooms(state, classrooms) {
      let newClassrooms = {}
      classrooms.forEach((classroom, i) => {
        newClassrooms[i] = {
          name: classroom.get('name'),
          image: classroom.get('image').url(),
          order: classroom.get('order'),
          disabled: classroom.get('disabled'),
          _id: classroom.id,
          _classroom: classroom
        }
      })

      state.classrooms = newClassrooms
    },
    addStudents(state, students) {
      let newStudents = {}
      students.forEach((student, i) => {
        newStudents[i] = {
          name: student.get('name'),
          behavior: student.get('behavior'),
          image: student.get('image').url(),
          image2: student.get('image2').url(),
          classroom: student.get('classroom').id,
          classroomName: student.get('classroom').get('name'),
          order: student.get('order'),
          disabled: student.get('disabled'),
          _id: student.id,
          _classroom: student.get('classroom'),
          _student: student
        }
      })
      state.students = newStudents
    },
    addColleagues(state, colleagues) {
      let newColleagues = {}
      colleagues.forEach((colleague, i) => {
        newColleagues[i] = {
          name: colleague.get('name'),
          image: colleague.get('image').url(),
          image2: colleague.get('image2').url(),
          classroom: colleague.get('classroom').id,
          order: colleague.get('order'),
          disabled: colleague.get('disabled'),
          _id: colleague.id,
          _classroom: colleague.get('classroom'),
          _colleague: colleague
        }
      })
      state.colleagues = newColleagues
    },
    addDescriptions(state, descriptions) {
      let newDescriptions = {}
      descriptions.forEach((description, i) => {
        newDescriptions[i] = {
          header: description.get('header'),
          text: description.get('text'),
          avatar: description.get('avatar').id,
          order: description.get('order'),
          _id: description.id,
          _avatar: description.get('avatar'),
          _description: description
        }
      })
      state.descriptions = newDescriptions
    },
    addSessions(state, sessions) {
      let newSessions = {}
      sessions.forEach((session, i) => {
        newSessions[i] = {
          name: session.get('vignette').get('name'),
          level: session.get('vignette').get('level'),
          complete: session.get('complete'),
          effectiveness: session.get('effectiveness'),
          duration: null, // populated below
          ending: null, // populated below
          times: session.get('times'),
          vignette: {
            id: session.get('vignette').id,
            avatar: session.get('vignette').get('avatar'),
            section: session.get('vignette').get('name'),
            level: session.get('vignette').get('level')
          },
          _id: session.id,
          _createdAt: session.createdAt,
          _ending: session.get('ending'),
          _vignette: session.get('vignette'),
          _session: session
        }

        // extra fields filled in if exist
        if(newSessions[i].complete) {
          newSessions[i].ending = {
            id: session.get('ending').id,
            score: session.get('ending').get('score'),
            description: session.get('ending').get('feedback'),
            content: session.get('ending').get('content')
          }
          newSessions[i].duration = session.get('duration')
        }
      })
      state.sessions = newSessions
    },
    addVignettes(state, vignettes) {
      let newVignettes = {}
      vignettes.forEach((vignette, i) => {
        newVignettes[i] = {
          name: vignette.get('name'),
          level: vignette.get('level'),
          behavior: vignette.get('behavior'),
          classroom: vignette.get('classroom').id,
          avatar: vignette.get('avatar').id,
          _id: vignette.id,
          _avatar: vignette.get('avatar'),
          _classroom: vignette.get('classroom'),
          _vignette: vignette
        }
      })
      state.vignettes = newVignettes
    },
    addFeedbacks(state, feedbacks) {
      let newFeedbacks = {}
      feedbacks.forEach((feedback, i) => {
        newFeedbacks[i] = {
          q3: feedback.get('q3'),
          _id: feedback.id,
          _createdAt: feedback.createdAt,
          _feedback: feedback
        }
      }),
      state.feedbacks = newFeedbacks
    },
    addGatekeepers(state, gatekeepers) {
      console.log(gatekeepers)
      let newGatekeepers = {}

      gatekeepers.forEach((gatekeep) => {
        const avatarId = gatekeep.get('avatar').id

        newGatekeepers[avatarId] = {
          uniqueStorylines: gatekeep.get('uniqueStorylines'),
          endingsPosOrMixed: gatekeep.get('endingsPosOrMixed'),
          level: gatekeep.get('level'),
          effectivenessCounters: gatekeep.get('effectivenessCounters'),
          avatar: gatekeep.get('avatar'),
          _id: gatekeep.id,
          _gatekeeper: gatekeep
        }
      })

      console.log(newGatekeepers)

      state.gatekeepers = newGatekeepers
    },
    addSupports(state, [supports, countObj]) {
      let newSupports = []

      supports.forEach((support, indx) => {
        support.user = support.get('user')
        support.user.firstName = support.user.get('firstName')
        support.user.lastName = support.user.get('lastName')
        support.message = support.get('message')
        newSupports[indx] = support
      })

      state.supports = newSupports
      state.supportCount = countObj.get('supportCount')
    },
    addUsers(state, [users, countObj]) {
      let newUsers = []

      users.forEach((user, indx) => {
        user.firstName = user.get('firstName')
        user.lastName = user.get('lastName')

        newUsers[indx] = user
      })

      state.users = newUsers
      state.userCount = countObj.get('userCount')
    }
  },
  actions: {
    getCurrentUser(context) {
      let user = Parse.User.current()
      if(!user) return context.dispatch('logout')

      context.commit('setUser', user)

      let query = new Parse.Query("User")
      query.equalTo("objectId", user.id)

      return query.find()
        .then(success => context.commit('setUser', user))
        .catch(error => context.dispatch('logout'))
    },
    login({ commit }, form) {
      return Parse.User.logIn(form.email, form.password, {
        success: (user) => {
          console.log(user)
          commit('setUser', user)
      },
        error: (user, error) => { console.log(error); return error }
      })
    },
    register({ commit }, form) {
      let user = new Parse.User()

      user.set('username', form.email)
      user.set('password', form.password)
      user.set('email', form.email)

      return user.signUp(null, {
        success: (user) => user,
        error: (user, error) => { console.log(error); return error }
      })
    },
    setUserGender(context, gender){
      if(!context.getters.user) return
      let user = context.getters.user._user

      user.set('gender',gender)

    },
    getQuestions({ commit }) {
      let Question = Parse.Object.extend('Question')

      let query = new Parse.Query(Question)

      return query.find({
        success: (questions) => commit('addQuestions', questions),
        error: (error, questions) => { console.log(error); return error }
      })
    },
    async newUserPersonality(context, answers) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      let allAnswers = []
      for (var i in answers){

        let Answer = Parse.Object.extend('Answer')
        let answer = new Answer()
        answer.set('user', user)
        answer.set('question',answers[i].question._question)
        answer.set('answer',answers[i].answer.toString())

        allAnswers.push(answer)
      }

      try{
        console.log(allAnswers)
          await new Parse.Object.saveAll(allAnswers)

        } catch(err) {
            console.log(err); return err
        }
    },
    logout({ commit }) {
      Parse.User.logOut().then(() => commit('setUser', null))
    },
    newFeedback(context, form) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      let Feedback = Parse.Object.extend('Feedback')
      let feedback = new Feedback()

      feedback.set('user', user)
      forEach(form, (value, key) => feedback.set(key, value))

      feedback.set('instance', context.getters.instance)

      return feedback.save(null, {
        success: (feedback) => context.commit('toggleFeedback', false),
        error: (feedback, error) => { console.log(error); return error }
      })
    },
    newSupport(context, form) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      let Support = Parse.Object.extend('Support')
      let support = new Support()

      support.set('user', user)
      forEach(form, (value, key) => support.set(key, value))

      return support.save(null, {
        success: (support) => support,
        error: (support, error) => { console.log(error); return error }
      })
    },
    updateProfile(context, form) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      if(!isObject(form)) return

      if(isValidEmail(form.newEmail)) {
        user.set('username', form.newEmail)
        user.set('email', form.newEmail)
      }
      if(form.newPassword && form.newPassword != '') {
        user.set('password', form.newPassword)
      }
      if(isBoolean(form.useWebcam)) {
        user.set('useWebcam', form.useWebcam)
      }
      if(form.file != null) {
        let fileName = "avatar.jpg"
        let base64 = form.file.split('base64,')[1]

        // save image file, then save user object
        let parseFile = new Parse.File(fileName, { base64 })

        return parseFile.save().then(
          (file) => {
            user.set('avatar', file)
            return user.save(null, {
              success: (user) => context.commit('setUser', user),
              error: (user, error) => { console.log(error); return error }
            })
          },
          (file, error) => error
        )
      } else {
        // save user object only
        return user.save(null, {
          success: (user) => context.commit('setUser', user),
          error: (user, error) => { console.log(error); return error }
        })
      }
    },
    removeAvatar(context) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      user.unset('avatar');

      return user.save(null, {
        success: (user) => context.commit('setUser', user),
        error: (user, error) => { console.log(error); return error }
      })
    },
    getClassrooms({ commit }) {
      let Classroom = Parse.Object.extend('Classroom')

      let query = new Parse.Query(Classroom)

      return query.find({
        success: (classrooms) => commit('addClassrooms', classrooms),
        error: (error, classrooms) => { console.log(error); return error }
      })
    },
    getAvatars({ commit }) {
      let Avatar = Parse.Object.extend('Avatar')

      let query = new Parse.Query(Avatar)

      query.equalTo('type', 'student')
      query.include('classroom')

      return query.find({
        success: (students) => commit('addStudents', students),
        error: (error, students) => { console.log(error); return error }
      })
    },
    getColleagues({ commit }) {
      let Avatar = Parse.Object.extend('Avatar')

      let query = new Parse.Query(Avatar)

      query.equalTo('type', 'colleague')

      return query.find({
        success: (colleagues) => commit('addColleagues', colleagues),
        error: (error, colleagues) => { console.log(error); return error }
      })
    },
    getDescriptions({ commit }) {
      let Description = Parse.Object.extend('Description')

      let query = new Parse.Query(Description)

      return query.find({
        success: (descriptions) => commit('addDescriptions', descriptions),
        error: (error, descriptions) => { console.log(error); return error }
      })
    },
    getSessions(context) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      let Session = Parse.Object.extend('Storyline')

      let query = new Parse.Query(Session)

      query.equalTo('user', user)
      query.include('vignette')
      query.include('ending')

      return query.find({
        success: (sessions) => context.commit('addSessions', sessions),
        error: (error, sessions) => { console.log(error); return error }
      })
    },
    getVignettes(context) {
      let Vignette = Parse.Object.extend('Vignette')

      let query = new Parse.Query(Vignette)

      return query.find({
        success: (vignettes) => context.commit('addVignettes', vignettes),
        error: (error, vignettes) => { console.log(error); return error }
      })
    },
    getFeedbacks(context) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      let Feedback = Parse.Object.extend('Feedback')

      let query = new Parse.Query(Feedback)

      query.equalTo('user', user)

      return query.find({
        success: (feedbacks) => context.commit('addFeedbacks', feedbacks),
        error: (error, feedbacks) => { console.log(error); return error }
      })
    },
    getGatekeepers(context) {
      if(!context.getters.user) return

      let user = context.getters.user._user
      let Gatekeeper = Parse.Object.extend('Gatekeeper')
      let query = new Parse.Query(Gatekeeper)

      query.equalTo('user', user)

      return query.find({
        success: (gatekeepers) => { if(gatekeepers) return context.commit('addGatekeepers', gatekeepers) },
        error: (error, gatekeepers) => { console.log(error); return error }
      })
    },
    getSupports(context, { supportItemsPerPage, supportCurrentPage, sortBy, sortDesc, supportString }) {
      const Support = Parse.Object.extend('Support')
      const Counter = Parse.Object.extend('Counter')

      let firstNameQ = new Parse.Query(Support)
      let fnInner = new Parse.Query(Parse.User)
      fnInner.startsWith('firstName', supportString.toUpperCase())
      firstNameQ.matchesQuery('user', fnInner)

      let lastNameQ = new Parse.Query(Support)
      let lnInner = new Parse.Query(Parse.User)
      lnInner.startsWith('lastName', supportString.toUpperCase())
      lastNameQ.matchesQuery('user', lnInner)

      let query = Parse.Query.or(firstNameQ, lastNameQ)
      query.include('user')
      query.descending('createdAt')

      if (supportString != '') {
        // search is just a limit of 250
        query.limit(250)
      } else {
        query.limit(supportItemsPerPage)
        query.skip((supportCurrentPage - 1) * supportItemsPerPage)
      }

      let sortKey = null

      switch (sortBy) {
        case 'first_name': sortKey = 'firstName'; break
        case 'last_name': sortKey = 'lastName'; break
        case 'date': sortKey = 'createdAt'; break
        default: sortKey = 'createdAt'; sortDesc = true; break
      }

      if (sortKey && sortDesc) query.descending(sortKey)
      else if (sortKey && !sortDesc) query.ascending(sortKey)

      let countQ = new Parse.Query(Counter)

      return Parse.Promise.all([
        query.find(null),
        countQ.first()
      ])
      .then(payload => {
        context.commit('addSupports', payload)
        return payload
      })
    },
    getUsers(context, { userItemsPerPage, userCurrentPage, sortBy, sortDesc, userString }) {
      const Counter = Parse.Object.extend('Counter')

      let firstNameQ = new Parse.Query(Parse.User)
      firstNameQ.startsWith('firstName', userString.toUpperCase())

      let lastNameQ = new Parse.Query(Parse.User)
      lastNameQ.startsWith('lastName', userString.toUpperCase())

      let query = Parse.Query.or(firstNameQ, lastNameQ)

      query.descending('createdAt')

      if (userString != '') {
        // search is just a limit of 250
        query.limit(250)
      } else {
        query.limit(userItemsPerPage)
        query.skip((userCurrentPage - 1) * userItemsPerPage)
      }

      let sortKey = null

      switch (sortBy) {
        case 'first_name': sortKey = 'firstName'; break
        case 'last_name': sortKey = 'lastName'; break
        default: sortKey = 'first_name'; sortDesc = true; break
      }

      if (sortKey && sortDesc) query.descending(sortKey)
      else if (sortKey && !sortDesc) query.ascending(sortKey)

      let countQ = new Parse.Query(Counter)

      return Parse.Promise.all([
        query.find(null),
        countQ.first()
      ])
      .then(payload => {
        context.commit('addUsers', payload)
        return payload
      })
    },
    load(context) {
      context.dispatch('getClassrooms')
      context.dispatch('getAvatars')
      context.dispatch('getColleagues')
      context.dispatch('getDescriptions')
      context.dispatch('getVignettes')
      context.dispatch('getCurrentUser')
    }
  }
})
