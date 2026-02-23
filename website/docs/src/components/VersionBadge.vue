<template>
  <p>
    <VPBadge type="tip" :text="`v${version}`" />
  </p>
</template>

<script lang="ts">
import { VPBadge } from 'vitepress/theme';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VersionBadge',
  components: { VPBadge },
  data() {
    return {
      version: __APP_VERSION__,
    };
  },
});
</script>
