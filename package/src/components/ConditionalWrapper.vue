<script setup lang="ts">
interface Props {
  isPreviewFirst: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div>
    <template v-if="props.isPreviewFirst">
      <slot name="preview"></slot>
      <slot name="code"></slot>
    </template>
    <template v-else>
      <slot name="code"></slot>
      <slot name="preview"></slot>
    </template>
  </div>
</template>
