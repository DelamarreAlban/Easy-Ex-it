<template>
  <div class="reflection">
    <div v-if="placeholderTitle">
      <b-container>
        <h1>{{placeholderTitle}}</h1>
      </b-container>
    </div>
    <div v-else>
      <b-container>
        <div class="customHeader">Reflection</div>
        <b-row>
          <b-col cols="3">
            <b-img v-if="selectedDecision && selectedStudent" class="avatar" :src="selectedStudent.image2" fluid center alt="Responsive image" />
          </b-col>
          <b-col cols="9">
            <div class="unityFrameCover">
              <div id="unityFrame" ref="unityFrame" :class="selectedDecision ? 'small' : 'full'"></div>
            </div>
            <b-form class="unityFrameForm" @submit="showModal" v-if="selectedDecision && reflectionQuestions">
              <b-form-group v-for="question in reflectionQuestions" :key="question._id"
                            :label="question.text"
                            :label-for="question._id">
                <b-form-textarea required :id="question._id"
                                 v-model="question.answer"
                                 placeholder="Enter something"
                                 :rows="3"
                                 :max-rows="6">
                 </b-form-textarea>
              </b-form-group>
              <div>
              <b-button  type="submit" variant="primary">Submit reflection </b-button>

              <b-modal ref="reflectionValidatedMod" hide-footer hide-header title="">
                <div class="d-block text-center">
                You have completed your reflection and submitted it. Now you will receive feedback on your choices.
                </div>
                <b-btn @click="submitReflection" class="mt-3" variant="outline-primary" block> Get Your Feedback </b-btn>
              </b-modal>

            </div>
            </b-form>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { findKey, forEach, assign } from 'lodash'
import Parse from 'parse'

const Node = Parse.Object.extend('Node')
const Theme = Parse.Object.extend('ReflectionTheme')
const Question = Parse.Object.extend('ReflectionQuestion')
const Decision = Parse.Object.extend('Decision')
const Statistic = Parse.Object.extend('SessionStat')
const Answer = Parse.Object.extend('ReflectionAnswer')
const Phase = Parse.Object.extend('PhaseStat')
const MSBC = Parse.Object.extend('MSBC')

