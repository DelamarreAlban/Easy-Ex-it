<template>
  <div class="meetStudents">
    <b-container>
      <div class="customHeader">Time Played</div>
      <b-row>
        <b-col>
          <b-card no-body style="margin-bottom:20px;">
            <b-tabs pills vertical card v-model="studentIndex">
              <b-tab v-for="student in students" :key="student._id" @click="changeStudent(student.name)" :title="student.name">
                <b-img class="avatar" :src="student.image2" fluid center alt="Responsive image" />
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
        <b-col>
          <div role="tablist" v-if="showInstanceTable">
            <b-table striped hover bordered :items="instanceTable.items"></b-table>
            <!-- <div class="customBlock">
              Last Play Date : <span>{{sessionInfo.lastPlay}}</span>
            </div>
            <div class="customBlock">
              Total time played : <span>{{totalTime| secondsToMinutes}}</span> minutes
            </div>
            <div class="customBlock">
              Time played each week :
              <div class="row">
                <table class="table table-bordered">
                  <tr>
                    <td>Orientation Week : </td>
                    <td>{{(orientationMinutes || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 1 : </td> <td>{{(weekMinutes[0] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 2 : </td> <td>{{(weekMinutes[1] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 3 : </td> <td>{{(weekMinutes[2] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 4 : </td> <td>{{(weekMinutes[3] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 5 : </td> <td>{{(weekMinutes[4] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 6 : </td> <td>{{(weekMinutes[5] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 7 : </td> <td>{{(weekMinutes[6] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                  <tr>
                    <td>Week 8 : </td> <td>{{(weekMinutes[7] || 1) | secondsToMinutes }} minutes </td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="customBlock">
              Level Reached  : <span>{{sessionInfo.maxLevel}}</span>
            </div>
            <div class="customBlock">
              Level 2 effectiveness percentage score : <span>{{level2EffectivenessAvg | percentage}}</span>
            </div>
            <div class="customBlock">
              Level 3 effectiveness percentage score : <span>{{level3EffectivenessAvg | percentage}}</span>
            </div> -->
          </div>
          <p v-else="loading">Loading...</p>
          <b-alert :show="!showInstanceTable && !loading" variant="warning">No storylines completed on this avatar</b-alert>
        </b-col>
      </b-row>
      <b-btn class="controls" variant="outline-primary" @click="print()">Print</b-btn>
    </b-container>
  </div>
</template>

<script>
import Parse from 'parse'

import { mapGetters } from 'vuex'
import { findKey, forEach, filter } from 'lodash'
import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

export default {
  name: 'CharacterHistory',
  data: () => {
    return {
      selectedStudent: null,
      studentIndex: 0,
      showInstanceTable: false,
      level2EffectivenessAvg: 0,
      level3EffectivenessAvg: 0,
      orientationMinutes: 0,
      weekMinutes: [],
      totalTime: 0,
      loading: true,
      instanceCache: [],
      instanceTable: {
        items: []
      }
    }
  },
  methods: {
    changeStudent(name) {
      console.log('pushing')
      this.$router.push({
        name: "CharacterHistory",
        params: { studentName: name }
      })
    },
    async calculateSessionData(studentName) {
      console.log('test')

      this.loading = true
      this.showInstanceTable = false

      let instances = null

      if (this.instanceCache.length <= 0) {
        const Instance = Parse.Object.extend('Instance')
        this.instanceCache = await new Parse.Query(Instance).limit(1000).equalTo('user', this.user._user).ascending('createdAt').find()
      }

      instances = this.instanceCache
      const instanceSessionMap = {}

      this.sessions.forEach((session) => {
        if (session.vignette.avatar.get('name') === studentName) {
          const sessionCreationTime = moment(session._createdAt)
          const sessionInstance = instances.find((inst) => {
            const start = moment(inst.get('start'))
            const end = moment(inst.get('end'))
            return sessionCreationTime.isBetween(start, end)
          })

          if (!instanceSessionMap[sessionInstance.id])
            instanceSessionMap[sessionInstance.id] = {
              instance: sessionInstance,
              sessions: []
            }

          instanceSessionMap[sessionInstance.id].sessions.push(session)
        }
      })

      let instanceTableItems = []

      forEach(instanceSessionMap, (value, key) => {
        instanceTableItems.push({
          session_date: moment(value.instance.createdAt).format('MM/DD/YYYY'),
          minutes: value.sessions.reduce((acc, session) => {
            const times = session.times
            // adds up all values of  'times' object in storyline and converts to minutes
            const toAdd = Math.floor(Object.keys(times).reduce((ac, timeKey) => ac += times[timeKey], 0) / 60)
            return acc += toAdd
          }, 0)
        })
      })

      this.instanceTable.items = instanceTableItems
      this.showInstanceTable = instanceTableItems.length > 0
      this.loading = false
      // let key = findKey(this.students, { name: studentName })
      //
      // if (key) {
      //   this.selectedStudent = this.students[key]
      //   this.studentIndex = parseInt(key)
      // } else {
      //   this.changeStudent(this.students[0].name)
      //   return
      // }
      //
      // if(!this.selectedStudent) return
      //
      // let filteredSessions = filter(this.sessions, (o) => o.vignette.avatar.id === this.selectedStudent._id)
      // let playCount = filteredSessions.length
      // let maxLevel = 0
      // let totalPlay = 0
      // let allDates = []
      //
      // filteredSessions.forEach(session => {
      //   let tokens = session.level.split('-')
      //   if(tokens.length === 2 && tokens[0] === 'Level')
      //     maxLevel = Math.max(maxLevel, parseInt(tokens[1]))
      //   allDates.push(moment(session._createdAt))
      //   totalPlay += session.duration
      // })
      //
      // let lastPlay = allDates.length > 0 ? moment.max(allDates).format('MM/DD/YY h:mm a') : 'never'
      //
      // this.sessionInfo = {
      //   playCount,
      //   maxLevel,
      //   lastPlay,
      //   totalPlay
      // }
      // this.level2EffectivenessAvg = 0
      // this.level3EffectivenessAvg = 0
      // this.weekMinute = []
      // this.totalTime = 0
      //
      // let records1 = this.analytics['records1'] || null
      // if(!records1) return
      //
      // let minutesOfSessionPerAvatar = records1['minutesOfSessionPerAvatar'] || null
      // if(!minutesOfSessionPerAvatar) return
      //
      // let studentInQuestion = minutesOfSessionPerAvatar[this.selectedStudent.name] || null
      // if(!studentInQuestion) return
      //
      //
      //
      // let allInstances = Object.keys(studentInQuestion)
      // let weekMinutes = []
      // let orientationMinutes = 0
      //
      // //orientation week minutes not part of the total time counter
      // let startDateOrientation = moment(new Date(2018, 2, 12))
      // let endDateOrientation = moment(startDateOrientation)
      // endDateOrientation.add(7, 'days')
      // let rangeOrientation = moment.range(moment(startDateOrientation), moment(endDateOrientation))
      // let withinOrientation = allInstances.filter(instance => rangeOrientation.contains(moment(instance)))
      // let totalOrientation = 0
      // withinOrientation.forEach(wt => {
      //   let instanceInQuestion = studentInQuestion[wt]
      //   let sessionKeys = Object.keys(instanceInQuestion)
      //   totalOrientation += sessionKeys.reduce((acc, v) => acc += instanceInQuestion[v], 0)
      // })
      // orientationMinutes = totalOrientation
      // this.orientationMinutes = orientationMinutes
      //
      //
      // let startDate = moment(new Date(2018, 2, 19))
      // let endDate = moment(startDate)
      // //console.log(startDate.format('MMMM Do YYYY, h:mm:ss a'))
      // //console.log(endDate.format('MMMM Do YYYY, h:mm:ss a'))
      //
      // for(let i = 0; i < 8; i++) {
      //   endDate.add(7, 'days')
      //
      //   let range = moment.range(moment(startDate), moment(endDate))
      //
      //   let within = allInstances.filter(instance => range.contains(moment(instance)))
      //   let total = 0
      //
      //   within.forEach(wt => {
      //     let instanceInQuestion = studentInQuestion[wt]
      //     let sessionKeys = Object.keys(instanceInQuestion)
      //     total += sessionKeys.reduce((acc, v) => acc += instanceInQuestion[v], 0)
      //   })
      //
      //   weekMinutes.push(total)
      //   startDate = moment(endDate)
      // }
      //
      // this.weekMinutes = weekMinutes
      // this.totalTime = weekMinutes.reduce((acc, v) => acc += v, 0)
      //
      // let records3 = this.analytics['records3'] || null
      // if(!records3) return
      //
      // let gatekeeper = records3['gatekeeperLevel2PerAvatar'] || null
      // if(!gatekeeper) return
      //
      // let studentInQuestion2 = gatekeeper[this.selectedStudent.name] || null
      // if(!studentInQuestion2) return
      //
      // let sessionScoresAvg = studentInQuestion2['sessionScoresAvg'] || null
      //
      // if(!sessionScoresAvg) return
      //
      // let level2Scores = sessionScoresAvg['Level-2'] || []
      // if(level2Scores.length)
      //   this.level2EffectivenessAvg = level2Scores.reduce((acc,v) => acc+=v,0)/level2Scores.length
      //
      // let level3Scores = sessionScoresAvg['Level-3'] || []
      // if(level3Scores.length)
      //   this.level3EffectivenessAvg = level3Scores.reduce((acc,v) => acc+=v,0)/level3Scores.length


    },
    print() {
      window.print()
    }
  },
  filters: {
    secondsToMinutes(time) {
      return Math.floor(time / 60);
    },
    percentage(value, decimals) {
    	if(!value) value = 0;
    	if(!decimals) decimals = 0;

    	value = value * 100;
    	return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + "%";
    }
  },
  watch: {
    // '$route' (to, from) {
    //   if(to.name === "CharacterHistory") {
    //     // same route, update active student
    //     console.log('here')
    //     this.calculateSessionData()
    //   }
    // },
  },
  computed: {
    ...mapGetters(['user', 'students']),
    sessions() {
      // filter sessions to only completed ones
      return filter(this.$store.getters.sessions, { 'complete': true })
    }
  },
  beforeRouteUpdate(to, from, next) {
    console.log('wow')
    this.calculateSessionData(to.params.studentName || vm.students[0].name)
    next()
  },
  beforeRouteEnter(to, from, next) {
    console.log("\nENTERING\n")
    next(vm => {
      Promise.all([
        vm.$store.dispatch('getAvatars'),
        vm.$store.dispatch('getSessions')
      ])
      .then(success => vm.calculateSessionData(to.params.studentName || vm.students[0].name))
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bbg-1 {
  margin: 0 auto;
  margin-bottom: 50px;
}
h1 {
  margin-bottom: 30px;
}
.accordion {
  position: absolute;
  height: calc(100% - 150px);
  width: 100%;
  left: 0;
  top: 150px;
}
p span {
  font-weight: bold;
}
.customBlock {
  margin-bottom: 30px;
}
.customHeader {
  background-color: blue;
  border-radius: 5px;
  margin-bottom: 1rem;
  color: white;
  text-transform: uppercase;
  padding: 1.25rem 1.25rem;
  background: url('../assets/bg-dark.jpg') no-repeat fixed;
  font-size: 1.5em;
}
.controls {
  float: right;
  margin-bottom: 30px;
}
</style>
