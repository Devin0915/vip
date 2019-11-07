<template>
  <div class="dashboard-container">
    <div class="dashboard-text">用户名: {{ operator }}</div>
    <div class="dashboard-text">品牌: <span v-for="role in roles" :key="role">{{ role }}</span></div>
    <!-- <div class="dashboard-text">store_id: {{ store_id }} </div> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'operator',
      'roles',
      'store_id'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 20px;
    line-height: 46px;
  }
}
</style>
