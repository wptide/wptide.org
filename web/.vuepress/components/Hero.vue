<template>
  <div class="hero">
    <div class="hero__brand">
      <span class="hero__title">Official Documentation</span>
      <svg class="hero__logo" viewBox="0 0 700 233" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="path0_fill" fill-rule="evenodd" d="M0 0h233v70c-49 9-84 27-116 46v49l13-8c31-18 61-34 103-43v119H0v-71c50-9 84-28 117-46V67l-11 7C74 92 44 109 0 117V0z"></path>
          <path id="path1_fill" d="M45 0H19v36H0v20h19v82c0 21 10 36 38 36h22v-22H62c-13 0-17-6-17-18V56h35V36H45V0z"></path>
          <path id="path2_fill" d="M30 51H4v138h26V51zM17 0C8 0 0 8 0 17s8 17 17 17 17-8 17-17S26 0 17 0z"></path>
          <path id="path3_fill" d="M125 0H99v66c-8-11-21-18-39-18-36 0-60 30-60 71 0 42 23 71 59 71 14 0 30-5 40-19v18h26V0zM64 70c20 0 36 16 36 49s-15 49-36 49c-24 0-37-18-37-49s14-49 37-49z"></path>
          <path id="path4_fill" d="M64 0C22 0 0 30 0 71c0 40 23 71 65 71 27 0 46-11 58-31l-21-12c-7 12-18 21-36 21-25 0-38-15-39-43h97v-6c0-40-21-71-60-71zm-1 22c20 0 33 12 34 35H27c2-22 15-35 36-35z"></path>
        </defs>
        <use xlink:href="#path0_fill" fill="#1526FF"></use>
        <use xlink:href="#path1_fill" transform="translate(292 37)"></use>
        <use xlink:href="#path2_fill" transform="translate(386 22)"></use>
        <use xlink:href="#path3_fill" transform="translate(435 22)"></use>
        <use xlink:href="#path4_fill" transform="translate(576 70)"></use>
      </svg>
      <span class="hero__version">{{ version }}</span>
    </div>
    <hr/>
    <div class="hero__content">
      <p class="hero__description">
        {{ $description }}
      </p>
      <p class="hero__action">
        <a href="/docs/" class="nav-link action-button">Get Started →</a>
      </p>
    </div>
    <canvas class="hero__canvas" id="canvas"></canvas>
  </div>
</template>

<script>
import Waves from '../util/waves';
import { version } from '../../../package';

export default {
  data() {
    return {
      version: version
    }
  },
  mounted () {
    import('../util/waves').then(module => {
      let el = document.getElementsByTagName("canvas")[0];
      function create() {
        if (module.waves) module.waves.stop()
        if (matchMedia('(min-width: 959px)')) {
          module.waves = new Waves(el)
          module.waves.run()
        }
      }

      create()
      window.addEventListener('resize', create)
    })
  }
}
</script>

<style lang="stylus">
.hero
  position relative
  height calc(100vh -13.1rem)

.hero__brand
  display flex
  flex-direction column
  align-items flex-start
  padding-bottom 2.5rem

.hero__logo
  width 500px
  max-width 100%

.hero__title
  font-size 40px
  font-weight 200
  margin-bottom 20px
  text-align left

.hero__content
  z-index 1
  text-align left
  padding 1.5rem 0
  position relative

  .hero__description
    font-size 1.15rem
    line-height 1.5

  .hero__action
    text-align center
    padding-top 1.5rem

.hero__canvas
  position absolute
  bottom 0
  left 50%
  z-index 0
  transform translateX(-50%)
  display none

.hero__brand
  position relative

.hero__version
  font-weight 300
  position absolute
  left 0
  top -1.5rem

@media (min-width: 960px)
  .hero
    padding-top 10vh
    height calc(90vh -13.1rem)

  .hero__canvas
    display block
</style>
