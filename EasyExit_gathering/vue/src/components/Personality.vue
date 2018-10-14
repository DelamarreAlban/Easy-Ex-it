<template>
  <div class="hello">
    <b-container>
      <h1 class="oldH1">Easy-EX-it</h1>
      <h2 class="oldH1">Personality</h2>
      <b-row>
        <b-col>
          <p> I see myself as someone who … </p>
        </b-col>
        <b-col v-for="s in scale" :key="`${s}`">
          {{s.txt}}
        </b-col>
      </b-row>

        <b-col v-for="answer in answers" :key="`${answer.question.question}`" style="margin-bottom: 20px">
          <b-row>
            <b-col>
              <p> {{answer.question.question}} </p>
            </b-col>
            <b-col v-for="s in scale" :key="`${s}`">
              <input type="radio" v-model="answer.answer" v-bind:value="s.val">
            </b-col>
          </b-row>
        </b-col>

      <b-row>
       <b-button block variant="primary" v-bind:disabled="isComplete" @click="setUserPersonality()"> Next! </b-button>
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
  name: 'Personality',
  data: () => {
    return {
      domain : "Personality",
      answers: [],
      scale : [{txt:'Disagree strongly',val:1},
      {txt:'Disagree a little',val:2},
      {txt:'Neither agree nor disagree',val:3},
      {txt:'Agree a little',val:4},
      {txt:'Agree strongly',val:5}]
    }
  },
  methods: {
    setUserPersonality(){
      //console.log(this.answers)
      this.$store.dispatch('submitAnswers', this.answers)
      let route = { name: 'Relationship'}
      this.$router.push(route)
    },
    initialize() {
      let newAnswers = []
      for (var i in this.questions) {
        if(this.questions[i].domain == "Personality"){
          let newAnswer = {
            //questionId: this.questions[i]._id,
            question: this.questions[i],
            answer: "",
          }
          newAnswers.push(newAnswer)
        }
      }
      this.answers = newAnswers

    }
  },
  watch: {
  },
  computed: {
    ...mapGetters(['user','questions']),
      isComplete () {
        let r = false
        this.answers.forEach((answer) => {
          if(answer.answer == ""){
            r = true
          }
        })
        return r
      }
  },
    beforeRouteEnter(to, from, next) {
      console.log("\nENTERING-> " + "Personality")
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

</style>
