<template>
  <div class="status-row__status">
    <img
      :class="'status-row__status-icon status-row__status-icon--' + status"
      :src="'/assets/img/icon-status-' + status + '.svg'"
      alt=""
      :title="label"
      width="16"
      height="16"
    >
  </div>
</template>

<script>
export default {
    name: 'Status',
    props: {
        status: {
            type: String,
            required: true,
            default: 'unknown',
        },
    },
    data() {
        return {
            label: '',
        };
    },
    mounted() {
        const labels = {
            complete: 'The audit completed successfully',
            failed: 'The audit failed to complete',
            'in-progress': 'The audit is currently in-progress',
            pending: 'The audit is pending',
            unknown: 'The audit status is unknown',
        };
        this.label = labels[this.status];
    },
};
</script>

<style scoped lang="stylus">
  @keyframes rotate
    to
      transform rotate(1turn)

  .status-row__status
    display flex
    align-items center
    font-weight 700
    margin-right 1rem

  .status-row__header-title .status-row__status
    margin-top 0.1rem

  img.status-row__status-icon
    display block
    width 1rem
    height 1rem
    max-width 1rem
    flex-shrink 0
    flex-grow 0

  .status-row__header-title img.status-row__status-icon
    margin-top 0.25rem

  .status-row__status-icon--in-progress
    animation rotate 1s linear infinite
</style>
