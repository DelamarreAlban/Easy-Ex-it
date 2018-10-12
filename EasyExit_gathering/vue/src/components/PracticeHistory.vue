<template>
  <div class="reflection">
    <div v-if="!selectedStudent && !selectedSession">
      <b-container>
        <div class="customHeader">Practice History</div>
        <b-alert show>Please select one student</b-alert>
        <b-row>
          <b-col lg="3" md="6" v-for="student in students" :key="student._id" @click="selectStudent(student)">
            <div class="customBlock">
              <b-img rounded="circle" fluid :src="student.image" />
              <h1>{{student.name}}</h1>
              <h2>{{student.classroomName}}</h2>
              <h2>{{student.behavior}}</h2>
            </div>
            <!-- <b-card-group>
              <b-card @click="activeStudent = student"
                      :title="student.name"
                      :img-src="" img-top
                      :class="activeStudent === student ? 'mb-1' : 'mb-2'">
                <div v-if="activeStudent === student">
                  <ul>

                  </ul>
                  <b-button @click="selectStudent(activeStudent)" variant="primary">Select this student</b-button>
                </div>
              </b-card>
            </b-card-group> -->
          </b-col>
        </b-row>
      </b-container>
    </div>
    <div v-else-if="selectedStudent && !selectedSession">
      <b-container>
        <h1 style="float:left">{{ selectedStudent.name }}</h1>
        <b-button @click="selectStudent(null)" variant="secondary" style="float:right">Go Back</b-button>
        <div class="clearfix"></div>
        <b-row>
          <b-col cols="4">
            <b-img class="avatar" :src="selectedStudent.image2" fluid center alt="Responsive image" />
          </b-col>
          <b-col cols="8">
            <b-alert show>Summary Score : All sessions to Date with {{selectedStudent.name}}</b-alert>
              <b-row style="padding-bottom:25px">
                <b-col cols="3">
                  <b-img style="height:100px" center :src="require('../assets/trophy.png')" fluid alt="Responsive image" />
                  Best Score so Far : <b>{{ highestEffectiveness | percentage }}</b>
                </b-col>
                <b-col cols="7">
                <b-row class="text-center">
                  <h4>Effectiveness percentage score of &gt;= 65%</h4>
                </b-row>
                <b-row class="text-center">
                  <p class="text-center">  You need to complete at least <b>{{ (highestEffectiveness >= 0.65) ? '0' : '1' }}</b> more storylines with an effectiveness score of 65% or higher. </p>
                  </b-row>
                </b-col>
              </b-row>
              <!-- <b-row style="padding-bottom:25px">
                <b-col cols="3">
                  <div style="">
                    <b-img style="height:100px;" center :src="require('../assets/book.png')" fluid alt="Responsive image" />
                    <b>{{endingsPos}}</b> Positive or Mixed Endings yet
                </div>
                </b-col>
                <b-col cols="7">
                <b-row class="text-center">
                    <h4>Positive or Mixed Ending</h4>
                </b-row>
                <b-row class="text-center">
                    <p class="text-center">You will need at least <b>{{Math.max(4 - endingsPos, 0)}}</b> more storylines with a positive or mixed ending.</p>
                  </b-row>
                </b-col>
              </b-row> -->
              <b-row style="padding-bottom:25px">
                <b-col cols="3" class="text-center">
                  <b-img style="height:100px ; margin-bottom:0px; object-fit: cover;" rounded="circle" fluid :src="selectedStudent.image" />
                  <b>{{uniqueStory}}</b> of 2 Unique storylines completed
                </b-col>
                <b-col cols="7">
                <b-row class="text-center">
                    <h4>Number of unique storylines completed</h4>
                </b-row>
                <b-row class="text-center">
                  <p class="text-center">  You will need to complete at least <b>{{Math.max(2 - uniqueStory, 0)}}</b> more unique storyline with {{selectedStudent.name}} </p>
                  </b-row>
                </b-col>
              </b-row>



          </b-col>
        </b-row>

        <div v-if="sessionTable.items.length > 0">
          <h4 class="title mt-5">Which section would you like to review?</h4>

          <!-- @row-clicked="selectSession" -->
          <b-table striped bordered hover
                   :sort-by.sync="sessionTable.sortBy"
                   :sort-desc.sync="sessionTable.sortDesc"
                   :items="sessionTable.items"
                   :fields="sessionTable.fields">
            <template slot="actions" slot-scope="row">
              <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
              <b-button size="sm" block @click.stop="selectSession(row.item)" class="mr-1">
                View
              </b-button>
            </template>
          </b-table>
          <!-- <b-card v-for="(session, key) in sessions" :key="session._id"
            :header="'Session ' + (parseInt(key) + 1)"
            :border-variant="session.ending.description === 'negative' ? 'danger' : 'primary'"
            :header-bg-variant="session.ending.description === 'negative' ? 'danger' : 'primary'"
            header-text-variant="white"

            class="test">
            <p>{{session.level}}</p>
            <p>{{session.ending.description === 'negative' ? 'Negative Ending' : 'Positive Ending'}}</p>
            <p>Score: 30%</p>
            <div slot="footer">
              <small class="text-muted">Completed on {{ session._createdAt | date }}</small>
            </div>
          </b-card> -->
        </div>
        <div v-else>
          <b-alert show>You have no sessions. Please complete a storyline</b-alert>
        </div>
      </b-container>
    </div>
    <div v-else-if="selectedStudent && selectedSession && storyboardData">
      <b-container>
        <h1 style="float:left">{{ selectedStudent.name }}</h1>
        <b-button @click="selectStudent(selectedStudent)" variant="secondary" style="float:right">Go Back</b-button>
        <div class="clearfix"></div>
      </b-container>
      <section class='st-3'>
        <b-container>
      <b-row>
        <b-col cols="4" style="position:relative">
          <div style="position:absolute">
            {{selectedStudent.classroomName}}<br>
            {{selectedStudent.behavior}}<br>
            LEVEL {{selectedSession.vignette.level.split('-')[1]}}
          </div>
          <b-img class="avatar" :src="selectedStudent.image2" fluid center alt="Responsive image" />
        </b-col>
        <b-col cols="7">

          <h4>Storyline Summary - Completed on {{selectedSession._createdAt | date }}</h4>

          <div class="storyline">
            <pie-example :chartData="chartData" :options="options" class="graphic"></pie-example>
            <div class="detail">
              <div class="text">
                <p><span>Effectiveness Percentage Score of</span> {{(storyboardData.correctDecisions / storyboardData.totalDecisions) | percentage}}</p>
                <p>{{storyboardData.correctDecisions}}/{{storyboardData.totalDecisions}} choices were effective</p>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>

          <div class="storyline">

            <b-img rounded="circle" :src="selectedStudent.image" fluid class="graphic" alt="Responsive image" />
            <div class="detail">
              <div class="text">
                <p><span>{{storyboardData.endType}} Ending</span></p>
                <p>{{storyboardData.endResult}}</p>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>


          <div class="storyline">
            <div class="graphic">
              <b-img blank rounded="circle" width="500" height="500" blank-color="#3DA3E8" fluid alt="Responsive image" />
              <p class="text">{{storyboardData.sessions}}</p>
            </div>
            <div class="detail">
              <div class="text">
                <p><span>Number of Storylines Completed</span></p>
                <p>You've cleared {{storyboardData.sessions}} unique storylines with {{selectedStudent.name}}</p>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
    </b-col>
    </b-row>
  </b-container>
