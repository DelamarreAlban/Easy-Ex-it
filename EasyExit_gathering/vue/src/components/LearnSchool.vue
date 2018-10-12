<template>
  <div class="learnSchool">
    <b-container>
      <div class="customHeader">About Your School</div>
      <b-row align-v="center">
        <b-col>
          <b-img class="avatar" center :src="require('../assets/school.jpg')" fluid alt="Responsive image" />
        </b-col>
        <b-col>
          <p>Washington Elementary is a public K-8th grade school located in a high poverty area community in a northeastern state. Ninety five percent of the students who attend Washington Elementary School are eligible for free or reduced lunch.</p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'LearnSchool'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin-bottom: 30px;
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
