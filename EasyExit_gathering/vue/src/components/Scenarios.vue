<template>
  <div class="hello">
    <b-container>
      <h1 class="oldH1">Easy-EX-it</h1>
      <h2 class="oldH1">Select a scenarios</h2>

      <b-row>
        <b-row cols="6" v-for="chunk in scenarioChunks" :key="`${chunk}`" style="margin-bottom: 20px">
              <b-container  v-for="scenario in chunk" :key="`${scenario}`">
                <b-img :src="getImgUrl(scenario)" class="imgClick" @click='startSimulation(scenario)' height="150" width="300"></b-img>
                <p> {{scenario.name}} </p>
              </b-container>
        </b-row>
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
  name: 'Scenarios',
  data: () => {
    return {
      selected: ""
    }
  },
  methods: {
    click(){
      console.log("click")
    },
    startSimulation(scenario) {
      //set name somewhere
      //Create simulation
      let Simulation = Parse.Object.extend('Simulation')
      let simulation = new Simulation().set('user',this.user._user)
        .set('scenario',scenario._scenario)
        .set('complete',false)

        simulation.save(null, {
        success: (sim) => {
          let route = { name: 'UnityApp', params: { 'simulationId': sim.id } }
          this.$router.push(route)
        },
        error: (simulation, error) => console.log(error)
      })
    },
    getImgUrl(scenario) {
      return scenario.image
  },
  initialize(){

  }
  },
  watch: {

  },
  computed: {
    ...mapGetters(['user','scenarios']),
    isSelected() {
      if(this.selected === "") return false
      return true
    },
    scenarioChunks(){
          return _.chunk(_.toArray(this.scenarios), 2);
      }
  },
  beforeRouteEnter(to, from, next) {
    console.log("\nENTERING -> " + "SCENARIOS")
    next(vm => {
      Promise.all([
        vm.$store.dispatch('getScenarios')
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
h4 {
  color: inherit;
}
ul {
  padding-left: 30px;
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
  margin-right: 5px;
  margin-bottom: 20px;
}
.controls2 {
  float: right;
  margin-top: 20px;
  margin-right: 5px;
}
.controls3 {
  float: left;
  margin-top: 20px;
}
.customSelector {
  margin-bottom: 0px;
}
.cardImg {
  border-radius: 5px;
}
.imgClick {
  opacity: 0.8;
  cursor: pointer;
  /*-webkit-transition: opacity 0.25s; /* Safari */
  /*transition: opacity 0.25s;*/
}
.imgClick:hover {
  opacity: 1;
}
.imgDisable {
  opacity: 0.8;
  cursor: not-allowed;
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
}
/*
.card-1, .card-2, .card-3 {
  margin: 0 auto;
  transition: opacity 0.5s;
}
.card-2, .card-3 {
  cursor: pointer;
}
.card-2 {
  opacity: 0.75;
}
.card-2:hover {
  opacity: 1;
}
.card-2 .card-body,
.card-3 .card-body {
  position: absolute;
  bottom: 0;
  left: 0;
  color: white;
  text-shadow: 0px 1px black;
}
.card-2 h4, .card-3 h4 {
  margin-bottom: 0;
}
*/
</style>
