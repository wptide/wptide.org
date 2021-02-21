<template>
  <div class="iframe loading">
    <iframe width="100%" src="/api/spec/v1/" frameBorder="0"></iframe>
  </div>
</template>

<script>
export default {
  mounted () {
    document.getElementsByTagName('iframe')[0].addEventListener('load', () => {
      document.getElementsByClassName('iframe')[0].classList.remove('loading');
    }, true);
  }
}
</script>

<style lang="stylus">
.spec .page
  padding-bottom 0
.spec .theme-default-content:not(.custom)
  max-width calc(100% - 2.5rem)
  padding-bottom 0
.spec iframe
  height calc(100vh - 6.1rem)
.spec .iframe
  height calc(100vh - 6.1rem)
  position relative
.spec .iframe.loading
  visibility hidden
@keyframes spinner
  to
    transform: rotate(360deg)
.spec .iframe.loading:before
  content: ''
  box-sizing border-box
  position absolute
  visibility visible
  top 50%
  left 50%
  width 4rem
  height 4rem
  margin-top -2rem
  margin-left -2rem
  border-radius 50%
  border 2px solid #eaecef
  border-top-color #1728f6
  animation spinner .8s linear infinite
.spec .page-edit
  display none
</style>
