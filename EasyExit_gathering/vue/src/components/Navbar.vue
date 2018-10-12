<template>
  <b-navbar toggleable="lg" type="dark" fixed="top" class="customNav">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand @click="goto({state: 'Home'})">
      <img :src="require('../assets/ivt-logo.png')" alt="IVT" class="customLogo">
    </b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <div v-for="navItem in navItems" :key="navItem.id">
          <div v-if="navItem.sections">
            <b-nav-item-dropdown :class="submenuSelected(navItem,$route.name) ? 'active': ''" :text="navItem.name">
              <div v-for="section in navItem.sections" :key="section.id">
                <!-- <div v-if="section.sections">
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-header>H{{section.name}}</b-dropdown-header>
                  <div v-for="subsection in section.sections">
                    <b-dropdown-item :class="$route.name === subsection.state ? 'sub-active' : ''" @click="goto(subsection)">T{{subsection.name}}</b-dropdown-item>
                  </div>
                </div>
                <div v-else> -->
                  <b-dropdown-item :class="$route.name === section.state ? 'sub-active' : ''" @click="goto(section)">{{section.name}}</b-dropdown-item>
                <!-- </div> -->
              </div>
            </b-nav-item-dropdown>
          </div>
          <div v-else>
            <b-nav-item :class="$route.name === navItem.state ? 'active' : ''" @click="goto(navItem)">{{navItem.name}}</b-nav-item>
          </div>
        </div>
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="user.admin" :class="$route.name === 'Admin' ? 'active' : ''" @click="goto({state: 'Admin'})">Admin</b-nav-item>
        <b-nav-item :class="$route.name === 'Profile' ? 'active' : ''" @click="goto({state: 'Profile'})">
          <b-img :src="user.avatar || require('../assets/default-avatar.png')" class="navImage" alt="image" />
          {{user.fullName}}
        </b-nav-item>
        <b-nav-item @click="$store.commit('toggleFeedback', true)">Logout</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { mapGetters } from 'vuex'
import { forEach } from 'lodash'

export default {
  name: 'Navbar',
  data: () => {
    return {
      currNavItemId: null
    }
  },
  methods: {
    goto(navItem) {
      let route = { name: navItem.state }
      if(navItem.params) route.params = navItem.params
      this.currNavItemId = navItem._id
      this.$router.push(route)
    },
    submenuSelected(navItem, route){
      for(var i in navItem.sections){
        if(route === navItem.sections[i].state){
          return route === navItem.sections[i].state
        }
      }
      return
    }
  },
  computed: {
    ...mapGetters(['user', 'students', 'colleagues', 'classrooms']),
    navItems() {
      let items = {
        'nav-0': {
          name: 'Home',
          state: 'Home',
          _id: 'nav-0'
        },
        'nav-1': {
          name: 'Training Log',
          sections: {
            'tl-0': {
              name: 'Practice History',
              state: 'PracticeHistory',
              _id: 'tl-0',
            },
            'tl-1': {
              name: 'Time Played',
              //state: 'CharacterHistoryDefault',
              state: 'CharacterHistory',
              _id: 'tl-1'
            },
            'tl-2': {
              name: 'Confidence Ratings',
              state: 'ConfidenceRatings',
              _id: 'tl-2',
            },
            'tl-3': {
              name: 'Final Reflections',
              state: 'FinalReflections',
              _id: 'tl-3'
            }
          },
          _id: 'nav-1',
        },
        'nav-2': {
          name: 'Introductions',
          sections: {
            'int-4': {
              name: 'Learn About Your School',
              state: 'LearnSchool',
              _id: 'int-4',
            },
            'int-0': {
              name: 'Learn the Rules of the Game',
              state: 'GameRules',
              params: { ruleIndex: '0' },
              _id: 'int-0',
            },
            'int-1': {
              name: 'Meet Your Students',
              state: 'MeetStudents',
              _id: 'int-1'
            },
            'int-2': {
              name: 'Meet Your Colleagues',
              state: 'MeetColleagues',
              _id: 'int-2',
            }
          },
          _id: 'nav-2'
        },
        'nav-3': {
          name: 'Online Course',
          state: 'OnlineCourse',
          _id: 'nav-3'
        },
        'nav-4': {
          name: 'Tour the Classrooms',
          state: 'TourClassroom',
          _id: 'nav-4'
        },
        'nav-5': {
          name: 'Help',
          sections: {
              'help-0': {
                name: 'FAQs',
                state: 'FAQ',
                _id: 'help-0'
              },
              'help-1': {
                name: 'Support',
                state: 'Contact',
                _id: 'help-1'
              }
          },
          _id: 'nav-5'
        }
      }
      return items
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .customNav {
    /*background: linear-gradient(to bottom, #63ADF5 0%, #387CB7 100%);*/
    padding-bottom: 0;
    padding-top: 0;
    background-color: #4674C1;
  }
  .customLogo {
    height: 40px;

  }
  .customLogo img {
    width: 100%;
  }
  .customDropdown {
    font-style: normal;
  }
  .active {
    background-color: #4e80d2;
    border-radius: 5px;
  }
  .sub-active {
    font-weight: bold;
  }
  .navImage {
    height: 20px;
    border-radius: 50%;
  }
</style>
