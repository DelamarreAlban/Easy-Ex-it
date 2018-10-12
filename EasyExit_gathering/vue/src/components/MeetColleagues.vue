<template>
  <div class="meetColleagues">
    <b-container>
      <div class="customHeader">Meet your Colleagues</div>
      <b-row>
        <b-col>
          <b-card no-body style="margin-bottom:20px;">
            <b-tabs pills vertical card v-model="colleagueIndex">
              <b-tab v-for="colleague in colleagues" :key="colleague._id" @click="changeColleague(colleague.name)" :title="colleague.name">
                <!--<b-img class="avatar" :src="colleague.image2" fluid center alt="Responsive image" /> -->
                <b-img class="avatar" :src="colleague.image2" fluid center alt="Responsive image" />
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
        <b-col>
          <div role="tablist" v-if="selectedColleague">
            <div class="customBlock" v-for="(desc, ind) in descriptions" :key="desc._id" v-if="desc.avatar === selectedColleague._id" >
              <h3>{{desc.header}}</h3>
              <p>{{desc.text}}</p>
            </div>
            <!-- <b-card v-for="(desc, ind) in descriptions" :key="desc._id" v-if="desc.avatar === selectedColleague._id" no-body class="mb-1">
              <b-card-header header-tag="header" class="p-1" role="tab">
                <b-btn block @click="desc.collapse = !desc.collapse" variant="info">{{desc.header}}</b-btn>
              </b-card-header>
              <b-collapse :id="desc._id" v-model="desc.collapse" :accordion="selectedColleague._id" role="tabpanel">
                <b-card-body>
                  <p class="card-text">
                    {{ desc.text }}
                  </p>
                </b-card-body>
              </b-collapse>
            </b-card> -->
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { findKey } from 'lodash'

export default {
  name: 'MeetColleagues',
  data: () => {
    return {
      selectedColleague: null,
      colleagueIndex: 0
    }
  },
  computed: {
    ...mapGetters(['colleagues', 'descriptions'])
  },
  methods: {
    changeColleague(name) {
      this.$router.push({
        name: "MeetColleagues",
        params: { colleagueName: name }
      })
    },
    checkRouteForColleague() {
      let colleagueName = this.$route.params.colleagueName
      let key = findKey(this.colleagues, { name: colleagueName })

      if (key) {
        this.selectedColleague = this.colleagues[key]
        this.colleagueIndex = parseInt(key)
      } else {
              this.selectedColleague = this.colleagues[0]
              this.colleagueIndex = parseInt(key)
          }
    }
  },
  watch: {
    '$route' (to, from) {
      if(to.name === "MeetColleagues") {
        // same route, update active colleague
        this.checkRouteForColleague()
      }
    },
    colleagues() {
      this.checkRouteForColleague()
    }
  },
  created() {
    this.checkRouteForColleague()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bbg-1 {
  margin: 0 auto;
  margin-bottom: 50px;
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
.customBlock {
  margin-bottom: 30px;
}
</style>
