import colors from 'vuetify/es5/util/colors'
import dotenv from 'dotenv'

import type { NuxtConfig } from '@nuxt/types'

dotenv.config()
process.env.title = 'Pointland'

const config: NuxtConfig = {
  srcDir: 'src/',
  ssr: false,
  vue: { config: { productionTip: false, devtools: process.env.NODE_ENV === 'production' } },
  target: 'static',
  sitemap: {
    hostname: 'https://point.seongland.com',
  },
  env: { title: process.env.title },
  head: {
    title: process.env.title,
    script: [
      {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        defer: true,
        ['data-cf-beacon']: '{"token": "8f27ea7e450344a5a9340d4cc3b3f1dd"}',
      },
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      {
        hid: 'keywords',
        name: 'keywords',
        content: 'seongland, pointland, 3d, seonglae, metaverse, webtaverse, pointcloud, threejs, potree',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: 'apple-touch-icon.png' },
    ],
  },
  plugins: [
    { src: '~/plugins/init/', ssr: false },
    { src: '~/plugins/init/config', ssr: false },
  ],
  loading: { color: '#424242' },
  server: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
  },
  components: true,
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify', '@nuxtjs/composition-api/module'],
  modules: ['@nuxtjs/axios', '@nuxtjs/pwa', ['nuxt-vuex-localstorage', { localStorage: ['ls'] }], '@nuxtjs/sitemap'],

  // pwa
  pwa: { manifest: { lang: 'en', autoRegister: false } },

  // Theme
  vuetify: {
    defaultAssets: { icons: 'fa' },
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build
  build: {
    devMiddleware: {
      headers: {
        'Cache-Control': 'no-store',
        Vary: '*',
      },
    },
    extractCSS: true,
    optimizeCSS: true,
    splitChunks: {
      commons: true,
      pages: true,
      layouts: true,
    },
    transpile: ['layerspace'],
  },
}

export default config
