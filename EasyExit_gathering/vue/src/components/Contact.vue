<template>
  <div class="contact">
    <b-container>
      <div class="customHeader">Support</div>
      <Alert />
      <b-row>
        <b-col>
          <b-form @submit="sendEmail">
            <b-form-group label="Name:" label-for="input-2">
              <b-form-input id="input-2"
                            type="text" v-model="form.name" required
                            placeholder="John Doe"
              ></b-form-input>
            </b-form-group>
            <b-form-group label="Email:" label-for="input-1">
              <b-form-input id="input-1"
                            type="email" v-model="form.email" required
                            placeholder="john@appleseed.com"
              ></b-form-input>
            </b-form-group>
            <b-form-group label="Message:" label-for="input-3">
              <b-form-textarea id="input-3"
                               v-model="form.message"
                               placeholder="Write your message here"
                               :rows="3"
                               :max-rows="6">
               </b-form-textarea>
            </b-form-group>
            <!--<div class="g-recaptcha" data-sitekey="your_site_key"></div> -->
            <b-button type="submit" variant="primary">Submit</b-button>
            <!--<b-button type="reset" variant="secondary">Reset</b-button>-->
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Alert from './Alert'
const { mapGetters } = require('vuex')

export default {
  name: 'Contact',
  data: () => {
    return {
      form: {
        name: '',
        email: '',
        message: ''
      }
    }
  },
  methods: {
    sendEmail(evt) {
      evt.preventDefault()
      this.$store.dispatch('newSupport', this.form)
        .then((cu) => {
          this.$store.commit('setAlert', { message: "Your feedback was sent successfully", variant: 'success' })
          this.clearForm()
        })
        .catch((cu, err) => this.$store.commit('setAlert', { message: err.message, variant: 'danger' }))
    },
    clearForm() {
      this.form.message = ''
    }
  },
  created () {
    this.form = {
      name: this.user.fullName,
      email: this.user.email,
      message: ''
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  components: { Alert }
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
