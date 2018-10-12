<template>
  <div id="user-analytics">
    <b-container>
      <div v-if="user">
        <h1 class="float-left">{{user.lastName}}, {{user.firstName}}</h1>
        <b-form-checkbox id="checkbox1"
                     v-model="useAccordions"
                     :value="true"
                     :unchecked-value="false"
                     class="float-right">
          Use Accordions
        </b-form-checkbox>
        <div class="clearfix"></div>
        <h5>{{user.email}}</h5>
      </div>
      <hr />
      <div v-if="useAccordions">
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion1 variant="info" class="customAccHeader">Login and Logout History</b-btn>
          </b-card-header>
          <b-collapse id="accordion1" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-table striped hover bordered :items="instanceHistory"></b-table>
            </b-card-body>
          </b-collapse>
        </b-card>
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion2 variant="info" class="customAccHeader">General Statistics</b-btn>
          </b-card-header>
          <b-collapse id="accordion2" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-table striped hover bordered :items="generalStats" caption-top></b-table>
            </b-card-body>
          </b-collapse>
        </b-card>
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion3 variant="info" class="customAccHeader">Storylines</b-btn>
          </b-card-header>
          <b-collapse id="accordion3" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <div v-for="storyInfo in storyInfos" :key="storyInfo.id">
                <b-table striped hover bordered :items="storyInfo.choices" caption-top>
                  <template slot="table-caption">Vignette: {{storyInfo.section}} ({{storyInfo.level}}) {{storyInfo.avatar}} {{storyInfo.createdAt}}</template>
                </b-table>
                <b-table striped hover bordered :items="storyInfo.times" caption-top class="mb-4"></b-table>
              </div>
            </b-card-body>
          </b-collapse>
        </b-card>
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion4 variant="info" class="customAccHeader">TSQ Ratings</b-btn>
          </b-card-header>
          <b-collapse id="accordion4" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-table :sort-by.sync="tsqSortBy" :sort-desc.sync="tsqSortDesc" striped hover bordered :items="tsqRatings" :fields="tsqFields" caption-top></b-table>
            </b-card-body>
          </b-collapse>
        </b-card>
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion5 variant="info" class="customAccHeader">Minutes Spent by Character</b-btn>
          </b-card-header>
          <b-collapse id="accordion5" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-table v-for="(value, key) in minutesCharacterHistory" :key="key" striped hover bordered :items="value" caption-top>
                <template slot="table-caption">{{key}}</template>
              </b-table>
            </b-card-body>
          </b-collapse>
        </b-card>
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion6 variant="info" class="customAccHeader">Minutes Spent by Classroom</b-btn>
          </b-card-header>
          <b-collapse id="accordion6" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-table v-for="(value, key) in minutesClassroomHistory" :key="key" striped hover bordered :items="value" caption-top>
                <template slot="table-caption">{{key}}</template>
              </b-table>
            </b-card-body>
          </b-collapse>
        </b-card>
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn block href="#" v-b-toggle.accordion7 variant="info" class="customAccHeader">Storyline Metrics by Character</b-btn>
          </b-card-header>
          <b-collapse id="accordion7" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-table v-for="(value, key) in storylineAvatarDetails" :key="key" striped hover bordered :items="value" caption-top>
                <template slot="table-caption">{{key}}</template>
              </b-table>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
      <div v-else>
        <div class="analyticPiece">
          <h4>Login and Logout History</h4>
          <b-table striped hover bordered :items="instanceHistory"></b-table>
        </div>
        <div class="analyticPiece">
          <h4>General Statistics</h4>
          <b-table striped hover bordered :items="generalStats" caption-top></b-table>
        </div>
        <div class="analyticPiece">
          <h4>Storylines</h4>
          <div v-for="storyInfo in storyInfos" :key="storyInfo.id">
            <b-table striped hover bordered :items="storyInfo.choices" caption-top>
              <template slot="table-caption">Vignette: {{storyInfo.section}} ({{storyInfo.level}}) {{storyInfo.avatar}} {{storyInfo.createdAt}}</template>
            </b-table>
            <b-table striped hover bordered :items="storyInfo.times" caption-top class="mb-4"></b-table>
          </div>
        </div>
        <div class="analyticPiece">
          <h4>TSQ Ratings</h4>
          <b-table :sort-by.sync="tsqSortBy" :sort-desc.sync="tsqSortDesc" striped hover bordered :items="tsqRatings" :fields="tsqFields" caption-top></b-table>
        </div>
        <div class="analyticPiece">
          <h4>Minutes Spent by Character</h4>
          <b-table v-for="(value, key) in minutesCharacterHistory" :key="key" striped hover bordered :items="value" caption-top>
            <template slot="table-caption">{{key}}</template>
          </b-table>
        </div>
        <div class="analyticPiece">
          <h4>Minutes Spent by Classroom</h4>
          <b-table v-for="(value, key) in minutesClassroomHistory" :key="key" striped hover bordered :items="value" caption-top>
            <template slot="table-caption">{{key}}</template>
          </b-table>
        </div>
        <div class="analyticPiece">
          <h4>Storyline Metrics by Character</h4>
          <b-table v-for="(value, key) in storylineAvatarDetails" :key="key" striped hover bordered :items="value" caption-top>
            <template slot="table-caption">{{key}}</template>
          </b-table>
        </div>
      </div>

    </b-container>
  </div>
