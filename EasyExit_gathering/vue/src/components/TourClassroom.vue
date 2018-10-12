<template>
  <div class="tour">
    <b-container>
      <div v-if="!selectedClassroom">
        <div class="customHeader">Select Classroom</div>
        <div class="customSelector">
          <b-row>
            <b-col v-for="classroom in classrooms" :key="classroom._id">
              <b-card @click="selectedClassroom = classroom"
                      :header="classroom.name"
                      class="text-center">
                  <b-img :src="classroom.image" fluid :alt="classroom.name" class="cardImg imgClick" />
              </b-card>
            </b-col>
          </b-row>
        </div>
      </div>
      <div v-else>
        <div class="customHeader">Under Construction</div>
        <b-button @click="selectedClassroom = null" variant="secondary" class="controls">Go Back</b-button>
      </div>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TourClassroom',
  data: () => {
    return {
      selectedClassroom: null
    }
  },
  watch: {
    '$route' (to, from) {
      console.log(to)
      if(to.name === "TourClassroom") {
        this.selectedClassroom = null
      }
    },
  },
  computed: {
    ...mapGetters(['classrooms', 'students']),
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
</style>
