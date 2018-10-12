<template>
  <div class="finalReflections">
    <b-container>
      <div class="customHeader">Final Reflections</div>
      <b-row>
        <b-col>
          <b-table striped bordered hover
                   :items="feedbackTable.items"
                   :fields="feedbackTable.fields">
          </b-table>
        </b-col>
      </b-row>
      <b-btn class="controls" variant="outline-primary" @click="print()">Print</b-btn>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { forEach } from 'lodash'
import moment from 'moment'

export default {
  name: 'FinalReflections',
  data: () => {
    return {
      feedbackTable: {
        fields: [
          {
            key: 'session',
            label: ' ',
            sortable: false
          },
          {
            key: 'answer',
            label: 'What is the one thing you learned from playing IVT today and how will you apply that new learning in your classroom?',
            sortable: false
          }
        ],
        items: []
      }
    }
  },
  methods: {
    populateFeedbackTable() {
      let items = []
      forEach(this.feedbacks, (feedback, key) => {
        items.push({
          session: moment(feedback._createdAt).format('MM/DD/YY') + ', Session ' + key,
          answer: feedback.q3
        })
      })
      this.feedbackTable.items = items
    },
    print() {
      window.print()
    }
  },
  computed: {
    ...mapGetters(['feedbacks'])
  },
  filters: {
    date(timestamp) {
      return moment(timestamp).format('MM/DD/YY')
    }
  },
  beforeRouteEnter(to, from, next) {
    console.log("\nENTERING\n")
    next(vm => vm.$store.dispatch('getFeedbacks').then(success => vm.populateFeedbackTable()))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
  margin-bottom: 30px;
}
.item:last-child {
  margin-bottom: 0;
}
.title {
  margin-bottom: 30px;
}
h1 {
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
