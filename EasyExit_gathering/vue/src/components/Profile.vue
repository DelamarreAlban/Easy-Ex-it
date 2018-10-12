<template>
  <div class="profile">

    <b-modal id="modal1" title="Webcam" v-model="isTakingPicture" ok-title="Take Picture" @ok="snapWebcam" @hide="cancelWebcam">
      <div id="my_camera" style="width:320px; height:240px; margin:0 auto"></div>
    </b-modal>

    <b-container>
      <div class="customHeader">Your Profile</div>
      <Alert />
      <b-form @submit="updateProfile">
        <b-row>
          <b-col cols="4">
            <div class="info">
              <b-img class="avatar" center :src="user.avatar || require('../assets/default-avatar.png')" fluid alt="Responsive image" />
              <b-button @click="turnOnWebcam" variant="secondary">Take Photo</b-button><br />
              <b-button @click="removeAvatar" variant="link">Remove Photo</b-button>
            </div>
          </b-col>
          <b-col cols="8">
            <h4>{{this.user.fullName}}</h4>
            <h5>{{this.user.email}}</h5>
            <hr/>
            <!-- Turn on webcam recording
            <b-form-group label="Webcam Recording" label-for="radios-1">
              <b-form-radio-group id="radios-1" v-model="form.useWebcam" name="radioSubComponent">
                <b-form-radio :value="true">On</b-form-radio>
                <b-form-radio :value="false">Off</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
          -->
          <!-- File selection to change avatar
            <b-form-group label="Change Avatar" label-for="file-1">
              <b-form-file id="file_input1" ref="fileinput" accept="image/jpeg, image/png, image/gif" v-model="form.file"></b-form-file>
            </b-form-group>
          -->
            <!-- <b-button @click="clearFiles" variant="link">Clear Selection</b-button> -->
            <b-form-group label="Update Email" label-for="input-2">
              <b-form-input id="input-2" v-model="form.newEmail" type="email" placeholder="john@appleseed.com"></b-form-input>
            </b-form-group>
            <b-form-group label="Update Password" label-for="input-3">
              <b-form-input id="input-3" v-model="form.newPassword" type="password"></b-form-input>
            </b-form-group>
            <div style="text-align: right">
              <b-button type="submit" variant="success">Save Changes</b-button>
              <b-button type="reset" variant="secondary">Reset</b-button>
            </div>
          </b-col>
        </b-row>
      </b-form>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Alert from './Alert'
import Webcam from 'webcamjs'

export default {
  name: 'Profile',
  data: () => {
    return {
      form: {
        newEmail: '',
        newPassword: '',
        useWebcam: false,
        file: null,
      },
      isTakingPicture: false
    }
  },
  methods: {
    updateProfile(evt) {
      if(evt) evt.preventDefault()

      this.$store.dispatch('updateProfile', this.form)
        .then(() => this.$store.commit('setAlert', {
          message: 'Your changes were updated successfully',
          variant: 'success'
        }))
        .catch((error) => this.$store.commit('setAlert', {
          message: error.message,
          variant: 'danger'
        }));
    },
    clearFiles() {
      this.$refs.fileinput.reset();
    },
    cancelWebcam() {
      Webcam.reset()
      this.isTakingPicture = false
    },
    snapWebcam() {
      Webcam.snap((data_uri) => {
        this.form.file = data_uri
        this.updateProfile()
      });
    },
    turnOnWebcam() {
      this.isTakingPicture = true
      setTimeout(() => { 
        Webcam.set({
          width: 320,
          height: 240,
          dest_width: 640,
		      dest_height: 480,
          crop_width: 480,
		      crop_height: 480,
          image_format: 'jpeg',
          jpeg_quality: 90,
          flip_horiz: true
        })
        Webcam.attach('#my_camera')
      }, 250)
    },
    removeAvatar() {
      this.$store.dispatch('removeAvatar')
        .then(() => this.$store.commit('setAlert', {
          message: 'Your changes were updated successfully',
          variant: 'success'
        }))
        .catch((error) => this.$store.commit('setAlert', {
          message: error.message,
          variant: 'danger'
        }))
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  created() {
    this.form.useWebcam = this.user.useWebcam
  },
  components: { Alert }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.info {
  text-align: center;
}
.info img {
  width: 100%;
}
.info a {
  display: block;
  margin: 10px 0;
}
.avatar {
  margin-bottom: 30px;
  max-width: 200px;
  border-radius: 50%;
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
</style>
