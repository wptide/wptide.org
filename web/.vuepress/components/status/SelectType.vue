<template>
  <div
    class="select-type"
    :class="{ 'is-open': isOpen }"
  >
    <button
      class="select-type__trigger"
      @click="isOpen = !isOpen"
      type="button"
    >
      <svg
        class="select-type__trigger-icon"
        width="18"
        height="12"
        viewBox="0 0 18 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 12H11V10H7V12ZM0 0V2H18V0H0ZM3 7H15V5H3V7Z" />
      </svg>
      <span class="select-type__trigger-value">
        {{ status }}: {{ splitType }}
      </span>
      <svg
        class="select-type__trigger-chevron"
        width="14"
        height="7"
        viewBox="0 0 14 7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L6.96463 6L12 2"
          stroke="#2C3E50"
          stroke-width="1.5"
          stroke-linecap="square"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <form class="select-type__body">
      <div
        class="select-type__fieldset"
        role="group"
      >
        <div class="select-type__fieldset-legend">
          Status
        </div>
        <label class="select-type__value">
          <input
            class="select-type__value-radio"
            type="radio"
            value="Any"
            v-model="status"
          > Any
        </label>
        <label class="select-type__value">
          <input
            class="select-type__value-radio"
            type="radio"
            value="Pending"
            v-model="status"
          > Pending
        </label>
        <label class="select-type__value">
          <input
            class="select-type__value-radio"
            type="radio"
            value="In-Progress"
            v-model="status"
          > In-Progress
        </label>
        <label class="select-type__value">
          <input
            class="select-type__value-radio"
            type="radio"
            value="Complete"
            v-model="status"
          > Complete
        </label>
        <label class="select-type__value">
          <input
            class="select-type__value-radio"
            type="radio"
            value="Failed"
            v-model="status"
          > Failed
        </label>
      </div>
      <div
        class="select-type__fieldset"
        role="group"
      >
        <div class="select-type__fieldset-legend">
          Type
        </div>
        <label class="select-type__value">
          <input
            class="select-type__value-checkbox"
            type="checkbox"
            value="Plugin"
            v-model="type"
          > Plugin
        </label>
        <label class="select-type__value">
          <input
            class="select-type__value-checkbox"
            type="checkbox"
            value="Theme"
            v-model="type"
          > Theme
        </label>
      </div>
    </form>
  </div>
</template>

<script>
export default {
    name: 'SelectType',
    data: () => ({
        isOpen: false,
        status: 'Any',
        type: ['Plugin', 'Theme'],
    }),
    mounted() {
        window.addEventListener('click', (e) => {
            if (!this.$el.contains(e.target)) {
                this.isOpen = false;
            }
        });
    },
    computed: {
        splitType() {
            return this.type.length ? this.type.join(' or ') : 'Plugin or Theme';
        },
    },
    watch: {
        status() {
            this.$emit('update:status', this.status.toLowerCase());
        },
        type() {
            const type = this.type.length ? this.type : ['Plugin', 'Theme'];
            this.$emit('update:type', type.map((item) => item.toLowerCase()));
        },
    },
};
</script>

<style scoped lang="stylus">
.select-type
  display: block;
  position relative
  border 1px solid #dcdde0
  border-radius 4px
  background-color #fff
  min-width 300px

  &.is-open
    z-index 1
    border-bottom 0
    border-bottom-left-radius 0
    border-bottom-right-radius 0
    .select-type__trigger-icon
      fill $accentColor
    .select-type__body
      display block
  svg
    transition fill 0.4s ease
.select-type__trigger
  width: 100%;
  display flex
  align-items center
  min-height 40px
  padding 5px 17px 5px 11px
  font-family inherit
  font-size 16px
  color inherit
  background transparent
  border none
.select-type__trigger-icon
  margin-right 11px
  flex-shrink 0
  fill #2C3E50
.select-type__trigger-value
  margin-right 16px
.select-type__trigger-chevron
  margin-left auto
  flex-shrink 0
.select-type__body
  display none
  position absolute
  top 100%
  left -1px
  right -1px
  border 1px solid #dcdde0
  border-bottom-left-radius 4px
  border-bottom-right-radius 4px
  background-color #fff
  padding-top 16px
.select-type__fieldset
  padding 0 16px
  margin-bottom 24px
.select-type__fieldset-legend
  text-transform uppercase
  font-weight bold
  font-size 12px
  letter-spacing 2px
  color #959FA7
.select-type__value
  display flex
  align-items center
  margin-top 8px
.select-type__value-radio, .select-type__value-checkbox
  flex-shrink 0
  flex-grow 0
  width 24px
  height 24px
  transition border-color 0.4s ease, background-color 0.4s ease
  border 1px solid rgba(44, 62, 80, 0.35)
  margin 0 8px 0 0
  appearance none
  &:checked
    background-color $accentColor
.select-type__value-radio
  border-radius 50%
  box-shadow inset 0 0 0 0.375em #fff
.select-type__value-checkbox
  border-radius 4px
  background: url("data:image/svg+xml,%3Csvg width='13' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2L5.075 8 2 4.954' stroke='%23fff' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center center;
</style>
