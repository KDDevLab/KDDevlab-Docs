import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'

export default defineUserConfig({
  // Bundler (Vite = schnell und modern)
  bundler: viteBundler(),
  
  // Sprache und Meta
  lang: 'de-DE',
  title: 'KDDevlab Docs',
  description: 'Zentrale Dokumentation für KDDevlab',
  
  // KRITISCH für GitHub Pages!
  // Muss EXAKT dein Repo-Name sein
  base: '/KDDevlab-Docs/',
  
  // Theme und Design
  theme: defaultTheme({
    // Navigation oben
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'GitHub', link: 'https://github.com/KDDevlab' }
    ],
    
    // Sidebar Navigation
    sidebar: [
      {
        text: 'Einführung',
        children: ['/']
      }
    ],
    
    // GitHub Integration
    repo: 'KDDevlab/KDDevlab-Docs',
    editLink: true,
    editLinkText: 'Auf GitHub bearbeiten',
    lastUpdated: true,
    lastUpdatedText: 'Zuletzt aktualisiert'
  })
})