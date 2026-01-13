<template>
  <div class="vp-features">
    <div class="vp-feature-item" v-for="feature in features" :key="feature.title">
      <component :is="feature.link ? 'a' : 'div'" 
                 :href="feature.link" 
                 class="feature-box">
        <h2 class="vp-feature-title">
          <span class="vp-feature-icon" v-if="feature.icon">{{ feature.icon }}</span>
          {{ feature.title }}
        </h2>
        <p class="vp-feature-details">{{ feature.details }}</p>
      </component>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectFeatures',
  props: {
    features: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.vp-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.2rem;
  margin: 2rem 0;
}

.vp-feature-item {
  display: flex;
}

.feature-box {
  flex: 1;
  display: block;
  padding: 1.5rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background-color: var(--c-bg);
  transition: all 0.25s;
  text-decoration: none;
}

a.feature-box:hover {
  border-color: var(--c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(42, 34, 94, 0.894);
}

.vp-feature-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  padding: 0;
  color: var(--c-text);
}

.vp-feature-icon {
  margin-right: 0.5rem;
}

.vp-feature-details {
  margin: 0;
  font-size: 0.95rem;
  color: var(--c-text-light);
  line-height: 1.7;
}

@media (max-width: 768px) {
  .vp-features {
    grid-template-columns: 1fr;
  }
}

/* Dark Mode Unterstützung */
html.dark .feature-box {
  background-color: var(--c-bg-lighter);
  border-color: var(--c-border-dark);
}

html.dark a.feature-box:hover {
  border-color: var(--c-brand);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
</style>
