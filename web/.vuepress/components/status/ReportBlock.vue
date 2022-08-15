<!-- eslint-disable max-len -->
<template>
  <div class="status-row__report">
    <div class="status-row__report-title">
      <StatusBlock :status="status" />
      <code>{{ type }}</code>
    </div>
    <div class="status-row__report-results">
      <div class="status-row__report-result">
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
      <div class="status-row__report-result">
        <svg
          viewBox="0 0 24 24"
          version="1.1"
          height="16"
          width="16"
          aria-hidden="true"
        >
          <title>Audit attempts</title>
          <path d="M12.25,2A9.81,9.81,0,0,0,4.77,5.46L3.41,4.25a1,1,0,0,0-1.07-.16A1,1,0,0,0,1.75,5V9a1,1,0,0,0,1,1h4.5a1,1,0,0,0,.93-.64,1,1,0,0,0-.27-1.11L6.26,6.78a7.86,7.86,0,0,1,6-2.78A8,8,0,1,1,4.72,14.67a1,1,0,0,0-1.89.66A10,10,0,1,0,12.25,2Z" />
          <path d="M16,16a1,1,0,0,1-.6-.2l-4-3A1,1,0,0,1,11,12V8a1,1,0,0,1,2,0v3.5l3.6,2.7a1,1,0,0,1,.2,1.4A1,1,0,0,1,16,16Z" />
        </svg>
        {{ attempts }}
      </div>
    </div>
    <hr class="status-row__separator">
  </div>
</template>

<!-- eslint-disable max-len -->
<script>
import processTime from '../../util/processTime';
import StatusBlock from './StatusBlock.vue';

export default {
    name: 'ReportBlock',
    components: {
        StatusBlock,
    },
    props: {
        type: {
            type: String,
            required: true,
            default: '',
        },
        status: {
            type: String,
            required: true,
            default: 'unknown',
        },
        attempts: {
            type: Number,
            required: true,
            default: 0,
        },
        start_datetime: {
            type: Number,
            required: false,
            default: 0,
        },
        end_datetime: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    data: () => ({
        intervalTime: null,
        time: 'pending',
    }),
    mounted() {
        this.intervalTime = setInterval(() => {
            this.updateTime();
        }, 1000);

        this.updateTime();
    },
    updated() {
        this.updateTime();
    },
    destroyed() {
        clearInterval(this.intervalTime);
    },
    methods: {
        updateTime() {
            if (!this.start_datetime) {
                return;
            }
            const datetime = [];
            datetime.push(this.start_datetime);
            if (this.status === 'in-progress') {
                datetime.push(Math.floor(Date.now() / 1000));
            } else if (this.end_datetime) {
                datetime.push(this.end_datetime);
            }

            const time = processTime(Math.floor(Math.abs(Math.max(...datetime) - Math.min(...datetime))));
            this.time = time || 'now';
        },
    },
};
</script>

<style scoped lang="stylus">
.status-row__report
  margin-bottom 1rem

.status-row__report-title
  font-weight 600
  margin-bottom 1rem
  display flex
  align-items flex-start

.status-row__report-title .status-row__status
  margin-top 0.4em

.status-row__report-result
  margin-bottom 8px

@media (min-width: 1200px)
  .status-row__report
    display flex
    margin-bottom 24px

  .status-row__report-status
    margin-left auto
    padding-right 24px
    box-sizing border-box

  .status-row__report-results
    margin-left auto
    box-sizing border-box
    width calc(10.875rem)

  .status-row__report-title
    padding-left 16px
    box-sizing border-box
    margin-bottom 0
    display flex
    align-items flex-start
    flex-grow 1
    flex-shrink 0

  .status-row__report-result
    margin-bottom 0.5rem
    margin-right 1rem
    font-size 0.875rem
    line-height 1.925

    svg
      position relative
      top 2px
</style>
