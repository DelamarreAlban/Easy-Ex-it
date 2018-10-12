<template>
  <div class="confidence">
    <b-container>
      <!-- <h1>Confidence Ratings</h1> -->
      <b-row>
        <b-col>
          <line-example :chartData="chartData" :options="options"></line-example>
          <b-table fixed bordered head-variant="light" :items="table" style="margin-top:60px;text-align:center"></b-table>
        </b-col>
      </b-row>
      <b-btn class="controls" variant="outline-primary" @click="print()">Print</b-btn>
    </b-container>
  </div>
</template>

<script>
import Parse from 'parse'
import moment from 'moment'
import { mapGetters } from 'vuex'
import LineExample from './LineChart.js'

export default {
  name: 'ConfidenceRatings',
  data: () => {
    return {
      labels: [],
      datasets: [],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          fontSize: 18,
          text: 'Confidence Managing Behavior Problems'
        },
        legend: {
          position: "right"
        },
        scales: {
          xAxes: [{
            offset: true
          }],
          yAxes: [{
            gridLines: {
              display: true
            },
            ticks: {
              min: 1,
              max: 7,
              stepSize: 1
            }
          }]
        }
      },
      table: [
        {
          very_unconfident: 1,
          somewhat_unconfident: 2,
          unconfident: 3,
          neutral: 4,
          somewhat_confident: 5,
          confident: 6,
          very_confident: 7
        }
      ]
    }
  },
  methods: {
    questionToScore(val) {
      switch(val) {
        case "Very Unconfident": return 1
        case "Unconfident": return 2
        case "Somewhat Unconfident": return 3
        case "Neutral": return 4
        case "Somewhat Confident": return 5
        case "Confident": return 6
        case "Very Confident": return 7
        default: return 0
      }
    },
    print() {
      window.print()
    }
  },
  computed: {
    ...mapGetters(['user']),
    chartData: function() {
      return {
        labels: this.labels,
        datasets: this.datasets
      }
    }
  },
  created() {
    let self = this

    let Feedback = Parse.Object.extend("Feedback")
    let feedback = new Parse.Query(Feedback)

    feedback.equalTo("user", this.user._user)
    feedback.ascending("updatedAt");

    feedback.find({
      success: function(results) {
        self.datasets = [
          {
            label: 'Current',
            borderColor: '#05CBE1',
            backgroundColor: '#05CBE1',
            fill: false,
            data: []
          },
          {
            label: 'Future',
            borderColor: '#FC2525',
            backgroundColor: '#FC2525',
            fill: false,
            data: []
          }
        ];
        self.labels = []
        results.forEach((result, i) => {
          self.labels.push(moment(result.updatedAt).format('MM/DD/YY') + ", Session " + i)
          self.datasets[0].data.push(self.questionToScore(result.get('q1')))
          self.datasets[1].data.push(self.questionToScore(result.get('q2')))
        })
      },
      error: function(feedback, error) {
        this.$store.commit('setAlert', { message: error.message, variant: 'danger' })
      }
    });
  },
  components: { LineExample }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.controls {
  float: right;
  margin-bottom: 30px;
}
</style>
