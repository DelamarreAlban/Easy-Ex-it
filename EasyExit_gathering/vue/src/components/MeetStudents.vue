<template>
  <div class="meetStudents">
    <b-container>
      <div class="customHeader">Meet your Students</div>
      <!-- <div style="float:right"><span>Toggle </span><input type="checkbox" v-model="useOld" /></div> -->
      <!-- <div class="clearfix"></div> -->
      <div v-if="useOld" class="accordion">
        <vue-accordion :items="aItems" :styles="aStyles"></vue-accordion>
      </div>
      <div v-else>
        <b-row>
          <b-col>
            <b-card no-body style="margin-bottom:20px;">
              <b-tabs pills vertical card v-model="studentIndex">
                <b-tab v-for="student in students" :key="student._id" @click="changeStudent(student.name)" :title="student.name">
                  <b-img class="avatar" :src="student.image2" fluid center alt="Responsive image" />
                </b-tab>
              </b-tabs>
            </b-card>
          </b-col>
          <b-col>
            <div role="tablist" v-if="selectedStudent">
              <div class="customBlock" v-for="desc in descriptions" :key="desc._id" v-if="desc.avatar === selectedStudent._id" >
                <h3>{{desc.header}}</h3>
                <p>{{desc.text}}</p>
              </div>

              <!-- <b-card v-for="(desc, ind) in descriptions" :key="desc._id" v-if="desc.avatar === selectedStudent._id" no-body class="mb-1">
                <b-card-header header-tag="header" class="p-1" role="tab">
                  <b-btn block @click="desc.collapse = !desc.collapse" variant="info">{{desc.header}}</b-btn>
                </b-card-header>
                <b-collapse :id="desc._id" v-model="desc.collapse" :accordion="selectedStudent._id" role="tabpanel">
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
      </div>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { findKey, forEach, filter } from 'lodash'
import { vueAccordion } from './VueAccordion'

export default {
  name: 'MeetStudents',
  data: () => {
    return {
      useOld: false,
      selectedStudent: null,
      studentIndex: 0,
      aItems: [],
      aStyles: {
        div: {
          height: '100%',
          'max-width': '100%',
        }
      },
    }
  },
  methods: {
    changeStudent(name) {
      this.$router.push({
        name: "MeetStudents",
        params: { studentName: name }
      })
    },
    checkRouteForStudent() {
      let studentName = this.$route.params.studentName
      let key = findKey(this.students, { name: studentName })

      if (key) {
        this.selectedStudent = this.students[key]
        this.studentIndex = parseInt(key)
      } else {
        this.selectedStudent = this.students[0]
        this.studentIndex = parseInt(key)
      }
    },
    updateAccordion() {
      let aItems = []

      forEach(this.students, (student, studentId) => {
        let descriptions = filter(this.descriptions, { avatar: student._id })
        let sections = []

        forEach(descriptions, (desc, descId) => {
          sections.push({ title: desc.header, text: desc.text })
        })

        aItems.push({
          title: student.name,
          sections: sections,
          image: student.image2
        })
      })

      this.aItems = aItems
    }
  },
  watch: {
    '$route' (to, from) {
      if(to.name === "MeetStudents") {
        // same route, update active student
        this.checkRouteForStudent()
      }
    },
    students(val) {
      this.checkRouteForStudent()
      this.updateAccordion()
    },
    descriptions(val) {
      this.updateAccordion()
    }
  },
  computed: {
    ...mapGetters(['students', 'descriptions'])
  },
  created() {
    this.checkRouteForStudent()
    this.updateAccordion()
  },
  components: { vueAccordion }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bbg-1 {
  margin: 0 auto;
  margin-bottom: 50px;
}
.accordion {
  position: absolute;
  height: calc(100% - 150px);
  width: 100%;
  left: 0;
  top: 150px;
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
