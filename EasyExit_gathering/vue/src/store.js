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
    instance: null,
    alert: {},
    questions: {},
    scenarios: {},
    answers: {},
    simulations: {},
    choiceFrames: {},
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
    scenarios(state) {
      return state.scenarios
    },
    answers(state) {
      return state.answers
    },
    simulations(state) {
      return state.simulations
    },
    choiceFrames(state) {
      return state.choiceFrames
    },
    alert(state) {
      return {
        message: state.alert.message,
        variant: state.alert.variant,
        show: state.alert.message ? true : false
      }
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
    setAlert(state, alert) {
      state.alert = alert
    },
    clearAlert(state) {
      state.alert = {}
    },
    addQuestions(state, questions) {
      let newQuestions = {}
      questions.forEach((question, i) => {
        newQuestions[i] = {
          domain: question.get('domain'),
          type: question.get('type'),
          question: question.get('question'),
          order: question.get('order'),
          _id: question.id,
          _question: question
        }
      })

      state.questions = newQuestions
    },
    addScenarios(state, scenarios) {
      let newScenarios = {}
      scenarios.forEach((scenario, i) => {
        newScenarios[i] = {
          name: scenario.get('name'),
          image: scenario.get('image').url(),
          description: scenario.get('description'),
          _id: scenario.id,
          _scenario: scenario
        }
      })

      state.scenarios = newScenarios
    },
    addSimulations(state, simulations) {
      let newSimulations = {}
      simulations.forEach((simulation, i) => {
        newSimulations[i] = {
          user: simulation.get('user'),
          scenario: simulation.get('scenario'),
          complete: simulation.get('complete'),
          _id: simulation.id,
          _simulation: simulation
        }
      })

      state.simulations = newSimulations
    },
    addChoiceFrames(state, frames) {
      let newFrames = {}
      frames.forEach((frame, i) => {
        newFrames[i] = {
          simulation: frame.get('simulation'),
          output_strategy: frame.get('output_strategy'),
          _id: frame.id,
          _choiceFrame: frame
        }
      })

      state.choiceFrames = newFrames
    },
    addAnswers(state, answers) {
      let newAnswers = {}
      questions.forEach((answer, i) => {
        newAnswers[i] = {
          answer: answer.get('answer'),
          user: answer.get('user'),
          question: answer.get('question'),
          _id: answer.id,
          _answer: answer
        }
      })

      state.answers = newAnswers
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
    },
    setUserCount(state,count){
      state.userCount = count
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
    async getUserCount(context){
      let User = Parse.Object.extend('User')
      const existingUsers = await new Parse.Query(User).find()
      context.commit('setUserCount', existingUsers.length)
      return existingUsers.length
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
    setUserECAGender(context, gender){
          if(!context.getters.user) return
          let user = context.getters.user._user

          user.set('ecaGender',gender)

        },
    getQuestions({ commit }) {
      let Question = Parse.Object.extend('Question')

      let query = new Parse.Query(Question)

      return query.find({
        success: (questions) => commit('addQuestions', questions),
        error: (error, questions) => { console.log(error); return error }
      })
    },
    getScenarios({ commit }) {
      let Scenario = Parse.Object.extend('Scenario')

      let query = new Parse.Query(Scenario)

      return query.find({
        success: (scenarios) => commit('addScenarios', scenarios),
        error: (error, scenarios) => { console.log(error); return error }
      })
    },
    getSimulations({ commit }) {
      let Simulation = Parse.Object.extend('Simulation')

      let query = new Parse.Query(Simulation)

      return query.find({
        success: (simulations) => commit('addSimulations', simulations),
        error: (error, simulations) => { console.log(error); return error }
      })
    },
    async submitAnswers(context, newAnswers) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      //check if answer with same user and question exists
      //update value rather than creating new one
      let Answer = Parse.Object.extend('Answer')
      const existingAnswers = await new Parse.Query(Answer).include('question').equalTo('user', user).limit(10000).find()
      const dict = {}
      existingAnswers.forEach((answer) => {
        // expose question object
        answer.question = answer.get('question')
        answer.answer = answer.get('answer')
        // add to dictionary
        dict[answer.question.id] = answer
      })
      newAnswers.forEach((answer) => {
        let newAnswer = {}
        if(dict[answer.question._id]){
          newAnswer = dict[answer.question._id].set('answer',answer.answer.toString())
        }else{
          newAnswer = new Answer().set('user',user)
            .set('question',answer.question._question)
            .set('answer',answer.answer.toString())

        }

        if(newAnswer){
          // mark as dirty to know we need to save it
          answer.dirty = true

          dict[answer.question._id] = newAnswer
        }

      })

      const answersToSave = Object.keys(dict)
        .filter((key) => {
          const answer = dict[key]
          return answer.dirty
        })
        .map((key) => {
          return dict[key]
        })

      try{
          await new Parse.Object.saveAll(answersToSave)

        } catch(err) {
            console.log(err); return err
        }
    },
    submitChoiceFrame(context, frame) {
      if(!context.getters.user) return
      let user = context.getters.user._user

      //check if answer with same user and question exists
      //update value rather than creating new one

      let ChoiceFrame = Parse.Object.extend('ChoiceFrame')
      let choiceFrame = new ChoiceFrame().set('simulation',frame.simulation._simulation)
        .set('output_strategy',frame.output_strategy)

        choiceFrame.save(null, {
        success: (sim) => { console.log('choice frame saved ' + sim) },
        error: (choiceFrame, error) => console.log(error)
      })
    },
    logout({ commit }) {
      Parse.User.logOut().then(() => commit('setUser', null))
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
      context.dispatch('getCurrentUser')
    }
  }
})
