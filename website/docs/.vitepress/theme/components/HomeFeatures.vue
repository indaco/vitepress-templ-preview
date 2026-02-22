<script setup lang="ts">
const features = [
  {
    title: 'Auto Templ Generation',
    details:
      'Automatically generate HTML snippets from templ files to keep your Go code and documentation in sync without manual steps.',
    icon: 'cog',
  },
  {
    title: 'Live Preview',
    details:
      'Instantly preview templ components in VitePress with up-to-date documentation.',
    icon: 'eye',
  },
  {
    title: 'Streamlined Workflow',
    details:
      'Integrates templ and VitePress for efficient component development and documentation.',
    icon: 'arrows-cycle',
  },
];
</script>

<template>
  <div class="home-features">
    <div class="container">
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-accent" aria-hidden="true"></div>
          <div class="feature-body">
          <div class="feature-icon">
            <!-- Cog / Gear -->
            <svg
              v-if="feature.icon === 'cog'"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <!-- Eye -->
            <svg
              v-if="feature.icon === 'eye'"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <!-- Arrows cycle -->
            <svg
              v-if="feature.icon === 'arrows-cycle'"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 2.1l4 4-4 4" />
              <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8" />
              <path d="M7 21.9l-4-4 4-4" />
              <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
            </svg>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-details">{{ feature.details }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-features {
  padding: 0 24px;
  margin-top: -24px;
}

.container {
  max-width: 1152px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

.feature-card {
  display: flex;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.feature-card:hover {
  border-color: rgba(255, 221, 53, 0.4);
  box-shadow: 0 0 16px rgba(255, 221, 53, 0.08);
}

.feature-accent {
  flex-shrink: 0;
  width: 4px;
  background: linear-gradient(to bottom, #BD34FE, #41D1FF, #FFDD35);
}

.feature-body {
  padding: 24px;
  min-width: 0;
}

.feature-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #BD34FE, #41D1FF, #FFDD35);
  color: var(--vp-c-brand-1);
  margin-bottom: 16px;
}

.feature-icon::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
}

.feature-icon :deep(svg) {
  position: relative;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin-bottom: 8px;
}

.feature-details {
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: var(--vp-c-text-2);
}
</style>
