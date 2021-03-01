<template>
  <div class="status-table">
    <StatusSelect class="status-table__select" />
    <div class="status-table__header">
      <div class="status-table__header-label">
        Project
      </div>
      <div class="status-table__header-label status-table__header-label--process-time">
        Process time
      </div>
    </div>
    <div class="status-table__rows">
      <StatusRow />
      <StatusRow />
      <StatusRow />
      <StatusRow />
      <StatusRow />
      <StatusRow />
    </div>
  </div>
</template>

<script>
import StatusSelect from './status/StatusSelect';
import StatusRow from './status/StatusRow';
export default {
  components: { StatusSelect, StatusRow },
  mounted () {
    console.log('loaded');
  }
}
</script>

<style>
.status-table {
  position: relative;
  margin-top: 24px;
}

.status-table__header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  margin-top: 40px;
}

.status-table__header-label {
  font-weight: 600;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 120px;
}

.status-table__header-label:first-child {
  width: 76%;
}

.status-table__header-label:last-child {
  width: 24%;
}

.status-table__select.status-table__select {
  margin-bottom: 24px;
}

@media (min-width: 1024px) {
  .status-table__select.status-table__select {
    position: absolute;
    right: 0;
    top: -120px;
  }
}

@media (min-width: 1200px) {
  .status-table__select.status-table__select {
    top: -136px;
  }
}

@media (max-width: 1199px) {
  .status-table__header {
    display: none;
  }
}
</style>
