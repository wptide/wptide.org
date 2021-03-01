<template>
  <div class="status-row__status" v-bind:class="!label ? 'status-row__status--no-label' : ''">
    <img :class="'status-row__status-icon status-row__status-icon--' + status" :src="'/assets/img/icon-status-' + status + '.svg'" alt="" :title="label" width="16" height="16">
  </div>
</template>

<script>
  export default {
    name: "StatusRowStatus",
    props: {
      status: String,
      label: String,
    }
  }
</script>

<style scoped lang="stylus">
  @keyframes rotate
    to
      transform rotate(1turn)
  
  .status-row__status
    display flex
    align-items center
    font-weight 700
  .status-row__status-icon
    display block
    width 16px
    height 16px
    flex-shrink 0
    flex-grow 0
  .status-row__status-icon--in-progress
    animation rotate 1s linear infinite
  .status-row__status--no-label .status-row__status-icon
    margin-left 0
</style>
