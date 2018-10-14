<template>
  <div class="welcome">
    <h1 class="oldH1">Welcome</h1>
    <b-button block variant="primary" class="oldFormBtn" @click="startSession()">Start</b-button>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Alert from './Alert'
import Parse from 'parse'

export default {
  name: 'Login',
  data: () => {
    return {
      Modes: {
        LOGIN: 0,
        REGISTER: 1,
        FORGOT: 2
      },
      currentMode: 0,
      form: {
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      }
    }
  },
  methods: {
    startSession(){
        this.$store.dispatch('getUserCount')
          .then((userCount) => {
            let form = {}
            //Need to generate random access different from existing one
            form.email = userCount.toString()+"@a.com"
            form.password = "a"
            this.$store.dispatch('register', form)
              .then((user) => {
                this.currentMode = this.Modes.LOGIN
                this.$store.commit('setAlert', { message: 'Please confirm your email', variant: 'success' })

                this.$store.dispatch('login', form)
                  .then((user) => {
                    this.$store.dispatch('load')
                    this.$router.push({ name: 'Gender' })
                  })
                  .catch((err) => this.$store.commit('setAlert', { message: err.message, variant: 'danger' }))

              })
              .catch((err) => this.$store.commit('setAlert', { message: err.message, variant: 'danger' }))

          })

    },
    login(evt) {
      evt.preventDefault()
      this.$store.dispatch('login', this.form)
        .then((user) => {
          this.$store.dispatch('load')
          this.$router.push({ name: 'Gender' })
        })
        .catch((err) => this.$store.commit('setAlert', { message: err.message, variant: 'danger' }))
    },
  },
  components: { Alert },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .login {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /*background: url(../assets/food3.jpeg) no-repeat center center fixed;*/
    background: linear-gradient(to bottom, #225997 0%,#7EB9E6 100%);
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }
  .shade {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: black;
    opacity: 0.5;
  }
  .loginCard {
    position: absolute;
    z-index: 2;
    max-width: 35rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
  }
  .card-link {
    margin-top: 40px;
  }

  .oldInput {
    /*border: 1px solid lightgray;
    border-radius: 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    border-bottom: 4px solid lightgray;
    padding: 12px;*/
  }
  .oldH1 {
    /*text-align: center;
    text-transform: uppercase;
    letter-spacing: 10px;
    color: #5C6D70;
    margin-bottom: 30px;*/
  }
  .oldFormBtn {
    /*background-color: #5C6D70;
    border: 0;
    padding: 10px;
    border-radius: 2px;*/
    /*margin-top: 30px;*/
  }
  .oldFormBtn:hover {
    /*background-color: #6a7d81;*/
  }
</style>