</section>
      <div v-for="(decision, index) in activeDecisions" :key="decision._id">
        <section :class="index % 2 === 0 ? 'st-2': 'st-1'">
          <b-container>
            <h4 class="title">Decision Point {{index + 1}}</h4>
            <div v-if="index % 2 === 0">
              <b-row>
                <b-col cols="12">
                  <!-- Image -->
                  <!-- <b-img :src="decision.screenshot" fluid alt="Responsive image" /> -->
                  <b-card header="Decision description" bg-variant="light">
                    {{ decision.description }}
                  </b-card>
                  <!-- <b-img blank width="500" height="300" blank-color="#777" fluid alt="Responsive image" /> -->
                  <b-row>
                    <b-col>
                      <!-- My Choice -->
                      <b-card header="My Choice" bg-variant="light">
                        {{decision.choice.content}}
                      </b-card>
                    </b-col>
                    <b-col>
                      <!-- Feedback -->
                      <b-card header="Feedback"
                              :bg-variant="decision.choice.score == 1 ? 'success' : 'danger'"
                              text-variant="white">
                        <b-badge pill variant="light" class="card-score">{{ decision.choice.score == 1 ? '+1' : '0' }}</b-badge>
                        {{decision.choice.feedback}}
                      </b-card>
                    </b-col>
                  </b-row>
                  <b-row v-for="(reflection, ind) in activeReflections" :key="reflection._id" v-if="reflection._decision.id === decision._id">
                    <b-col>
                      <b-card :header="'Question ' + (ind + 1)" class="reflection">
                        <p><span>{{ reflection.question.text }}</span></p>
                        <p>{{ reflection.text }}</p>
                      </b-card>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </div>
            <div v-else>
              <b-row>
                <b-col cols="12">
                  <!-- Image -->
                  <!-- <b-img :src="decision.screenshot" fluid alt="Responsive image" /> -->
                  <b-card header="Decision description" bg-variant="light">
                    {{ decision.description }}
                  </b-card>
                  <!-- <b-img blank width="500" height="300" blank-color="#777" fluid alt="Responsive image" /> -->
                  <b-row>
                    <b-col>
                      <!-- My Choice -->
                      <b-card header="My Choice" bg-variant="light">
                        {{decision.choice.content}}
                      </b-card>
                    </b-col>
                    <b-col>
                      <!-- Feedback -->
                      <b-card header="Feedback"
                              :bg-variant="decision.choice.score == 1 ? 'success' : 'danger'"
                              text-variant="white">
                        <b-badge pill variant="light" class="card-score">{{ decision.choice.score == 1 ? '+1' : '0' }}</b-badge>
                        {{decision.choice.feedback}}
                      </b-card>
                    </b-col>
                  </b-row>
                  <b-row v-for="(reflection, ind) in activeReflections" :key="reflection._id" v-if="reflection._decision.id === decision._id">
                    <b-col>
                      <b-card :header="'Question ' + (ind + 1)" class="reflection">
                        <p><span>{{ reflection.question.text }}</span></p>
                        <p>{{ reflection.text }}</p>
                      </b-card>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </div>
          </b-container>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { find, filter } from 'lodash'
