<template>
  <div class="status-row" v-bind:class="{ 'is-open': isOpen }" v-on:click.stop="isOpen = !isOpen">
    <div class="status-row__header">
      <div class="status-row__header-title">
        <StatusRowStatus class="status-row__header-title-icon" :status="status" />
        <span class="status-row__header-title-text">/api/v1/audit/wporg/theme/<strong>twentytwenty/1.6</strong></span>
      </div>
      <hr class="status-row__separator">
      <div class="status-row__header-time">
        <span class="status-row__header-time-label">Process time:&nbsp;</span>15s
      </div>
    </div>
    <div class="status-row__body">
      <hr class="status-row__separator">
      <strong class="status-row__body-title">Reports</strong>
      <div class="status-row__reports">
        <div class="status-row__report">
          <div class="status-row__report-title">
            <img class="status-row__report-title-icon" src="/assets/img/icon-php-code-sniffer.svg" alt="" width="24" height="24">
            PHP CodeSniffer
          </div>
          <div class="status-row__report-results">
            <div class="status-row__report-result">
              <div>Attempts:</div><div>3</div>
            </div>
            <div class="status-row__report-result">
              <div>Process time:</div><div>13s</div>
            </div>
          </div>
          <StatusRowStatus class="status-row__report-status" label="Completed" status="completed" />
        </div>
        <div class="status-row__report">
          <div class="status-row__report-title">
            <img class="status-row__report-title-icon" src="/assets/img/icon-lighthouse.svg" alt="" width="24" height="24">
            Lighthouse
          </div>
          <div class="status-row__report-results">
            <div class="status-row__report-result">
              <div>Attempts:</div><div>3</div>
            </div>
            <div class="status-row__report-result">
              <div>Process time:</div><div>13s</div>
            </div>
          </div>
          <StatusRowStatus class="status-row__report-status" label="Completed" status="completed" />
        </div>
      </div>
    </div>
    <div class="status-row__footer">
      <button class="status-row__toggle" type="button">
      <span v-if="!isOpen">
        Show reports
      </span>
        <span v-else>
        Collapse
      </span>
      </button>
    </div>
  </div>
</template>

<script>
import StatusRowStatus from "./StatusRowStatus";
export default {
  name: 'StatusRow',
  components: {StatusRowStatus},
  data: () => ( { isOpen: false } ),
  props: {
    status: String,
    statusLabel: String,
  }
};
</script>

<style scoped lang="stylus">
  .status-row
    border 1px solid #EAECEF
    box-sizing border-box
    box-shadow 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)
    border-radius 4px
    transition border-color 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease, visibility 0.4s ease
    padding 16px 0
    position relative
    margin-bottom 16px
    cursor pointer
    &.is-hidden
      opacity 0
      visibility hidden
    &:not(.is-open)
      .status-row__body
        display none
    &.is-open
      .status-row__toggle
        position static
  .status-row:hover,
  .status-row.is-open
    border-color #20cb3b
    box-shadow 0 24px 32px rgba(0, 0, 0, 0.04), 0 16px 24px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.04)
  .status-row__header
    margin-bottom 16px
    padding 0 16px
  .status-row__header-title
    display flex
    align-items flex-start
  .status-row__header-title-icon
    flex-grow 0
    flex-shrink 0
    margin-right 16px
    margin-top 0.3em
  .status-row__header-time
    margin-bottom 8px
  .status-row__header-title-text
    word-break break-all
    strong
      font-weight 700
  .status-row__separator
    margin-top 1em
    margin-bottom 1em
  .status-row__body
    padding 0 16px
  .status-row__reports
    margin 16px 0
    padding-left 16px
    border-left 1px solid #DCDDE0
  .status-row__report
    margin-bottom 16px
  .status-row__report-title
    display flex
    align-items center
    font-weight 600
    margin-bottom 12px
  .status-row__report-title-icon
    margin-right 8px
    margin-top 0.2em
  .status-row__report-result
    display flex
    margin-bottom 8px
    & > :first-child
      color #88939D
      min-width 120px
  .status-row__footer
    text-align right
    padding 0 16px
  .status-row__toggle
    background none
    border none
    font-weight 700
    font-size 12px
    line-height 24px
    color rgba(149, 159, 167, 0.9)
    mix-blend-mode normal
    position absolute
    bottom 16px
    right 16px
    text-transform uppercase
    
    
@media (max-width: 1199px)
  .status-row__header
    display block

@media (min-width: 1200px)
  .status-row
    padding-bottom 0
  .status-row__header
    display flex
    padding-right 24px
  .status-row__footer
    display none
  .status-row__header-title
    width calc(76% + 12px)
    flex-shrink 0
  .status-row__header-time
    margin-bottom 0
  .status-row__header-time-label,
  .status-row__header .status-row__separator
    display none
  .status-row__header-status
    margin-left auto
  .status-row__body
    padding 0
    border-top 1px solid #EAECEF
    display flex
    align-items stretch
  .status-row__body-title
    font-size 20px
    padding 24px
    border-right 1px solid #EAECEF
    width 18%
    flex-grow 0
    flex-shrink 0
  .status-row__reports
    border-left none
    width 82%
    padding 0
    margin-top 24px
    margin-bottom 0
  .status-row__report
    display flex
    margin-bottom 24px
  .status-row__report-status
    margin-left auto
    padding-right 24px
    box-sizing border-box
    flex-basis 28.5%
    justify-content flex-end
  .status-row__report-results
    margin-left auto
    box-sizing border-box
    flex-basis 41.5%
    justify-content flex-end
    display flex
  .status-row__report-title
    padding-left 16px
    box-sizing border-box
    margin-bottom 0
    flex-basis 30%
  .status-row__report-result
    margin-bottom 0
    white-space nowrap
    flex-grow 1
    flex-shrink 1
    justify-content flex-end
    & > :first-child
      min-width 0
      padding-right 5px
    & > :last-child
      max-width 60px
      width 30%
      text-align right
</style>
