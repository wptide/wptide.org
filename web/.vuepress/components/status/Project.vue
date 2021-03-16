<!-- eslint-disable max-len -->
<template>
  <div
    class="status-row"
    :class="{ 'is-open': isOpen }"
    @click.stop="isOpen = !isOpen"
  >
    <div class="status-row__header">
      <div class="status-row__header-title">
        <Status :status="status" />
        <div class="status-row__header-title-text">
          <span>/api/v1/audit/wporg/{{ type }}/<strong>{{ slug }}/{{ version }}</strong> <a
            :href="audit"
            title="Link to audit"
          >#</a> </span>
          <span>{{ source_url }}</span>
        </div>
      </div>
      <hr class="status-row__separator">
      <div class="status-row__header-info">
        <div class="status-row__header-time">
          <svg
            viewBox="0 0 16 16"
            version="1.1"
            height="16"
            width="16"
            aria-hidden="true"
          >
            <title>Time spent processing</title>
            <path
              fill-rule="evenodd"
              d="M5.75.75A.75.75 0 016.5 0h3a.75.75 0 010 1.5h-.75v1l-.001.041a6.718 6.718 0 013.464 1.435l.007-.006.75-.75a.75.75 0 111.06 1.06l-.75.75-.006.007a6.75 6.75 0 11-10.548 0L2.72 5.03l-.75-.75a.75.75 0 011.06-1.06l.75.75.007.006A6.718 6.718 0 017.25 2.541a.756.756 0 010-.041v-1H6.5a.75.75 0 01-.75-.75zM8 14.5A5.25 5.25 0 108 4a5.25 5.25 0 000 10.5zm.389-6.7l1.33-1.33a.75.75 0 111.061 1.06L9.45 8.861A1.502 1.502 0 018 10.75a1.5 1.5 0 11.389-2.95z"
            />
          </svg>
          {{ time }}
        </div>
        <div class="status-row__header-date">
          <svg
            viewBox="0 0 16 16"
            version="1.1"
            height="16"
            width="16"
            aria-hidden="true"
          >
            <title>Time since audit was created</title>
            <path
              fill-rule="evenodd"
              d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zm0 3.5h8.5a.25.25 0 01.25.25V6h-11V3.75a.25.25 0 01.25-.25h2zm-2.25 4v6.75c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7.5h-11z"
            />
          </svg>
          {{ date }}
        </div>
      </div>
    </div>
    <div class="status-row__body">
      <hr class="status-row__separator">
      <strong class="status-row__body-title">Reports</strong>
      <ul class="status-row__reports">
        <li
          v-for="(report, index) in reports"
          :key="index"
        >
          <Report
            v-bind="report"
            :type="index"
            :status_datetime="created_datetime"
          />
        </li>
      </ul>
    </div>
    <div class="status-row__footer">
      <button
        class="status-row__toggle"
        type="button"
      >
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

<!-- eslint-disable max-len -->
<script>
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import processTime from '../../util/processTime';

import Report from './Report.vue';
import Status from './Status.vue';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
export default {
    name: 'Project',
    components: {
        Report,
        Status,
    },
    props: {
        id: {
            type: String,
            required: true,
            default: '',
        },
        type: {
            type: String,
            required: true,
            default: '',
        },
        slug: {
            type: String,
            required: true,
            default: '',
        },
        version: {
            type: String,
            required: true,
            default: '',
        },
        source_url: {
            type: String,
            required: true,
            default: '',
        },
        created_datetime: {
            type: Number,
            required: true,
            default: 0,
        },
        modified_datetime: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            required: true,
            default: 'pending',
        },
        reports: {
            type: Array,
            required: true,
            default: () => [],
        },
    },
    data: () => ({
        isOpen: false,
        intervalDate: null,
        intervalTime: null,
        time: 'pending',
        date: '',
        audit: null,
    }),
    mounted() {
        this.intervalDate = setInterval(() => {
            this.updateTime();
        }, 60000);

        this.intervalTime = setInterval(() => {
            this.updateTime();
        }, 1000);

        this.updateDate();
        this.updateTime();

        this.audit = `/api/v1/audit/wporg/${this.type}/${this.slug}/${this.version}`;
    },
    updated() {
        this.updateTime();
    },
    destroyed() {
        clearInterval(this.intervalDate);
        clearInterval(this.intervalTime);
    },
    methods: {
        updateDate() {
            this.date = timeAgo.format(this.created_datetime * 1000, 'twitter-minute-now');
        },
        updateTime() {
            const datetime = [];

            if (this.status === 'pending') {
                return;
            }
            Object.keys(this.reports).forEach((report) => {
                if (this.reports[report].start_datetime) {
                    datetime.push(this.reports[report].start_datetime);
                }
            });

            if (this.status === 'in-progress') {
                datetime.push(Math.floor(Date.now() / 1000));
            } else {
                datetime.push(this.modified_datetime);
            }

            const time = processTime(Math.floor(Math.abs(Math.max(...datetime) - Math.min(...datetime))));
            this.time = time || 'now';
        },
    },
};
</script>

<!-- eslint-disable max-len -->
<style scoped lang="stylus">
.status-row
    border 1px solid #eaecef
    box-sizing border-box
    box-shadow 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)
    border-radius 4px
    transition border-color 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease, visibility 0.4s ease
    position relative
    margin-bottom 0.75rem
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
    border-color lighten($textColor, 25%)
    box-shadow 0 24px 32px rgba(0, 0, 0, 0.04), 0 16px 24px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.04)

  .status-row__header
    padding 0.875rem

  .is-open .status-row__header
    padding-bottom 0

  .status-row__header-title
    display flex
    align-items flex-start

  .status-row__header-title-icon
    flex-grow 0
    flex-shrink 0
    margin-right 1rem
    margin-top 0.1rem

  .status-row__header-time,
  .status-row__header-date
    margin-bottom 0.5rem
    margin-right 1rem

  .status-row__header-title-text
    word-break break-all

    span
      display block

    strong
      font-weight 700

    & > :last-child
      font-size 0.875em
      padding-top 0.25em
      font-weight 300

  .status-row__separator
    margin-top 1em
    margin-bottom 1em

  .status-row__body
    padding 0 16px

  .status-row__reports
    margin 16px 0
    padding-left 16px
    border-left 1px solid #DCDDE0
    list-style none

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

  .is-open .status-row__header
    padding-bottom 0.875rem

  .status-row__header-status
    margin-left auto

  .status-row__header-title
    flex-grow 1
    flex-shrink 0

  .status-row__header-info
    width calc(10rem)

  .status-row__header-time,
  .status-row__header-date
    margin-bottom 0
    font-size 0.875rem
    line-height 1.925

    svg
      position relative
      top 2px

  .status-row__header .status-row__separator
    display none

  .status-row__footer
    display none

  .status-row__body
    padding 0
    border-top 1px solid #EAECEF
    display flex
    align-items stretch

  .status-row__body-title
    font-size 20px
    padding 24px
    border-right 1px solid #EAECEF
    width 15%
    flex-grow 0
    flex-shrink 0

  .status-row__reports
    border-left none
    width 85%
    padding 0
    margin-top 24px
    margin-bottom 0
</style>
