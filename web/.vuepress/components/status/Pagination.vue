<template>
  <nav class="status-pagination">
    <button
      class="status-pagination__button"
      type="button"
      v-if="page > 1"
    >
      ←
    </button>
    <button
      class="status-pagination__button"
      :class="{ 'is-active': num === page }"
      type="button"
      v-for="num in pages"
      :key="num"
    >
      {{ num }}
    </button>
    <button
      class="status-pagination__button"
      type="button"
      v-if="page < pages"
    >
      →
    </button>
  </nav>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        page: {
            type: Number,
            required: true,
            default: 1,
        },
        pages: {
            type: Number,
            required: true,
            default: 1,
        },
    },
};
</script>

<!-- eslint-disable max-len -->
<style scoped lang="stylus">
  .status-pagination
    display flex
    flex-wrap wrap

  .status-pagination__button
    font-weight 700
    border 1px solid transparent
    box-sizing border-box
    display flex
    align-items center
    justify-content center
    padding 4px
    border-radius 4px
    transition color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease
    min-height 40px
    min-width 40px
    background transparent
    margin-right 8px
    margin-bottom 8px
    cursor pointer

  .status-pagination__button:hover,
  .status-pagination__button.is-active
    color #1626FF
    border-color currentColor
    box-shadow 0 4px 8px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)
</style>
