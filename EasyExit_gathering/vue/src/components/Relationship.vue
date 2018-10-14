<template>
  <div class="hello">
    <b-container>
      <h1 class="oldH1">Easy-EX-it</h1>
      <h2 class="oldH1">Relationship</h2>

      <b-row>
        <b-col>
          <p>{{this.hotQuestion}}</p>
        </b-col>
        <b-col v-for="s in scale" :key="`${s}`">
          <input type="radio" v-model="hotAnswer.answer" v-bind:value="s.val"> {{s.txt}}
        </b-col>
      </b-row>

      <b-container v-bind:class="{'hide' : !isInRelationship }">
          <b-col v-for="answer in answers" :key="`${answer.question.question}`" style="margin-bottom: 20px">
            <b-row>
              <b-col>
                <p> {{answer.question.question}} </p>
              </b-col>
              <b-col v-for="s in scale" :key="`${s}`">
                <input type="radio" v-model="answer.answer" v-bind:value="s.val"> {{s.txt}}
              </b-col>
            </b-row>
          </b-col>
        </b-container>

      <b-row>
       <b-button block variant="primary" v-bind:disabled="isComplete" @click="submit()"> Next! </b-button>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { forEach } from 'lodash'
import Parse from 'parse'
import store from '../store'

export default {
  name: 'Relationship',
  data: () => {
    return {
      domain : "Relationship",
      hotQuestion: "",
      hotAnswer: {},
      answers: [],
      scale : [{txt:'Yes',val:1},
      {txt:'No',val:0}]
    }
  },
  methods: {
    check(){
      console.log(this.answers)
    },
    submit(){
      //console.log(this.answers)
      this.$store.dispatch('submitAnswers', this.answers)
      let route = { name: 'ECAGender'}
      this.$router.push(route)
    },
    initialize() {
      let newAnswers = []
      for (var i in this.questions) {
        if(this.questions[i].domain == "Relationship"){
          if(this.questions[i].order == 0){
            this.hotQuestion = this.questions[i].question
            this.hotAnswer = {
              question: this.questions[i],
              answer: "",
            }
          }
          else{
            let newAnswer = {
              question: this.questions[i],
              answer: "",
            }
            newAnswers.push(newAnswer)
          }
        }
      }
      this.answers = newAnswers

    }
  },
  watch: {
  },
  computed: {
    ...mapGetters(['user','questions']),
      isInRelationship () {
        if(this.hotAnswer.answer == "1")
          return true
        return false
      },
      isComplete(){
        if(this.hotAnswer.answer == "0"){
          return false
        }
        else{
            let r = false
            this.answers.forEach((answer) => {
              if(answer.answer === ""){
                r = true
              }
            })
            return r
          }
      }
  },
    beforeRouteEnter(to, from, next) {
      console.log("\nENTERING-> " + "RELATIONSHIP")
      next(vm => {
        Promise.all([
          vm.$store.dispatch('getQuestions')
        ])
        .then(success => {
          vm.initialize()
        })
      })
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hide{
  display: none;
}
</style>
