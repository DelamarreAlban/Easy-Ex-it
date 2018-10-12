<template>
  <div class="gameRules">
    <b-container>
      <div class="customHeader">Learn the rules of the game</div>
      <b-button href="/static/IVT_RulesOfTheGame.pdf" target="_blank" variant="outline-success" style="float:right;">Download</b-button>
      <div class="clearfix"></div>

      <b-pagination style="margin-bottom:40px" align="center" @input="changeRule" size="md" :total-rows="totalRules" v-model="currentRule" :per-page="1" :limit="7">
      </b-pagination>

      <div class="customRules">
        <div v-if="currentRule === 1">
          <h4 class="title">Online Course and IVT</h4>
          <b-table fixed bordered head-variant="light" :items="onlineIVTTable" style="margin-bottom:30px;"></b-table>
          <p class="title">You will earn continuing professional development credits for completing the online course and IVT at no cost to you.</p>
        </div>
        <div v-else-if="currentRule === 2">
          <h4 class="title">First Person Perspective</h4>
          <b-card>
            IVT is designed to be played from a first-person perspective. That means we want you to
            immerse yourself in these classrooms and experience the storylines as if you were the teacher
            interacting with these students. You will not observe a teacher and you will not “see yourself”
            playing IVT.
          </b-card>
          <b-img class="avatar" center :src="require('../assets/1stPerson.png')" width="800" height="400" fluid alt="Responsive image" />
        </div>
        <div v-else-if="currentRule === 3">
          <h4 class="title">IVT Classrooms</h4>
          <b-card>
            When you log into IVT, you will select one classroom to
            practice with (1st grade or 6th grade classroom).
          </b-card>
          <b-row>
            <b-col v-for="classroom in classrooms" :key="classroom._id">
              <b-card :title="classroom.name"
                      :img-src="classroom.image"
                      img-top
                      class="mb-3">
              </b-card>
            </b-col>
          </b-row>
        </div>
        <div v-else-if="currentRule === 4">
          <h4 class="title">IVT-T Students</h4>
          <b-card>
            After you select a classroom, you will select a character. There are two virtual characters
            you can practice with, and you can learn more about these characters in <span>Introductions / Meet Your Students</span>.
          </b-card>
          <b-row>
            <b-col v-for="student in students" :key="student._id">
              <b-card :title="student.name"
                      :img-src="student.image"
                      img-top
                      class="mb-1">
                <ul>
                  <li style="margin-bottom:0">{{student.classroomName}}</li>
                  <li style="margin-bottom:0">{{student.behavior}}</li>
                </ul>
              </b-card>
            </b-col>
          </b-row>
        </div>
        <div v-else-if="currentRule === 5">
          <h4 class="title">Decision Points</h4>
          <b-card>
            <p>
              After you select a classroom and a character, the storyline begins with background information (time of day,
              instructional activity, directions you gave to the class) and you will begin playing. While playing, the characters
              will engage in specific behaviors and you will be asked to select how you want to respond to the character
              (called <span>decision points</span>).
            </p>
            <p style="margin-bottom:0">
              You will typically have three options (displayed at the same time) to pick from at each decision point. Based on
              your selection, the storyline will continue, until you reach the next decision point or the end.
            </p>
          </b-card>
          <b-img class="avatar" center :src="require('../assets/DecisionPoint.png')" width="800" height="400" fluid alt="Responsive image" />
        </div>
        <div v-else-if="currentRule === 6">
          <h4 class="title">Three Stage Training Sequence</h4>
          <b-card-group deck>
            <b-card header="Practice">
                <p class="card-text">
                    Respond to disruptive students by selecting one of three choices. Depending on your choice, the character will escalate or de-escalate.
                </p>
            </b-card>
            <icon name="long-arrow-right" scale="2" class="arrow"></icon>
            <b-card header="Reflection">
                <p class="card-text">
                    Watch an instant replay of the storyline with your decisions and reflect on specific decision points.
                </p>
            </b-card>
            <icon name="long-arrow-right" scale="2" class="arrow"></icon>
            <b-card header="Feedback">
                <p class="card-text">
                    Receive feedback on the effectiveness of your choice and how your choice impacted the student’s behavior.
                </p>
            </b-card>
          </b-card-group>
        </div>
        <div v-else-if="currentRule === 7">
          <h4 class="title">Three Levels of Play</h4>
          <b-table fixed bordered head-variant="light" :items="levelsPlayTable" style="margin-bottom:30px;"></b-table>
        </div>
        <div v-else-if="currentRule === 8">
          <h4 class="title">Leveling Up in IVT</h4>
          <b-card-group deck>
            <b-card header="Level 2" style="margin-top:50px;">
                <p class="card-text">
                    Earn an Effectiveness Percentage Score ≥ 75% and reach a positive or mixed ending on four unique storylines.
                </p>
            </b-card>
            <b-card header="Level 3">
                <p class="card-text">
                    Complete Level 3 storylines for all two characters by the end of Week 8 of the Online Course.
                </p>
            </b-card>
          </b-card-group>
          <b-card>
            <p><span>NOTE:</span> You level up by character (Level 2 to Level 3) when you play at least four <span>unique storylines*</span> in which you meet BOTH of the following criteria:</p>
            <ul>
              <li>
                <span>Earn an Effectiveness Percentage Score ≥ 75%.</span>
                <ul>
                  <li>Your Effectiveness Percentage Score is calculated by dividing the number of effective choices (scored as 1) by the total number of choices made in a storyline. The points you earn are yours, not the student’s.</li>
                </ul>
              </li>
              <li>
                <span>Achieve a Positive or Mixed Ending</span>
                <ul>
                  <li>For Jordan, positive endings include being academically engaged (on-task, following instructions). Mixed endings are those in which the student may be off-task or slightly disengaged, but not visibly angry, actively aggressive, clearly non-compliant, or breaking a classroom rule.</li>
                  <li>For Michael, positive endings include being on-task, following instructions, or completing their work. Mixed endings are those in which there is inconsistent attention to the task.</li>
                </ul>
              </li>
            </ul>
            <p style="margin-top:20px;margin-bottom:0;"><span>*A unique storyline</span> is one that you have played only once. A non-unique (repeated) storyline includes playing with the same character at the same level while selecting the same responses.</p>
          </b-card>
        </div>
        <div v-else-if="currentRule === 9">
          <h4 class="title">User Profile</h4>
          <b-card>
            <p>
              You can access your User Profile at any time by clicking on your name. In the User Profile, you can do the following:
            </p>
            <ul>
              <!--
              <li>Upload, change, or remove your photo</li>
              <li>Set your facial expression recording preferences</li>
            -->
              <li>Update your email address.</li>
            </ul>
          </b-card>
        </div>
        <div v-else-if="currentRule === 10">
          <h4 class="title">Image, Video, and Audio Options</h4>
                        <!--
          <b-card>
            <p>IVT Profile Picture and Video Capture</p>
            <ul>

              <li>
                <span>Profile Picture:</span>
                You can upload a profile picture or take one using the webcam. This profile picture will appear next to each
                decision point during Practice. This feature is optional and can be changed in User Profile settings.
              </li>

              <li>
                <span>Video Capture:</span>
                During Practice, you can record your facial expressions. During Replay, you have the option to view your
                recorded facial expressions.
              </li>
            </ul>
          </b-card>
                      -->
          <b-card>
            <p>Audio</p>
            <ul>
              <li>Decision points, character actions, and dialogue are displayed as text.</li>
              <li>You will hear the main characters speak (Michael, Jordan) along with text for what they say.</li>
              <li>Some characters curse when they are angry. You may want to use headphones or adjust the volume depending on your location.</li>
            </ul>
          </b-card>
        </div>
        <div v-else-if="currentRule === 11">
          <h4 class="title">Colleagues</h4>
          <b-card>
            Rick and Cindy are two fictional teachers in the virtual world of IVT.
            You have the option to explore Rick and Cindy’s teaching profiles.
          </b-card>
          <b-row>
          <b-col v-for="colleague in colleagues" :key="colleague._id">
            <b-card :title="colleague.name"
                    :img-src="colleague.image"
                    img-top
                    class="mb-3">
            </b-card>
          </b-col>
        </b-row>
          </div>
        <div v-else-if="currentRule === 12">
          <h4 class="title">Confidence, Ratings, and Final Reflections</h4>
          <b-card>
            <p>Before logging out, you will be asked to respond to the following three questions:</p>
            <b-img class="avatar" center :src="require('../assets/logoutform.png')" fluid alt="Responsive image" />
          </b-card>
        </div>
        <div v-else-if="currentRule === 13">
          <h4 class="title">Training Log</h4>
          <b-card>
            <p>In the Training Log, you can track:</p>
            <ul>
              <li>
                <span>Practice History</span>
                which includes a record of your Practice, Reflection,
                and Feedback for all storylines at Levels 2 and 3.
              </li>
              <li>
                <span>Time Played</span>
                which includes your performance data for each virtual
                character you have practiced with.
              </li>
              <li>
                <span>Confidence Ratings</span>
                which includes how confident you feel over time about
                your ability to manage current and future behavior problems
                in your classroom.
              </li>
              <li>
                <span>Final Reflections</span>
                which includes a record of all reflections completed before
                you logout of IVT-T.
              </li>
            </ul>
          </b-card>
        </div>
        <div v-else>
          <h4 class="title">This rule does not exist</h4>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'GameRules',
  data: () => {
    return {
      currentRule: 1,
      totalRules: 13,
      onlineIVTTable: [
        {
          online_course:
            `8 Week Online Course that will introduce you to evidence-based practices
             to prevent and manage disruptive behaviors.`,
          interactive_virtual_training:
            `Simulates real-life interactions between disruptive students and teachers,
             with 3D animated graphics. IVT is designed to help you practice
             applying the knowledge from the online course when confronted with
             disruptive avatars.`
        },
        {
          online_course:
            `Emphasizes proactive monitoring, effective redirection and altering the
             antecedents (triggers) and consequences (responses) to those behaviors.`,
          interactive_virtual_training:
            `Avatars engage in off-task (e.g., difficulty staying focused, wandering
             around the classroom) or non-compliant behaviors (e.g., arguing,
             refusing to follow instructions, aggression).`
        },
        {
          online_course:
            `Approximately one hour per week reviewing the online course materials.`,
          interactive_virtual_training:
            `Spend approximately two hours per week playing IVT (we recommend
             no less than 30 minutes per training session).`
        }
      ],
      levelsPlayTable: [
        {
          level_2_step_up_your_game:
            `Focus on making effective choices, reflect,
             receive feedback.`,
          level_3_beat_the_clock:
            `Focus on making effective choices, reflect,
             receive feedback.`
        },
        {
          level_2_step_up_your_game:
            `Take as much time as you need.`,
          level_3_beat_the_clock:
            `Make your choice within 15 seconds (you will
             see a clock count down). If you run out of time
             the system will automatically select an
             ineffective option.`
        },
        {
          level_2_step_up_your_game:
            `Always available beginning in Week 3 of the
             Online Course.`,
          level_3_beat_the_clock:
            `Reach Level 3 for all two characters by Week
             8 of the online course.`
        }
      ]
    }
  },
  methods: {
    changeRule(ruleIndex) {
      this.$router.push({
        name: "GameRules",
        params: { ruleIndex }
      })
    }
  },
  watch: {
    '$route' (to, from) {
      if(to.name === from.name) {
        // same route, update active rule
        this.currentRule = parseInt(this.$route.params.ruleIndex) || 0
      }
    }
  },
  computed: {
    ...mapGetters(['classrooms', 'students','colleagues'])
  },
  created: function() {
    // set the active rule to whatever came in from route params, or default
    // to the first rule
    this.currentRule = parseInt(this.$route.params.ruleIndex) || 0
  },
  components: { Icon }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.mb-1, .mb-2, .mb-3 {
  max-width: 20rem;
  margin:0 auto;
  transition: opacity 0.5s;
}
.mb-3 .card-body {
  position: absolute;
  bottom: 0;
  left: 0;
  color: white;
  text-shadow: 0px 1px black;
}
.mb-3 .card-body::after {
  position: absolute;
  background-color: black;
  z-index: 2;
}
.mb-3 .card::after {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color:black;
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: inherit;
}
.card {
  margin-bottom: 30px;
}
.card li {
  margin-bottom: 10px;
}
.card li:last-child {
  margin-bottom: 0;
}
.mb-2 h4, .mb-3 h4 {
  margin-bottom: 0;
}
.arrow {
  margin-top: 33px;
  color: #157EFB;
}
ul {
  padding-left: 30px;
  margin-bottom: 0;
}
h4 {
  color: inherit;
}
span {
  font-weight: bold;
  color: #157EFB;
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
.customRules {
  margin-bottom: 30px;
}
</style>