import { forEach } from 'lodash'
import PieExample from './PieChart.js'
import moment from 'moment'
import Parse from 'parse'

export default {
  name: 'PracticeHistory',
  data: () => {
    return {
      labels: [],
      datasets: [],
      selectedStudent: null,
      selectedSession: null,
      activeStudent: null,
      activeSessions: null,
      activeDecisions: null,
      activeReflections: null,
      storyboardData: null,
      effectiveness: 0,
      endingsPos: 0,
      uniqueStory: 0,
      highestEffectiveness: 0,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        }
      },
      sessionTable: {
        fields: [
          {
            key: 'level',
            sortable: true
          },
          {
            key: 'ending',
            sortable: true
          },
          {
            key: 'score',
            sortable: true
          },
          {
            key: 'completed_on',
            sortable: true
          },
          {
            key: 'actions',
            label: ' ',
            sortable: false
          }
        ],
        items: [],
        sortBy: 'completed_on',
        sortDesc: false,
      }
    }
  },
  watch: {
    storyboardData: function(val) {
      console.log('in watch')
      console.log(val)
      let correct = val.correctDecisions
      let incorrect = val.totalDecisions - correct
      let labels = ['Positive', 'Negative']
      let datasets = [{
        data: [correct, incorrect],
        backgroundColor: ['#3DA3E8', '#CCCCCC']
      }]
      this.labels = labels
      this.datasets = datasets
    }
  },
  methods: {
    selectStudent(student) {
      let route = {
        name: "PracticeHistory"
      }
      if(student) {
        // route.name = "PracticeHistoryStudent"
        route.params = { studentName: student.name }
      }
      this.$router.push(route)
    },
    selectSession(session) {
      let route = {
        name: "PracticeHistory"
      }
      if(session && this.selectedStudent) {
        // route.name = "PracticeHistorySession"
        route.params = { studentName: this.selectedStudent.name, sessionId: session.id }
      }
      this.$router.push(route)
    },
    // getScoreFromGatekeeper(sessionDate, avatarName) {
    //   let records3 = this.analytics['records3'] || null
    //   if(!records3) return

    //   console.log('here')

    //   let gatekeeper = records3['gatekeeperLevel2PerAvatar'] || null
    //   if(!gatekeeper) return

    //   console.log('where')
    //   console.log(avatarName)

    //   let studentInQuestion = gatekeeper[avatarName] || null
    //   if(!studentInQuestion) return

    //   console.log('there')

    //   let sessionScores = studentInQuestion['sessionScores'] || null
    //   if(!sessionScores) return

    //   console.log(sessionScores)
    //   console.log(sessionDate)

    //   return sessionScores[sessionDate] || 0
    // },
    resolveForStudent() {
      if(!this.selectedStudent) return

      let items = []
      forEach(this.sessions, (session, key) => {
        if(session.vignette.avatar.id === this.selectedStudent._id) {
          items.push({
            id: session._id,
            level: session.level,
            ending: session.ending.score > 1 ? 'Positive' : session.ending.score > 0 ? 'Mixed' : 'Negative',
            score: this.$options.filters.percentage(session.effectiveness),
            completed_on: moment(session._createdAt).format('MM/DD/YY'),
            _session: session
          })
        }
      })
      this.sessionTable.items = items
    },
    resolveForSession() {
      if(!this.selectedSession) return

      console.log(this.selectedSession)

      let Decision = Parse.Object.extend('Decision')
      let query = new Parse.Query(Decision)

      query.equalTo('storyline', this.selectedSession._session)
      query.include('choice')

      query.find({
        success: (decisions) => {
          let newDecisions = []
          let correct = 0

          decisions.forEach((decision, i) => {
            let screenshot = decision.get('screenshot')

            newDecisions[i] = {
              choice: {
                type: decision.get('choice').get('type'),
                score: decision.get('choice').get('score'),
                feedback: decision.get('choice').get('feedback'),
                content: decision.get('choice').get('content'),
                _id: decision.get('choice').id,
                _choice: decision.get('choice')
              },
              description: decision.get('description'),
              screenshot: screenshot ? screenshot.url() : null,
              duration: decision.get('duration'),
              _id: decision.id,
              _decision: decision
            }
            if(newDecisions[i].choice.score > 0) correct++
          })

          this.activeDecisions = newDecisions
          this.storyboardData = {
            totalDecisions: decisions.length,
            correctDecisions: correct,
            sessions: filter(this.sessionTable.items, { level: this.selectedSession.level }).length,
            endResult: this.selectedSession.ending.content,
            endType: this.selectedSession.ending.score > 1 ? 'Positive' : this.selectedSession.ending.score > 0 ? 'Mixed' : 'Negative'
          }

          let Reflection = Parse.Object.extend('ReflectionAnswer')

          let query = new Parse.Query(Reflection)

          query.containedIn('decision', decisions)
          query.include('question')

          query.find({
            success: (reflections) => {
              let newReflections = []

              reflections.forEach((reflection, i) => {
                newReflections[i] = {
                  question: {
                    text: reflection.get('question').get('text'),
                    _id: reflection.get('question').id,
                    _question: reflection.get('question')
                  },
                  text: reflection.get('text'),
                  _id: reflection.get('id'),
                  _decision: reflection.get('decision'),
                  _reflection: reflection
                }

                this.activeReflections = newReflections
              })
            },
            error: (err, reflections) => console.log(err)
          })
        },
        error: (err, decisions) => console.log(err)
      })
    },
    checkRoute(routeParams) {
      console.log(routeParams)
      if(routeParams.studentName)
        this.selectedStudent = find(this.students, { name: routeParams.studentName }) || null
      else this.selectedStudent = null

      if(routeParams.sessionId)
        this.selectedSession = find(this.sessions, { _id: routeParams.sessionId }) || null
      else this.selectedSession = null

      this.resolveForStudent()
      this.resolveForSession()

      if(!this.selectedStudent || !this.gatekeepers) return


      let studentInQuestion = this.gatekeepers[this.selectedStudent._id] || null
      if(!studentInQuestion) return

      // this.effectiveness = Math.max(studentInQuestion['effectivenessCounters'])
      // this.endingsPos = studentInQuestion['endingsPosOrMixed'] || 0
      this.uniqueStory = studentInQuestion['uniqueStorylines'].length || 0
      this.highestEffectiveness = Math.max(...studentInQuestion['effectivenessCounters'], 0)
    }
  },
  filters: {
    date(timestamp) {
      return moment(timestamp).format('MM/DD/YY')
    },
    percentage(value, decimals) {
    	if(!value) value = 0;
    	if(!decimals) decimals = 0;

    	value = value * 100;
    	return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + "%";
    }
  },
  computed: {
    ...mapGetters(['classrooms', 'students', 'gatekeepers']),
    sessions() {
      // filter sessions to only completed ones
      return filter(this.$store.getters.sessions, { 'complete': true })
    },
    chartData() {
      return {
        labels: this.labels,
        datasets: this.datasets
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    console.log('wow')
    this.checkRoute(to.params)
    next()
  },
  beforeRouteEnter(to, from, next) {
    console.log("\nENTERING")
    next(vm => {
      Promise.all([
        vm.$store.dispatch('getAvatars'),
        vm.$store.dispatch('getSessions'),
        vm.$store.dispatch('getGatekeepers')
      ])
      .then(success => {
        vm.checkRoute(to.params)
      })
    })
  },
  components: { PieExample }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mb-1, .mb-2, .mb-3 {
  max-width: 20rem;
  margin: 0 auto;
  transition: opacity 0.5s;
}
.mb-2, .mb-3 {
  cursor: pointer;
}
.mb-2 {
  opacity: 0.75;
}
.mb-2:hover {
  opacity: 1;
}
.mb-2 .card-body,
.mb-3 .card-body {
  position: absolute;
  bottom: 0;
  left: 0;
  color: white;
  text-shadow: 0px 1px black;
}
.mb-3 .card-body::after {
  position: absolute;
  background-color: black;
  z-index: 2;
}
.mb-3 .card::after {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color:black;
}
h4 {
  color: inherit;
}
ul {
  padding-left: 30px;
}
.mb-2 h4, .mb-3 h4 {
  margin-bottom: 0;
}
.card-deck {
  margin-top: 30px;
}
.test {
  margin: 0 10px;
  width: calc(50% - 20px);
  float: left;
  margin-top: 20px;
}
.test p:last-child {
  margin-bottom: 0;
}
.title {
  margin-bottom: 30px;
}
.st-1 {
  background-color: white;
  width: 100%;
  padding: 40px;
}
.st-2 {
  background-color: whitesmoke;
  width: 100%;
  padding: 40px;
}
.st-3 {
  background-color: white;
  width: 100%;
  padding: 40px;
}
.corner-title {
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px;
  border: 1px solid #bee5eb;
  color: #0c5460;
  border-radius: 0.25rem;
  background-color: #d1ecf1;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform:    translate(-50%, -50%);
  -ms-transform:     translate(-50%, -50%);
  -o-transform:      translate(-50%, -50%);
  transform:         translate(-50%, -50%);
}
.card-score {
  position: absolute;
  top: 15px;
  right: 15px;
}
.card {
  margin-bottom: 30px;
}
.card-body p:last-child, .text p:last-child {
  margin-bottom: 0;
}

p span {
  font-weight: bold;
}
.storyline .graphic {
  position: absolute;
  text-align: center;
  object-fit: cover;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform:    translateY(-50%);
  -ms-transform:     translateY(-50%);
  -o-transform:      translateY(-50%);
  transform:         translateY(-50%);
  width: 100px;
  height: 100px;
}
.storyline {
  height: 150px;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}
.storyline .detail {
  margin-left: 100px;
  padding-left: 20px;
  max-width: calc(100% - 100px);
  height: 150px;
  position: relative;
}

.graphic .text {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform:    translateY(-50%);
  -ms-transform:     translateY(-50%);
  -o-transform:      translateY(-50%);
  transform:         translateY(-50%);
  color: white;
  font-size: 2em;
  width: 100%;
}

.detail .text {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform:    translateY(-50%);
  -ms-transform:     translateY(-50%);
  -o-transform:      translateY(-50%);
  transform:         translateY(-50%);
}
.customBlock {
  text-align: center;
  margin-bottom: 40px;
}
.customBlock img {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.5s;
  -webkit-transition: opacity 0.5s;
}
.customBlock img:hover {
  opacity: 1;
}
.customBlock h1 {
  margin: 15px 0;
  font-size: 1.75rem;
}
.customBlock h2 {
  font-size: 1.25rem;
  color: gray;
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
h1 {
  margin-bottom: 30px;
}
</style>
