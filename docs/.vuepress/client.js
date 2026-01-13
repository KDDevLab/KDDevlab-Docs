import { defineClientConfig } from 'vuepress/client'
import ProjectFeatures from './components/ProjectFeatures.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('ProjectFeatures', ProjectFeatures)
  }
})
