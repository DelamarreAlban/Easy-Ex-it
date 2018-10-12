<template>
  <div class="admin">
    <b-container>
      <div class="customHeader">Admin</div>

      
        <b-card no-body>
          <b-tabs card>
            <b-tab title="Users" active>
              
              <b-form-input id="exampleInput1"
                type="text"
                v-model="userString"
                required
                placeholder="Filter by first name or last name"
                style="margin-bottom:20px">
              </b-form-input>
              <div v-show="showUserTable">
                <b-table ref="userTable" striped hover
                  :fields="userDetails.fields"
                  :current-page="userCurrentPage"
                  :per-page="userItemsPerPage"
                  :items="userProvider"
                  outlined>
                  <template slot="actions" slot-scope="row">
                    <b-button variant="primary" :to="{ name: 'UserAnalytics', params: { userId: row.item.parse.id } }">View</b-button>
                  </template>
                </b-table>
                <b-pagination style="float: right;" size="md" v-show="userString === ''" :total-rows="userMaxItems" v-model="userCurrentPage" :per-page="userItemsPerPage"></b-pagination>
              </div>
              <b-alert :show="!showUserTable">No users found</b-alert>
              
            </b-tab>
            <b-tab title="Support Messages">
              <b-form-input id="exampleInput2"
                type="text"
                v-model="supportString"
                required
                placeholder="Filter by first name or last name"
                style="margin-bottom:20px">
              </b-form-input>
              <div v-show="showSupportTable">
                <b-table ref="supportTable" striped hover
                  :fields="supportDetails.fields"
                  :current-page="supportCurrentPage"
                  :per-page="supportItemsPerPage"
                  :items="supportProvider"
                  outlined>
                </b-table>
                <b-pagination style="float: right;" size="md" v-show="supportString === ''" :total-rows="supportMaxItems" v-model="supportCurrentPage" :per-page="supportItemsPerPage"></b-pagination>
              </div>
              <b-alert :show="!showSupportTable">No support messages found</b-alert>
            </b-tab>
          </b-tabs>
        </b-card>
  
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Parse from 'parse'
import moment from 'moment'
import { debounce } from 'lodash'

export default {
  name: 'Admin',
  data: () => {
    return {
      showUserTable: false,
      userItemsPerPage: 5,
      userCurrentPage: 1,
      userMaxItems: 0,
      userString: '',
      userDetails: {
        sortBy: 'first_name',
        sortDesc: false,
        fields: [
          { key: 'first_name', sortable: true },
          { key: 'last_name', sortable: true },
          { key: 'actions', sortable: false }
        ]
      },
      showSupportTable: false,
      supportItemsPerPage: 5,
      supportCurrentPage: 1,
      supportMaxItems: 0,
      supportString: '',
      supportDetails: {
        sortBy: 'date',
        sortDesc: true,
        fields: [
          { key: 'date', sortable: true },
          { key: 'first_name', sortable: true },
          { key: 'last_name', sortable: true },
          { key: 'message', sortable: false }
        ]
      }
    }
  },
  methods: {
    userProvider (ctx) {
      let { userItemsPerPage, userCurrentPage, userString } = this
      let { sortBy, sortDesc } = ctx

      return this.$store.dispatch('getUsers', { userItemsPerPage, userCurrentPage, sortBy, sortDesc, userString })
        .then(() => {
          let items = []
  
          Object.keys(this.users).forEach(key => {
            let user = this.users[key]
            items.push({ 
              first_name: this.capitalize(user.firstName), 
              last_name: this.capitalize(user.lastName),
              parse: user
            })
          })
          
          this.userMaxItems = this.userCount
          this.showUserTable = items.length > 0
          return items
        })
        .catch((error) => {
          console.log(error)
          this.showUserTable = false
          return []
        })
    },
    supportProvider (ctx) {
      let { supportItemsPerPage, supportCurrentPage, supportString } = this
      let { sortBy, sortDesc } = ctx
      
      return this.$store.dispatch('getSupports', { supportItemsPerPage, supportCurrentPage, sortBy, sortDesc, supportString })
        .then(() => {
          let items = []
  
          Object.keys(this.supports).forEach(key => {
            let support = this.supports[key]
            items.push({ 
              first_name: this.capitalize(support.user.firstName), 
              last_name: this.capitalize(support.user.lastName),
              message: support.message,
              date: moment(support.createdAt).format('MM/DD/YYYY')
            })
          })
          
          this.supportMaxItems = this.supportCount
          this.showSupportTable = items.length > 0
          return items
        })
        .catch((error) => {
          console.log(error)
          this.showSupportTable = false
          return []
        })
    },
    findUsers: debounce((vm) => {
      vm.$refs.userTable.refresh()
    }, 250),
    findSupports: debounce((vm) => {
      vm.$refs.supportTable.refresh()
    }, 250),
    capitalize(word) {
      return word[0].toUpperCase() + word.substr(1).toLowerCase()
    }
  },
  computed: {
    ...mapGetters(['user', 'supports', 'supportCount', 'users', 'userCount'])
  },
  watch: {
    userString(newVal, oldVal) {
      this.findUsers(this)
    },
    supportString(newVal, oldVal) {
      this.findSupports(this)
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      let user = vm.user
      if(!user || !user.admin) vm.$router.push({ name: 'Home' })
    })
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
</style>