export default {
  name: 'Reflection',
  data: () => {
    return {
      currentPhase: 0,
      phases: [],
      decisionToSave: null,
      descriptionToSave: null,
      durationToSave: null,
      allNodes: [],
      allLogs: [],
      phaseTimes: {},
      games: {
        'test': {
          phases: ["DEFAULT", "PHASE1", "PHASE2", "PHASE3", "PHASE4"],
          src: '../../static/games/test/index.html',
          hotword: 'PHASE3'
        },
        'test2': {
          phases: ["DEFAULT", "PHASE1", "PHASE2", "PHASE3", "PHASE4"],
          src: '../../static/games/test2/index.html',
          hotword: 'PHASE3'
        },
        'Section-12': {
          phases: ["DEFAULT", "Practice", "Replay", "Reflect", "Feedback"],
          avatar: 'Michael',
          vignette: 'Section12',
          level: 'Level3',
          src: '../../static/games/Michael_Section12_Level3_WebGL/index.html',
          hotword: 'Reflect'
        },
        'Section-11': {
          phases: ["DEFAULT", "Practice", "Replay", "Reflect", "Feedback"],
          avatar: 'Michael',
          vignette: 'Section11',
          level: 'Level2',
          src: '../../static/games/Michael_Section11_Level2_WebGL/index.html',
          hotword: 'Reflect'
        },
        'Section-3': {
          phases: ["DEFAULT", "Practice", "Replay", "Reflect", "Feedback"],
          avatar: 'Jordan',
          vignette: 'Section3',
          level: 'Level2',
          src: '../../static/games/Jordan_Section3_Level2_WebGL/index.html',
          hotword: 'Reflect'
        },
        'Section-2': {
          phases: ["DEFAULT", "Practice", "Replay", "Reflect", "Feedback"],
          avatar: 'Jordan',
          vignette: 'Section2',
          level: 'Level3',
          src: '../../static/games/Jordan_Section2_Level3_WebGL/index.html',
          hotword: 'Reflect'
        },
        'Section-1': {
          phases: ["DEFAULT", "Practice", "Replay", "Reflect", "Feedback"],
          avatar: 'Jordan',
          vignette: 'Section1',
          level: 'Level1',
          src: '../../static/games/Jordan_Section1_Level1_WebGL/index.html',
          hotword: 'Reflect'
        },
        'Section-10': {
          phases: ["DEFAULT", "Practice", "Replay", "Reflect", "Feedback"],
          avatar: 'Michael',
          vignette: 'Section10',
          level: 'Level3',
          src: '../../static/games/Michael_Section10_Level1_WebGL/index.html',
          hotword: 'Reflect'
        },
      },
      currentGame: null,
      selectedSession: null,
      selectedStudent: null,
      selectedDecision: null,
      reflectionQuestions: null,
      placeholderTitle: null,
      // statObj: null,
      finalizeStoryline: false,
      storylineComplete: false,
      moveToPracticeHistory: false,
      sessionLoopTimer: null,
      lastPhaseTimestamp: null
    }
  },
  methods: {
    showModal (evt) {
      evt.preventDefault()
      this.$refs.reflectionValidatedMod.show()
    },
    hideModal(){
      this.$refs.reflectionValidatedMod.hide()
    },
    checkRouteForStoryline() {
      if(this.selectedSession) return

      let sessionId = this.$route.params.sessionId
      let key = findKey(this.sessions, { _id: sessionId })

      if(key && !this.sessions[key].complete) {
        this.selectSession(this.sessions[key])
        this.unityLoadGame(this.sessions[key].vignette.section)
        // this.unityLoadGame('test2')
      } else if(key && this.sessions[key].complete)
        this.placeholderTitle = "This storyline is already completed."
      else
        this.placeholderTitle = "Storyline not found."
    },
    addStudentPicture() {
      if(this.selectedSession) {
        let studentKey = findKey(this.students, { _id: this.selectedSession.vignette.avatar.id })
        if(studentKey) this.selectedStudent = this.students[studentKey]
      }
    },
    selectDecision(decision) {
      //If the decison node to reflect on is not found, we can not reflect on it. And thus the shrinking of the unity window won't happen
      //Solution:
      //If decision node not found: Increment currentPhase and call unityUpdatePhase to launch the next phase in unity
      //Create Modal: "Oops something went wrong, "
      if(!decision) { this.reflectionQuetions = null; return }

      let query = new Parse.Query(Theme)

      query.find({
        success: (themes) => {
          let randomInt = this.getRandomInt(0, themes.length - 1)
          let selectedTheme = themes[randomInt]

          let query2 = new Parse.Query(Question)
          query2.equalTo('theme', selectedTheme)

          query2.find({
            success: (questions) => {
              let theQuestions = {}

              questions.forEach((question, i) => {
                theQuestions[i] = {
                  text: question.get('text'),
                  _id: question.id,
                  _createdAt: question.createdAt,
                  _question: question
                }
              })

              this.reflectionQuestions = theQuestions
              //Selected decision become not null and therefore trigger the shrinking of the unity window so user can enter their reflections
              this.selectedDecision = {
                _id: decision.id,
                _decision: decision
              }

            }, error: (e) => console.log
          })
        }, error: (e) => console.log
      })
    },
    selectSession(session) {
      if(!session) return

      this.selectedSession = session
      this.finalizeStoryline = false
      this.moveToPracticeHistory = false
      this.storylineComplete = false
      this.allLogs = []
      this.phaseTimes = {}

      this.sessionLoop()
    },
    sessionLoop() {


      let user = this.user
      let session = this.selectedSession ? this.selectedSession._session : null
      let phase = this.phases[this.currentPhase]

      console.log('session loop ' + phase)

      if (!user || !session || !phase || this.currentPhase <= 0) {
        this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
        return
      }

      this.phaseTimes[phase] = (this.phaseTimes[phase] >= 0) ? this.phaseTimes[phase] + 5 : 0

      // let times = session.get('times') || {}
      // times[phase] = (times[phase] >= 0) ? times[phase] + 5 : 0

      // assign(times, this.phaseTimes)

      session.set('times', this.phaseTimes)
      session.set('logs', this.allLogs)

      console.log(this.phaseTimes)

      session.save().then((newSession) => {
        this.selectedSession._session = newSession

        if (this.finalizeStoryline && !this.storylineComplete) {
          return Parse.Cloud.run('finalizeStoryline', { storylineId: session.id }).then((newSession) => {
            this.storylineComplete = true
            this.selectedSession._session = newSession
            this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
          }).catch(console.log)
        } else if (this.moveToPracticeHistory) {
          this.$router.push({
            // name: "PracticeHistorySession",
            name: "PracticeHistory",
            params: { studentName: this.selectedStudent.name, sessionId: this.selectedSession._id }
          })
        } else this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)

      }).catch(() => this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000))

      // if(user && instance && !this.statObj) {
      //   // user object exists, instance object exist, havent created session
      //   let statistic = new Statistic()

      //   statistic.set('storyline', this.selectedSession._session)
      //   statistic.set('instance', instance)
      //   statistic.set('start', new Date())

      //   statistic.save(null, {
      //     success: (statistic) => {
      //       console.log('created new statistic')
      //       this.statObj = statistic
      //       this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
      //     },
      //     error: (instance, error) => {
      //       console.log(error)
      //       this.statObj = null
      //       this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
      //     }
      //   })
      // } else if(user && instance && this.statObj) {
      //   // user object exists, session start timestamp already created
      //   let statistic = this.statObj

      //   statistic.set('end', new Date())

      //   statistic.save(null, {
      //     success: (statistic) => {
      //       console.log('updated statistic')
      //       this.statObj = statistic
      //       this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
      //     },
      //     error: (instance, error) => {
      //       console.log(error)
      //       this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
      //     }
      //   })
      // } else {
      //   this.sessionLoopTimer = setTimeout(this.sessionLoop, 5000)
      //   this.statObj = null
      // }
    },
    submitReflection () {
      this.hideModal()

      if(!this.selectedSession || !this.reflectionQuestions || !this.selectedDecision) return

      let query = new Parse.Query(Answer)

      query.equalTo('storyline', this.selectedSession._session)

      query.find({
        success: (answers) => {
          forEach(answers, (answer) => answer.destroy(null))

          let promises = []

          forEach(this.reflectionQuestions, (question) => {
            let answer = new Answer()

            answer.set('question', question._question)
            answer.set('text', question.answer)
            answer.set('decision', this.selectedDecision._decision)
            answer.set('storyline', this.selectedSession._session)

            promises.push(answer.save(null))
          })

          return Promise.all(promises)
            .then(success => {
              this.selectedDecision = null
              this.reflectionQuestions = null

              let newPhaseTimestamp = Date.now()
              let indx = this.currentPhase

              if(this.lastPhaseTimestamp)
                this.phaseTimes[this.phases[this.currentPhase]] = (newPhaseTimestamp - this.lastPhaseTimestamp) / 1000

              if(++indx < this.phases.length) {
                this.currentPhase = indx
                this.unityUpdatePhase()
              } else this.moveToPracticeHistory = true

              this.lastPhaseTimestamp = newPhaseTimestamp

            })
        }, error: (e) => console.log
      })
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    unityLoadGame(gameId) {
      console.log('in unity load game')
      let game = this.games[gameId]
      this.phases = game.phases
      this.currentGame = game

      let iframe = document.createElement('iframe')

      iframe.src = game.src
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = '0px'
      iframe.style.margin = '0px'
      iframe.style.padding = '0px'

      let unityFrame = this.$refs.unityFrame

      while(unityFrame.firstChild) {
        unityFrame.removeChild(unityFrame.firstChild);
      }

      unityFrame.appendChild(iframe)
    },
    unityUpdatePhase() {
      let phase = this.phases[this.currentPhase]
      console.log(`[vue] changing phase to: ${phase}`)
      let message = { name: 'startPhase', phase, format: 'unityBidirectional' }
      this.$refs.unityFrame.firstChild.contentWindow.postMessage(JSON.stringify(message), '*')
    },
    async unityOnNewMessage(evt) {
      let data = null
      let session = null
      let node = null
      let tokens = null

      try { data = JSON.parse(evt.data) }
      catch (error) { return error }

      console.log('on unity NEW MESSAGE!!!\n\n')
      console.log(data)

      if(!data || !data.name || !data.format || data.format != 'unityBidirectional') return

      switch(data.name) {
        case 'phaseDone':
        console.log("actual  " + this.phases[this.currentPhase]);
        console.log("sent by unity " + data.phase);
          let indx = this.phases.findIndex(phase => phase === data.phase)
          if(indx < 0) return

          console.log('RECEIVED PHASEDONE ' + data.phase)

          let newPhaseTimestamp = Date.now()

          if(data.phase != this.currentGame.hotword) {
            if(this.lastPhaseTimestamp)
              this.phaseTimes[this.phases[this.currentPhase]] = (newPhaseTimestamp - this.lastPhaseTimestamp) / 1000

            if(++indx < this.phases.length) {
              this.currentPhase = indx
              this.unityUpdatePhase()
            } else this.moveToPracticeHistory = true
          }

          this.lastPhaseTimestamp = newPhaseTimestamp

          break

        case 'sendNodeDone':
          session = this.selectedSession; if(!session) return
          node = data.nodeDoneJSON; if(!node) return

          console.log(`[vue] [sendNodeDone] received from unity`)
          tokens = node.action.split("_")

          this.allLogs.push(node)

          if(tokens.length >= 2 && tokens[1] === "end") {
            console.log('\n\n\n\nALLDONE\n\n\n\n')
            this.finalizeStoryline = true
            clearTimeout(this.sessionLoopTimer)
            this.sessionLoop()
          } else if(tokens.length >= 2 && tokens[0] === "Decision") {
            // this is a decision node
            this.decisionToSave = tokens[1]
            //this.descriptionToSave = node.description
          } else if(tokens[0] === "DECISION") {
            this.durationToSave = parseInt(node.endDate) - parseInt(node.startDate)
            this.descriptionToSave = node.description
          } else if(tokens.length == 2 && tokens[0] === "choice" && this.decisionToSave) {
            let choiceQuery = new Parse.Query(Node)
            let decisionQuery = new Parse.Query(Node)

            let decisionName = this.decisionToSave
            let durationAmt = this.durationToSave
            let description = this.descriptionToSave

            choiceQuery.equalTo('type', 'choice')
            choiceQuery.equalTo('name', node.action)
            choiceQuery.equalTo('vignette', session._vignette)

            decisionQuery.equalTo('name', 'Decision_' + decisionName)
            decisionQuery.equalTo('vignette', session._vignette)

            const choiceNode = await choiceQuery.first()
            const decisionNode = await decisionQuery.first()

            await new Decision().set({
              node: decisionNode,
              choice: choiceNode,
              name: decisionName,
              storyline: session._session,
              description,
              duration: durationAmt
            }).save(null)
          }
          break
        case 'sendSelectedDecisionNode':
          session = this.selectedSession; if(!session) return
          node = data.selectedDecisionNode; if(!node) return

          tokens = node.split("_")

          if(tokens[0] === "Decision" && tokens.length == 2) {
            let nodeName = tokens[1]
            console.log(`selecting decision: ${nodeName}`)

            const decision = await new Parse.Query(Decision).equalTo('storyline', session._session).equalTo('name', nodeName).first()
            this.selectDecision(decision)
          }
          break

        default: break
      }
    }
  },
  watch: {
    selectedSession(val) {
      this.addStudentPicture()
    },
    students(val) {
      this.addStudentPicture()
    }
  },
  computed: {
    ...mapGetters(['sessions', 'students', 'instance', 'user'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      window.addEventListener('message', vm.unityOnNewMessage)

      vm.$store.dispatch('getSessions')
        .then(success => vm.checkRouteForStoryline())
        .catch(err => { console.log(err); return err })
    })
  },
  beforeRouteLeave(to, from, next) {
    console.log("\nLEAVING\n")
    clearTimeout(this.sessionLoopTimer)
    this.selectedSession = null
    this.sessionLoopTimer = null
    window.removeEventListener('message', this.unityOnNewMessage)
    next()
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .card-active, .card-default {
    margin: 15px 0;
  }
  .card-active {
    opacity: 1;
  }
  .card-default {
    opacity: 0.8;
    cursor: pointer;
  }
  .card-default:hover {
    opacity: 1;
    -webkit-transition: opacity 0.5s; /* Safari */
    transition: opacity 0.5s;
  }
  form {
    margin-bottom: 15px;
  }
  .unityFrameCover {
    position: relative;
    width: 100%;
  }
  .unityFrameForm {
    margin-top: 425px;
  }
  #unityFrame {
    /*transition: all 0.5s ease;
    -webkit-transition: all 0.5s ease;*/
    margin: 0;
    padding: 0;
    overflow: hidden;
    z-index: 10;
  }
  .full {
    position: fixed;
    top: 50px;
    left: 0;
    height: calc(100% - 50px);
    width: 100%;
    border: 0;
  }
  .small {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 400px;
    /*box-shadow: 0px 0px 5px 2px;
    border: 3px solid white;*/
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
</style>
