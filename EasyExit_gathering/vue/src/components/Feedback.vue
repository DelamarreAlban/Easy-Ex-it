<template>
  <div class="feedback">
    <b-container>
      <b-alert show>Looks like the school day is ending. Before the final bell rings, please tell us ...</b-alert>
      <b-row>
        <b-col>
          <b-form @submit="sendFeedback">
            <div v-for="question in questions">
              <div v-if="question.type == 'radio'">
                <b-form-group :label="question.name" label-for="input-1">
                  <b-form-radio-group required stacked v-model="form[question.id]" :options="question.options" :name="question.id">
                  </b-form-radio-group>
                </b-form-group>
              </div>
              <div v-else-if="question.type == 'text'">
                <b-form-group :label="question.name" label-for="input-1">
                  <b-form-textarea id="input-1" required
                                   v-model="form[question.id]"
                                   placeholder=""
                                   :rows="3"
                                   :max-rows="6">
                   </b-form-textarea>
                </b-form-group>
              </div>
            </div>
            <b-button type="submit" variant="primary">Submit Response</b-button>
            <b-button type="button" variant="outline-secondary" @click="print()">Print</b-button>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'Feedback',
  data: () => {
    return {
      form: {},
      questions: [
        {
          id: 'q1',
          name: '1. How confident are you in managing current behavior problems in your classroom?',
          type: 'radio',
          options: [
            { text: '1 Very Unconfident', value: 'Very Unconfident' },
            { text: '2 Unconfident', value: 'Unconfident' },
            { text: '3 Somewhat Unconfident', value: 'Somewhat Unconfident' },
            { text: '4 Neutral', value: 'Neutral' },
            { text: '5 Somewhat Confident', value: 'Somewhat Confident' },
            { text: '6 Confident', value: 'Confident' },
            { text: '7 Very Confident', value: 'Very Confident' }
          ]
        },
        {
          id: 'q2',
          name: '2. How confident are you in your ability to manage future behavior problems in your classroom?',
          type: 'radio',
          options: [
            { text: '1 Very Unconfident', value: 'Very Unconfident' },
            { text: '2 Unconfident', value: 'Unconfident' },
            { text: '3 Somewhat Unconfident', value: 'Somewhat Unconfident' },
            { text: '4 Neutral', value: 'Neutral' },
            { text: '5 Somewhat Confident', value: 'Somewhat Confident' },
            { text: '6 Confident', value: 'Confident' },
            { text: '7 Very Confident', value: 'Very Confident' }
          ]
        },
        {
          id: 'q3',
          name: '3. What is the one thing you learned from playing IVT today and how will you apply that new learning in your classroom? (Teacher Strategies Questionnaire; Webster-Stratton, 2005) ',
          type: 'text'
        }
      ],
    }
  },
  methods: {
    sendFeedback(evt) {
      evt.preventDefault()
      Promise.all([
        this.$store.dispatch('newFeedback', this.form),
        this.$store.dispatch('logout')
      ]).then(() => this.$router.push({ name: 'Home' }))
    },
    print() {
      window.print()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .feedback {
    margin-bottom: 20px;
  }
</style>
