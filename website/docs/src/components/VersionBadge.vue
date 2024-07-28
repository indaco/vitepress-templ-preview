<!-- src/components/VersionDisplay.vue -->
<template>
  <p>
    <Badge type="tip">v{{ version }}</Badge>
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      version: __APP_VERSION__,
    };
  },
});
</script>
