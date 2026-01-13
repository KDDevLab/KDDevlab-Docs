import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { getDirname, path } from 'vuepress/utils'

const __dirname = getDirname(import.meta.url)

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

  // Client Config für globale Komponenten
  clientConfigFile: path.resolve(__dirname, './client.js'),
  
  // Theme und Design
  theme: defaultTheme({
    // Navigation oben
    navbar: [
      { text: 'Home', link: '/' }
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