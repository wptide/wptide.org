<template>
  <div class="status-list">
    <ul class="status-list__projects">
      <li
        :key="project.key"
        v-for="project in projects"
      >
        <Project v-bind="project.data" />
      </li>
      <li
        class="custom-block tip status-list__projects--none"
        v-if="!projects.length"
      >
        <p>Sorry, no audits could found.</p>
      </li>
    </ul>
  </div>
</template>

<script>
import Project from './status/Project.vue';

export default {
    name: 'StatusList',
    components: {
        Project,
    },
    data: () => ({
        projects: [],
        interval: null,
        db: null,
    }),
    destroyed() {
        clearInterval(this.interval);
    },
    mounted() {
        window.addEventListener('load', () => {
            this.db = window.firebase.firestore();
            this.update();
        });
    },
    methods: {
        update() {
            const that = this;
            that.db
                .collection('Status')
                .orderBy('created_datetime', 'desc')
                .limit(50)
                .onSnapshot((snap) => {
                    const testCollection = [];
                    snap.forEach((doc) => {
                        testCollection.push({
                            key: doc.id,
                            data: doc.data(),
                        });
                    });
                    that.projects = testCollection;
                });
        },
    },
};
</script>

<style lang="stylus">
.status-list
  position relative
  padding-top 2rem

.status-list__select.status-list__select
  margin-bottom 0.75rem

.status-list__projects
  padding 0
  margin 0 0 2rem 0
  list-style none

.status-list__projects--none
  padding 2rem

.status-list__projects--none
  animation fadeIn ease 1.5s

@keyframes fadeIn
  0%
    opacity 0
  66%
    opacity 0
  100%
    opacity 1

@media (min-width: 1024px)
  .status-list__select.status-list__select
    position absolute
    right 0
    top -7rem
</style>
