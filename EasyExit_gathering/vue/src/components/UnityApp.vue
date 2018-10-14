<template>
  <div class="hello">
    <b-container>
      <h1 class="oldH1">Easy-EX-it</h1>
      <h2 class="oldH1">UNITY APP</h2>

      <div class="unityFrameCover">
        <div id="unityFrame" ref="unityFrame" class="full"></div>
      </div>

    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { findKey,forEach } from 'lodash'
import Parse from 'parse'
import store from '../store'

export default {
  name: 'UnityApp',
  data: () => {
    return {
      currentSimulation: {},
      games: {
        'test': {
          src: '../../static/games/WebGL_TEST/index.html'
        }
      }
    }
  },
  methods: {
    unityLoadGame(gameId) {
      console.log('in unity load game')
      let game = this.games[gameId]
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
    initialize() {
      //get current simulation
      let simulationId = this.$route.params.simulationId
      let key = findKey(this.simulations, { _id: simulationId })
      if(key){
        this.currentSimulation = this.simulations[key]

        //Load unity game
        this.unityLoadGame('test')
      }

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
        case 'sendChoice':
          console.log(`[vue] [sendChoice] received from unity`)
          let frame = {}
          frame.simulation = this.currentSimulation
          frame.output_strategy = data.content.output_strategy

          this.$store.dispatch('submitChoiceFrame', frame)
          break

        default: break
      }
    }
  },
  watch: {

  },
  computed: {
    ...mapGetters(['user','simulations']),
  },
  beforeRouteEnter(to, from, next) {
    console.log("\nENTERING -> " + "UNITYAPP")
    next(vm => {
      window.addEventListener('message', vm.unityOnNewMessage)
      Promise.all([
        vm.$store.dispatch('getSimulations')
      ])
      .then(success => {
        vm.initialize()
      })
    })
  },
  beforeRouteLeave(to, from, next) {
    console.log("\nLEAVING\n")

    window.removeEventListener('message', this.unityOnNewMessage)
    next()
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
  -webkit-transition: opacity 0.5s; /* Safari */
  transition: opacity 0.5s;
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
.full {
  position: fixed;
  top: 0px;
  left: 0;
  height: calc(100% - 50px);
  width: 100%;
  border: 0;
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
