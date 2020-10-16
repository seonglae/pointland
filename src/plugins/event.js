import Vue from 'vue'
import { ref as mapRef } from '~/plugins/map/init'
import { ref as cloudRef } from './cloud/init'
import { v4 as uuid } from 'uuid'
import { imageClick } from './image/event'

export default ({ store: { commit, state } }) => {
  Vue.mixin({
    methods: {
      setLayer: data => commit('setLayer', data),
      setRound: round => commit('ls/setRound', round),
      checkMount: () => mapRef.map !== undefined && cloudRef.cloud.offset !== undefined,

      async waitAvail(flag, callback, args) {
        flag() ? callback(...args) : setTimeout(() => this.waitAvail(flag, callback, args), 1000)
      },

      setSnap(snapObj) {
        commit('ls/setSnap', snapObj)
        for (const mark of snapObj.marks)
          this.waitAvail(this.checkMount, this.markXYZ, [[mark.x, mark.y, mark.alt], mark.name])
      },

      setMark(markObj) {
        commit('ls/setMark', markObj)
        this.waitAvail(this.checkMount, this.currentXYZ, [[markObj.x, markObj.y, markObj.alt]])
      },

      async imageClick(event) {
        return imageClick(event, this.depth, this.drawFromDepth)
      },

      keyEvent(event) {
        let seqIndex
        const ls = this.$store.state.ls
        const index = this.$store.state.ls.index
        switch (event.key) {
          // change seq
          case ',':
            seqIndex = ls.currentSnap.marks.indexOf(ls.currentMark)
            if (seqIndex > 0) if (!state.depth.loading) this.setMark(ls.currentSnap.marks[seqIndex - 1])
            return
          case '.':
            seqIndex = ls.currentSnap.marks.indexOf(ls.currentMark)
            if (seqIndex < ls.currentSnap.marks.length - 1)
              if (!state.depth.loading) this.setMark(ls.currentSnap.marks[seqIndex + 1])
            return

          // change tabs
          case '1':
            return commit('ls/setIndex', Number(event.key) - 1)
          case '2':
            return commit('ls/setIndex', Number(event.key) - 1)
          case '3':
            return commit('ls/setIndex', Number(event.key) - 1)

          // Toggle
          case 'm':
          case 'M':
            if (index === 0) return
            const mapWrapper = document.getElementById('global-map').parentElement
            if (this.tabs[0].show) mapWrapper.setAttribute('style', 'z-index:-1 !important')
            else mapWrapper.setAttribute('style', 'z-index:5 !important')
            this.tabs[0].show = !this.tabs[0].show
            return

          // UI control
          case ' ':
            if (index !== 2) return
            if (!cloudRef.cloud.offset) return
            const markObj = ls.currentMark
            const controls = cloudRef.cloud.controls
            const offset = cloudRef.cloud.offset
            const camera = cloudRef.cloud.camera
            camera.position.set(markObj.x - offset[0], markObj.y - offset[1], markObj.alt - offset[2] + 20)
            controls.target.set(markObj.x - offset[0], markObj.y - offset[1], markObj.alt - offset[2])
            return

          // Submit
          case 'Enter':
            return commit('startInput')
        }
        console.log(event)
      }
    }
  })
}