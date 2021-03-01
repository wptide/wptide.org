<template>
  <div class="status-row__status">
    {{ label }}
    <img :class="'status-row__status-icon status-row__status-icon--' + status" :src="'/assets/img/icon-status-' + status + '.svg'" alt="" width="12" height="12">
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
    width 12px
    height 12px
    margin-top 0.2em
    margin-left 8px
    flex-shrink 0
    flex-grow 0
  .status-row__status-icon--in-progress
    animation rotate 1s linear infinite
</style>
