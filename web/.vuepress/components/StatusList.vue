<template>
  <div class="status-list">
    <StatusType
      class="status-list__select"
      :status.sync="status"
      :type.sync="type"
    />
    <ul class="status-list__projects">
      <li
        :key="project.key"
        v-for="project in projects"
      >
        <StatusRow v-bind="project.data" />
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
import StatusRow from './StatusRow.vue';
import StatusType from './StatusType.vue';

export default {
    name: 'StatusList',
    components: {
        StatusRow,
        StatusType,
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

.status-list .status-list__select
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
  .status-list .status-list__select
    position absolute
    right 0
    top -10.675rem
@media (min-width: 1084px)
  .status-list .status-list__select
    top -9rem
</style>
