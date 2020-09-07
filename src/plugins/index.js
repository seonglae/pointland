import Vue from 'vue'
import { olInit } from '~/plugins/map/meta'
import { drawXYs, drawXY } from "./map/draw"
import { changeLayers } from "./map/layer"

export default ({ store, $axios }) => {
  Vue.mixin({
    data: () => {
      return {
        map: undefined
      }
    },
    methods: {
      drawXYs: (data, id) => drawXYs(data, id),
      drawXY: (data, focus, id) => drawXY(data, focus, id),
      changeProject: (prj, projects, socket) => {
        for (const project of projects)
          if (project.name === prj) {
            store.commit('localStorage/setPrj', { id: project.id, prj: project.name, socket })
            changeLayers(project.geoserver, project.workspace, project.layers)
            socket.emit('getState', store.state.localStorage.prjId)
          }
      },

      olInit(geoserver, workspace, layers) {
        this.map = olInit(geoserver, workspace, layers)
        return this.map
      }
    }
  })
  if (process.client) {
    const origin = window.location.origin
    $axios.defaults.baseURL = origin
  }
}
