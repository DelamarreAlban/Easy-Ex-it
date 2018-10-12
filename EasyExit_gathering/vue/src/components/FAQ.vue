<template>
  <div class="faq">
    <b-container>
      <div class="customHeader">Frequently Asked Questions (FAQs)</div>
      <b-row>
        <b-col>
          <div class="item">
            <h5>What Internet browsers work best to complete the IVT training modules?</h5>
            <p>While IVT works across almost all browsers, for optimal use, we recommend the following browsers:</p>
            <ul>
              <li><a href="https://www.google.com/chrome/browser/desktop/index.html">Google Chrome</a></li>
              <li><a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a></li>
            </ul>
          </div>

          <div class="item">
            <h5>What type of device can I use to play IVT?</h5>
            <p>IVT uses WebGL to display 3D scenes. WebGL is found in many devices, such as Desktops, iPads, TVs, and more. To find out if your computer/browser supports WebGL, go to the following URL : <a href="https://get.webgl.org">get.webgl.org.</a></p>
          </div>

          <div class="item">
            <h5>Can I pause in the middle of an IVT storyline?</h5>
            <p>You can not pause in the middle of an IVT-T storyline </p>
            <!--<p>IVT saves your progress at all times. Although you can quit at any time, however, we advise you complete the session feedback whenever you feel like taking a break.</p>
        -->  </div>

          <div class="item">
            <h5>I am having trouble getting IVT to load. What can I do?</h5>
            <p>If you are having trouble playing IVT sessions, you may need to check your compatibility with WebGL and your device, as well as browsers (if any). You can do this test at the following URL : <a href="https://get.webgl.org">get.webgl.org.</a> It is also possible that you left your last IVT-T session by closing your browser without logging out first. If that is the case, IVT-T will not load properly. Simply press logout on the top right corner of the website, and log back in: although IVT-T saves your progress at all times viewable in the Training Log, IVT-T will reload at the Home page.</p>
          </div>

          <div class="item">
            <h5>I thought I had completed certain IVT practice sessions, but I don’t see them in the training log. What should I do?</h5>
            <p>Each IVT practice session is designated as complete  after you reach the conclusion  of a storyline, reflect on one decision point, and receive feedback. If you feel you have completed a practice session that is not logged as “complete” you can do one of two things:</p>
            <ul>
              <li>Repeat the practice session and make sure you reach the conclusion of the storyline, reflect on one decision point, and receive feedback from IVT-T about your practice.</li>
              <li>Contact <a href="http://visage.cs.fiu.edu/#/contact">support@ivt.com</a> to troubleshoot and adjust your completion status.</li>
            </ul>
          </div>

          <div class="item">
            <h5>IVT is loading and playing slowly. What can I do?</h5>
            <p>It is possible that your internet connection is too slow (low bandwidth) : if so, you can try to move to a location with a faster internet connection (higher bandwidth). It is also possible that the graphics on your computer is not powerful enough to provide you with a pleasant experience with IVT-T graphical simulations.</p>
          </div>

          <div class="item">
            <h5>I would like to print IVT screens, is that possible?</h5>
            <p>You can use the Print button available on many IVT-T pages. You can also print a page or a screen at any time by pressing CTRL+P on your keyboard if you are using Windows, or by pressing CMD+P if you are using a Mac.</p>
          </div>

          <div class="item">
            <h5>I would like to download the Replay videos to view at another time. Is this okay?</h5>
            <p>It is not okay to download or copy any portion of IVT.</p>
          </div>

          <div class="item">
            <h5>I would like to show a portion of an IVT learning module in a class I’m teaching. Is this ok?</h5>
            <p>You can not show any portion of an IVT-T learning module in a class.</p>
          </div>

          <div class="item">
            <h5>How do I update my user information?</h5>
            <p>Once logged in, visit your profile page by clicking on your name on the top right hand side of the navigation bar. From your profile page, you can change your email address if you would like.</p>
          </div>

        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'FAQ'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .item {
    margin-bottom: 30px;
  }
  .item:last-child {
    margin-bottom: 0;
  }
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
