<template>
  <div class="row" v-bind:class="{ 'is-open': isOpen }" v-on:click="isOpen = !isOpen">
    <div class="row__header">
      <div class="row__header-title">
        <img class="row__header-title-icon" src="/assets/img/icon-wordpress.svg" alt="" width="16" height="16">
        <span class="row__header-title-text">/api/v1/audit/wporg/theme/<strong>twentytwenty/1.6</strong></span>
      </div>
      <hr class="row__separator">
      <div class="row__header-time">
        <span class="row__header-time-label">Process time:&nbsp;</span>15s
      </div>
      <strong class="row__header-status row__status">
        Completed
        <svg class="row__status-icon row__status-icon--completed" width="24" height="24" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z" fill="currentColor"></path></svg>
      </strong>
    </div>
    <div class="row__body">
      <hr class="row__separator">
      <strong class="row__body-title">Reports</strong>
      <div class="row__reports">
        <div class="row__report">
          <div class="row__report-title">
            <img class="row__report-title-icon" src="/assets/img/icon-php-code-sniffer.svg" alt="" width="24" height="24">
            PHP CodeSniffer
          </div>
          <div class="row__report-results">
            <div class="row__report-result">
              <div>Attempts:</div><div>3</div>
            </div>
            <div class="row__report-result">
              <div>Process time:</div><div>13s</div>
            </div>
          </div>
          <strong class="row__report-status row__status">
            Completed
            <svg class="row__status-icon row__status-icon--completed" width="24" height="24" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z" fill="currentColor"></path></svg>
          </strong>
        </div>
        <div class="row__report">
          <div class="row__report-title">
            <img class="row__report-title-icon" src="/assets/img/icon-lighthouse.svg" alt="" width="24" height="24">
            Lighthouse
          </div>
          <div class="row__report-results">
            <div class="row__report-result">
              <div>Attempts:</div><div>3</div>
            </div>
            <div class="row__report-result">
              <div>Process time:</div><div>13s</div>
            </div>
          </div>
          <strong class="row__report-status row__status">
            Completed
            <svg class="row__status-icon row__status-icon--completed" width="24" height="24" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z" fill="currentColor"></path></svg>
          </strong>
        </div>
      </div>
    </div>
    <div class="row__footer">
      <button class="row__toggle" type="button">
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
export default {
  name: 'StatusRow',
  data: () => ( { isOpen: false } )
};
</script>

<style scoped lang="stylus">
.row
  border 1px solid #eaecef
  box-sizing border-box
  box-shadow 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)
  border-radius 4px
  transition border-color 0.4s ease, box-shadow 0.4s ease
  padding 16px 0
  position relative
  margin-bottom 16px

.row:hover
  border-color darken(#eaecef, 25)
  cursor pointer

.row.is-open
  border-color #20cb3b
  cursor pointer
  box-shadow 0 24px 32px rgba(0, 0, 0, 0.04), 0 16px 24px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.04)

.row__header
  margin-bottom 16px
  padding 0 16px

.row__header-title
  display flex
  align-items flex-start

.row__header-title-icon
  flex-grow 0
  flex-shrink 0
  margin-right 16px
  margin-top 0.3em

.row__header-time
  margin-bottom 8px

.row__header-title-text
  word-break break-all

.row__header-title-text strong
  font-weight 700

.row__separator
  margin-top 1em
  margin-bottom 1em

.row__status
  display flex
  align-items center
  font-weight 700

.row__status-icon
  margin-left 2px

.row__status-icon--completed
  color #20CB3B

.row__body
  padding 0 16px

.row:not(.is-open) .row__body
  display none

.row__reports
  margin 16px 0
  padding-left 16px
  border-left 1px solid #DCDDE0

.row__report
  margin-bottom 16px

.row__report-title
  display flex
  align-items center
  font-weight 600
  margin-bottom 12px

.row__report-title-icon
  margin-right 8px
  margin-top 0.2em

.row__report-result
  display flex
  margin-bottom 8px

.row__report-result > :first-child
  color #88939D
  min-width 120px

.row__footer
  text-align right
  padding 0 16px

.row__toggle
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

.row.is-open .row__toggle
  position static

@media (max-width: 1199px)
  .row__header
    display block

@media (min-width: 1200px)
  .row
    padding-bottom 0

  .row__header
    display flex
    padding-right 24px

  .row__footer
    display none

  .row__header-title
    width calc(76% + 12px)
    flex-shrink 0

  .row__header-time
    margin-bottom 0

  .row__header-time-label,
  .row__header .row__separator
    display none

  .row__header-status
    margin-left auto

  .row__body
    padding 0
    border-top 1px solid #EAECEF
    display flex
    align-items stretch

  .row__body-title
    font-size 20px
    padding 24px
    border-right 1px solid #EAECEF
    width 18%
    flex-grow 0
    flex-shrink 0

  .row__reports
    border-left none
    width 82%
    padding 0
    margin-top 24px
    margin-bottom 0

  .row__report
    display flex
    margin-bottom 24px

  .row__report-status
    margin-left auto
    padding-right 24px
    box-sizing border-box
    flex-basis 28.5%
    justify-content flex-end

  .row__report-results
    margin-left auto
    box-sizing border-box
    flex-basis 41.5%
    justify-content flex-end

  .row__report-title
    padding-left 16px
    box-sizing border-box
    margin-bottom 0
    flex-basis 30%

  .row__report-result
    margin-bottom 0
    white-space nowrap
    flex-grow 1
    flex-shrink 1
    justify-content flex-end

  .row__report-result > :first-child
    min-width 0
    padding-right 5px

  .row__report-result > :last-child
    max-width 60px
    width 30%
    text-align right

  .row__report-results
    display flex
    justify-content flex-end
</style>
