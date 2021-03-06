import Vue from 'vue'

export default ({ $axios }) => {
  if (process.client) {
    const origin = window.location.origin
    $axios.defaults.baseURL = origin
  }

  Vue.mixin({
    data: () => ({
      title: process.env.title,
      meta: { version: undefined },
      spaceOpt: {
        id: 'pointland',
        layers: { point: [] },
        box: 'skybox',
        position: [10, 130, 50],
      },
    }),
  })
}