</template>

<script>

import Parse from 'parse'

const moment = require('moment')

const { reduce, has, forEach, mean } = require('lodash')

const Instance = Parse.Object.extend('Instance')
const Storyline = Parse.Object.extend('Storyline')
const Feedback = Parse.Object.extend('Feedback')

export default {
  data: () => {
    return {
      user: null,
      useAccordions: true,
      avatars: [],
      instanceHistory: [],
      minutesCharacterHistory: {},
      minutesClassroomHistory: {},
      storylineAvatarDetails: {},
      storyInfos: [],
      tsqRatings: [],
      tsqSortBy: 'date',
      tsqSortDesc: true,
      tsqFields: [
        {
          key: 'date',
          label: 'Date',
          sortable: true
        },
        {
          key: 'q1',
          label: 'How confident are you in managing current behavior problems in your classroom?',
          sortable: false
        },
        {
          key: 'q2',
          label: 'How confident are you in your ability to manage future behavior problems in your classroom?',
          sortable: false
        },
        {
          key: 'q3',
          label: 'What is the one thing you learned from playing IVT today and how will you apply that new learning in your classroom?',
          sortable: false
        }
      ],
      generalStats: []
    }
  },
  methods: {
    async populateAnalytics (userId) {
      const user = await new Parse.Query(Parse.User).get(userId)

      user.firstName = user.get('firstName')
      user.lastName = user.get('lastName')
      user.email = user.get('email')
      this.user = user

      const [instances, feedbacks, storylines] = await new Parse.Promise.all([
        await new Parse.Query(Instance).equalTo('user', user).find(),
        await new Parse.Query(Feedback).equalTo('user', user).find(),
        await new Parse.Query(Storyline)
          .equalTo('complete', true)
          .include('vignette.avatar.classroom')
          .equalTo('user', user).find()
      ])

      const totalSecsSpentByCharacter = {}
      const totalSecsSpentByClassroom = {}
      const totalDecSecsByLevel = {}
      const storylineAvatarDetails = {}

      const minutesCharacterHistory = {}
      const minutesClassroomHistory = {}
      const practiceHistory = {}
      const allStoryInfos = []

      let totalSecsAllSessions = 0
      let totalPractice = 0
      let totalPracticeReflection = 0
      let totalPracticeReflectionFeedback = 0

      storylines.forEach((storyline) => {
        const vignette = storyline.get('vignette')
        const level = vignette.get('level')
        const avatar = vignette.get('avatar')
        const classroom = avatar.get('classroom')
        const times = storyline.get('times')
        const logs = storyline.get('logs')

        const choices = []
        const decisionSecsSpent = []
        let durationObj = null

        logs.forEach(log => {
          if (log.action === 'DECISION') {
            durationObj = log
          } else if (log.action.includes('choice_') && durationObj) {
            const duration = durationObj.endDate - durationObj.startDate
            choices.push({
              action: log.action,
              time: duration + ' seconds'
            })
            decisionSecsSpent.push(duration)
            durationObj = null
          }
        })

        const storyInfo = {
          level,
          section: vignette.get('name'),
          choices,
          avatar: avatar.get('name'),
          createdAt: moment(storyline.createdAt).format('MM/DD/YYYY'),
          id: storyline.id,
          times: [
            { metric: 'Time Spent in Practice', value: this.secsToMinSecs(times['Practice']) || 'N/A' },
            { metric: 'Time Spent in Replay', value: this.secsToMinSecs(times['Replay']) || 'N/A' },
            { metric: 'Time Spent in Reflection', value: this.secsToMinSecs(times['Reflection']) || 'N/A' },
            { metric: 'Time Spent in Feedback', value: this.secsToMinSecs(times['Feedback']) || 'N/A' },
            { metric: 'Score', value: storyline.get('effectiveness') }
          ]
        }

        if (has(times, 'Practice') && has(times, 'Reflection') && has(times, 'Feedback'))
          totalPracticeReflectionFeedback++
        else if (has(times, 'Practice') && has(times, 'Reflection'))
          totalPracticeReflection++
        else if (has(times, 'Practice'))
          totalPractice++

        const secondsSpent = reduce(times, (result, value, key) => result += value, 0)
        totalSecsAllSessions += secondsSpent

        const avatarName = avatar.get('name')
        const classroomName = classroom.get('name')

        if (!has(totalSecsSpentByCharacter, avatarName))
          totalSecsSpentByCharacter[avatarName] = []

        if (!has(totalSecsSpentByClassroom, classroomName))
          totalSecsSpentByClassroom[classroomName] = []

        if (!has(totalDecSecsByLevel, level))
          totalDecSecsByLevel[level] = []

        if (!has(storylineAvatarDetails, avatarName))
          storylineAvatarDetails[avatarName] = {
            numEffective: 0,
            numPosMixed: 0,
            numUnique: new Set(),
            highestScore: 0
          }

        totalSecsSpentByCharacter[avatarName].push(secondsSpent)
        totalSecsSpentByClassroom[classroomName].push(secondsSpent)
        totalDecSecsByLevel[level].push(...decisionSecsSpent)

        const effectiveness = storyline.get('effectiveness')
        const endingsPosOrMixed = storyline.get('endingPosOrMixed')
        const uniqueId = storyline.get('uniqueId')

        if (effectiveness > 0.75) storylineAvatarDetails[avatarName].numEffective++
        if (endingsPosOrMixed) storylineAvatarDetails[avatarName].numPosMixed++
        if (uniqueId) storylineAvatarDetails[avatarName].numUnique.add(uniqueId)
        if (effectiveness > storylineAvatarDetails[avatarName].highestScore)
          storylineAvatarDetails[avatarName].highestScore = effectiveness

        allStoryInfos.push(storyInfo)
      })

      this.instanceHistory = instances.map((instance) => {
        return {
          login: moment(instance.get('start')).format('MM/DD/YY h:mm:ss A'),
          logout: moment(instance.get('end')).format('MM/DD/YY h:mm:ss A')
        }
      })

      forEach(totalSecsSpentByCharacter, (value, key) => {
        let total = 0

        minutesCharacterHistory[key] = value.map((val, indx) => {
          total += val
          const minutes = Math.floor(val / 60)
          const seconds = Math.floor(val - minutes * 60);

          return {
            session: indx,
            minutes: `${minutes} minutes, ${seconds} seconds`
          }
        })

        const minutes = Math.floor(total / 60)
        const seconds = Math.floor(total - minutes * 60);

        minutesCharacterHistory[key].push({
          session: 'Total',
          minutes: `${minutes} minutes, ${seconds} seconds`
        })
      })

      forEach(totalSecsSpentByClassroom, (value, key) => {
        let total = 0

        minutesClassroomHistory[key] = value.map((val, indx) => {
          total += val
          const minutes = Math.floor(val / 60)
          const seconds = Math.floor(val - minutes * 60);

          return {
            session: indx,
            minutes: `${minutes} minutes, ${seconds} seconds`
          }
        })

        const minutes = Math.floor(total / 60)
        const seconds = Math.floor(total - minutes * 60);

        minutesClassroomHistory[key].push({
          session: 'Total',
          minutes: `${minutes} minutes, ${seconds} seconds`
        })
      })

      forEach(storylineAvatarDetails, (value, key) => {
        practiceHistory[key] = [
          {
            metric: 'Number of Storylines > 75% Effectiveness',
            value: value.numEffective
          },
          {
            metric: 'Number of Storylines Positive or Mixed',
            value: value.numPosMixed
          },
          {
            metric: 'Number of Unique Storylines Completed',
            value: value.numUnique.size
          },
          {
            metric: 'Highest Effectiveness Score',
            value: value.highestScore
          }
        ]
      })

      this.minutesCharacterHistory = minutesCharacterHistory
      this.minutesClassroomHistory = minutesClassroomHistory
      this.storylineAvatarDetails = practiceHistory

      const minutes = Math.floor(totalSecsAllSessions / 60)
      const seconds = Math.floor(totalSecsAllSessions - minutes * 60);

      this.generalStats = [
        {
          metric: 'Total Minutes All Sessions',
          value: `${minutes} minutes, ${seconds} seconds`
        },
        {
          metric: 'Average Decision Time Level-2',
          value: `${Math.ceil(mean(totalDecSecsByLevel['Level-2'])) || 0} seconds`
        },
        {
          metric: 'Average Decision Time Level-3',
          value: `${Math.ceil(mean(totalDecSecsByLevel['Level-3'])) || 0} seconds`
        },
        {
          metric: 'Total Storylines: Practice, Reflection, and Feedback',
          value: totalPracticeReflectionFeedback
        },
        {
          metric: 'Total Storylines: Practice and Reflection',
          value: totalPracticeReflection
        },
        {
          metric: 'Total Storylines: Practice Only',
          value: totalPractice
        }
      ]

      this.tsqRatings = feedbacks.map(feedback => {
        return {
          date: moment(feedback.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          q1: feedback.get('q1'),
          q2: feedback.get('q2'),
          q3: feedback.get('q3')
        }
      })

      this.storyInfos = allStoryInfos
    },
    secsToMinSecs (val) {
      if (!val || val === 0) return null

      const minutes = Math.floor(val / 60)
      const seconds = Math.floor(val - minutes * 60)

      return `${minutes} minutes, ${seconds} seconds`
    }
  },
  created () {
    console.log('component created!')
    console.log(this.$route.params)
    this.populateAnalytics(this.$route.params.userId)
  }
}

</script>

<style scoped>
.analyticPiece {
  margin: 50px 0;
}
.analyticPiece h4 {
  margin-bottom: 20px;
}
.customAccHeader {
  background-color: #4674C1;
  border-color: #4674C1;
}
</style>
