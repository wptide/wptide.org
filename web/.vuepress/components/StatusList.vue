<template>
  <div class="status-list">
    <SelectType
      class="status-list__select-type"
      :status.sync="status"
      :type.sync="type"
    />
    <ul class="status-list__projects">
      <li
        :key="project.key"
        v-for="project in projects"
      >
        <ProjectBlock v-bind="project.data" />
      </li>
      <li
        class="custom-block tip status-list__projects--none"
        v-if="!projects.length"
      >
        <p>Sorry, no audits could be found.</p>
      </li>
    </ul>
  </div>
</template>

<script>
import ProjectBlock from './status/ProjectBlock.vue';
import SelectType from './status/SelectType.vue';

export default {
    name: 'StatusList',
    components: {
        SelectType,
        ProjectBlock,
    },
    data: () => ({
        projects: [],
        interval: null,
        db: null,
        status: 'any',
        type: ['plugin', 'theme'],
    }),
    destroyed() {
        clearInterval(this.interval);
    },
    mounted() {
        window.addEventListener('load', () => {
            this.load();
        });

        setTimeout(() => {
            this.load();
        }, 1000);
    },
    methods: {
        load() {
            this.db = window.firebase.firestore();
            this.update();
        },
        update() {
            const that = this;
            let collectionRef;

            if (this.status !== 'any') {
                collectionRef = this.db.collection('Status')
                    .where('status', '==', this.status)
                    .where('type', 'in', this.type)
                    .orderBy('created_datetime', 'desc')
                    .limit(50);
            } else {
                collectionRef = this.db.collection('Status')
                    .where('type', 'in', this.type)
                    .orderBy('created_datetime', 'desc')
                    .limit(50);
            }

            collectionRef
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
    watch: {
        status() {
            this.update();
        },
        type() {
            this.update();
        },
    },
};
</script>

<style lang="stylus">
.status-list
  position relative
  padding-top 2rem

.status-list .status-list__select-type
  margin-bottom 2rem

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
  .status-list .status-list__select-type
    position absolute
    right 0
    top -10.675rem
@media (min-width: 1084px)
  .status-list .status-list__select-type
    top -9rem
</style>
