/*
 * @summary - vue draw plugin
 */

import Vue from 'vue'
import { ref as mapRef } from '~/plugins/map/init'
import { ref as imgRef } from '~/plugins/image/init'
import { ref as cloudRef } from './cloud/init'

import { GeoJSON } from 'ol/format'
import { drawXY, removeFeature } from './map/draw'
import { drawLas, drawXYZ, removePoint, drawLine, drawLoop } from './cloud/draw'
import { resetPointLayer, removeLineLoops } from './cloud/event'
import { drawNear, erase, updateImg } from './image/draw'
import { xyto84 } from '~/server/api/addon/tool/coor'
import { transform } from 'ol/proj'
import jimp from 'jimp/browser/lib/jimp'

const POINT_ID = 'Point'

export default ({ $axios, store: { commit, state } }) => {
  Vue.mixin({
    methods: {
      drawLas: (lasJson, name) => drawLas(lasJson, name),

      removeVector(layerName, id) {
        /*
         * @summary - Rmove One Vector from All layer by id
         */
        const mapLayer = mapRef[layerName]
        const cloudLayer = cloudRef[layerName]
        const imgLayer = imgRef[layerName]
        if (!mapLayer || !cloudLayer) return
        removeFeature(mapLayer, id)
        removePoint(cloudLayer, id)
        erase(imgLayer, id)
      },

      selectXYZ(xyz, id) {
        /*
         * @summary - Draw Selected Facility
         */
        const lnglat = xyto84(xyz[0], xyz[1])
        const latlng = lnglat.reverse()
        drawXY(mapRef.selectedLayer, latlng, false, id)

        const transform = cloudRef.cloud.transform
        transform.position.x = xyz[0] - cloudRef.cloud.offset[0]
        transform.position.y = xyz[1] - cloudRef.cloud.offset[1]
        transform.position.z = xyz[2] - cloudRef.cloud.offset[2]
        const pos = transform.position

        const divider = Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(pos.z)
        let factor = 3 / divider
        if (factor > 0.2) factor = 0.2
        transform.setSize(factor)

        transform.attach(cloudRef.selectedLayer)
        transform.visible = state.visible.transform
        transform.enabled = state.visible.transform

        const object = cloudRef.selectedLayer
        object.updateMatrix()
        object.geometry.applyMatrix4(object.matrix)
        object.position.set(0, 0, 0)
        object.updateMatrix()

        drawXYZ(cloudRef.selectedLayer, xyz, false, id)
      },

      markXYZ(xyz, id) {
        /*
         * @summary - Draw Mark
         */
        const lnglat = xyto84(xyz[0], xyz[1])
        const latlng = lnglat.reverse()
        drawXY(mapRef.markLayer, latlng, false, id)
        drawXYZ(cloudRef.markLayer, xyz, false, id)
      },

      currentXYZ(xyz) {
        /*
         * @summary - Draw Current Mark
         */
        resetPointLayer(cloudRef.currentLayer)
        const lnglat = xyto84(xyz[0], xyz[1])
        const latlng = lnglat.reverse()
        drawXY(mapRef.currentLayer, latlng, true, 'current')
        drawXYZ(cloudRef.currentLayer, xyz, true, 'current')
      },

      drawXYZPoint(xyz, id, layer) {
        const lnglat = xyto84(xyz[0], xyz[1])
        const latlng = lnglat.reverse()
        drawXY(mapRef[layer], latlng, false, id)
        drawXYZ(cloudRef[layer], xyz, false, id)
      },

      drawXYZPoints(xyzs, ids, layer) {
        for (const index in xyzs) this.drawXYZPoint(xyzs[index], ids[index], layer)
      },

      getExtentBox() {
        const extent = mapRef.map.getView().calculateExtent()
        const leftBottom = transform(extent.slice(0, 2), 'EPSG:3857', 'EPSG:4326')
        const rightTop = transform(extent.slice(2, 4), 'EPSG:3857', 'EPSG:4326')
        return [leftBottom, rightTop]
      },

      async drawnFacilities(currentMark, layer) {
        /*
         * @summary - Get & Draw drawn Facilities
         */
        let facilities
        if (!currentMark) currentMark = state.ls.currentMark
        if (!imgRef.drawnLayer) return
        if (!layer) layer = state.ls.targetLayer?.object?.layer
        const box = this.getExtentBox()

        // Get Facilities
        if (layer) {
          commit('setLoading', true)
          let url = `/api/facility/box/${layer}`
          // reset
          await this.resetLayer('drawnLayer')
          resetPointLayer(cloudRef.drawnLayer)
          removeLineLoops()

          // get Facilities
          const res = await $axios.post(url, { box })
          facilities = res.data
        } else facilities = []

        const task = state.ls.targetTask
        let filteredFacilities = facilities
        if (task) filteredFacilities = filteredFacilities.filter(item => item.relations[task.prop] === task.data)
        commit('setState', { props: ['facilities'], value: filteredFacilities })

        // Draw to Image
        await this.drawToImage(filteredFacilities, currentMark, imgRef.drawnLayer)
        updateImg(imgRef.drawnLayer, 'drawnLayer')

        // Draw to Map and Cloud
        this.drawGeojsons(filteredFacilities, 'drawnLayer')
        commit('setLoading', false)
      },

      drawGeojsons(geojsons, layer) {
        const [xyzs, ids] = [[], []]
        for (const geojson of geojsons) {
          const props = geojson.properties
          const geom = geojson.geometry

          if (geom.type === 'Point') {
            xyzs.push([props.x, props.y, props.z])
            ids.push(geojson.id)
          } else if (geom.type === 'LineString') {
            for (const index in props.xyzs) {
              const xyz = props.xyzs[index]
              xyzs.push(xyz)
              let id = geojson.id + this.idSep + index
              ids.push(id)
            }
          } else if (geom.type === 'Polygon') {
            for (const index in props.xyzs) {
              const polyline = props.xyzs[index]
              for (const index2 in polyline) {
                const xyz = polyline[index2]
                xyzs.push(xyz)
                let id = geojson.id + this.idSep + index + this.idSep + index2
                ids.push(id)
              }
            }
          }
          // Main Feature to Cloud, Map
          if (geom.type !== 'Point') {
            const projection = { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
            const feature = new GeoJSON(projection).readFeature(geojson)
            mapRef[layer].getSource().addFeature(feature)
            if (geom.type === 'LineString') drawLine(props.xyzs, layer)
            else if (geom.type === 'Polygon') drawLoop(props.xyzs, layer)
          }
        }
        this.drawXYZPoints(xyzs, ids, layer)
      },

      async drawRelated(id) {
        const facility = await this.getFacilityByID(id)
        if (facility) this.drawGeojsons([facility], 'relatedLayer')
      },

      async drawToImage(facilities, currentMark, layer) {
        /*
         * @summary - Draw facilities to image
         */
        const xyzdis = []
        for (const i in facilities) {
          const facility = facilities[i]
          const props = facility.properties
          if (facility.geometry.type === 'Point') {
            let id = facility.id
            const props = facility.properties
            xyzdis.push({ x: props.x, y: props.y, z: props.z, d: 'front', id, i })
            xyzdis.push({ x: props.x, y: props.y, z: props.z, d: 'back', id, i })
          } else if (facility.geometry.type === 'LineString') {
            for (const index in props.xyzs) {
              const xyz = props.xyzs[index]
              let id = facility.id + this.idSep + index
              xyzdis.push({ x: xyz[0], y: xyz[1], z: xyz[2], d: 'front', id, i })
              xyzdis.push({ x: xyz[0], y: xyz[1], z: xyz[2], d: 'back', id, i })
            }
          } else if (facility.geometry.type === 'Polygon') {
            for (const index in props.xyzs) {
              const polyline = props.xyzs[index]
              for (const index2 in polyline) {
                const xyz = props.xyzs[index][index2]
                let id = facility.id + this.idSep + index + this.idSep + index2
                xyzdis.push({ x: xyz[0], y: xyz[1], z: xyz[2], d: 'front', id, i })
                xyzdis.push({ x: xyz[0], y: xyz[1], z: xyz[2], d: 'back', id, i })
              }
            }
          }
        }
        const url = `/api/image/convert`
        const fbRes = await $axios.post(url, { data: { mark: currentMark, xyzdis } })

        // Draw to image
        for (const i in fbRes.data) {
          const result = fbRes.data[i]
          const id = result.id
          const index = result.i
          const coor = result.coor
          const width = result.width
          const height = result.height
          const direction = result.direction
          const wfactor = width / layer[direction].image.bitmap.width
          const hfactor = height / layer[direction].image.bitmap.height

          // Set Visible Property
          if (coor[0] !== -1) {
            const drawOption = { x: coor[0] / wfactor, y: coor[1] / hfactor, color: layer.color, id, direction }
            drawNear(layer, drawOption, false)
            facilities[index].relations.visible = true
          } else if (!facilities[index].relations.visible) facilities[index].relations.visible = false
        }
      },

      async selectFromDepth(vid) {
        /*
         * @summary - Callback From Image click
         */
        let id, index, index2
        const idSet = vid.split(this.idSep)
        id = vid
        if (idSet.length > 1) {
          id = idSet[0]
          index = Number(idSet[1])
          index2 = Number(idSet[2])
        }
        this.selectID(id, index, index2)
      },

      async drawFromDepth(x, y, depthDir) {
        /*
         * @summary - Callback From Image click
         */
        const targetLayer = this.$store.state.ls.targetLayer
        commit('setLoading', true)
        console.time('xy')
        if (targetLayer.object) if (targetLayer.object.type === 'Point') await this.drawSelectedXY(depthDir, x, y)
        commit('setLoading', false)
        console.timeEnd('xy')
      },

      async drawSelectedXY(depthDir, x, y) {
        /*
         * @summary - Callback From Depth Select
         */
        const ls = this.$store.state.ls
        await this.resetSelected()
        depthDir.layer.selected.image = new jimp(depthDir.width, depthDir.height)
        drawNear(
          imgRef.selectedLayer,
          { x, y, color: imgRef.selectedLayer.color, direction: depthDir.name, id: POINT_ID },
          true
        )
        const xyzRes = await $axios.post(`${depthDir.url}/${x}/${y}`)
        const xyz = xyzRes.data
        commit('select', {
          xyz,
          type: 'Point',
          images: [
            {
              round: ls.currentRound.name,
              snap: ls.currentSnap.name,
              name: ls.currentMark.name,
              direction: depthDir.name,
              coordinates: [x, y]
            }
          ]
        })
        this.selectXYZ(xyz, POINT_ID)
      },

      async drawSelectedXYZ(xyz) {
        /*
         * @summary - Callback From Clodu
         */
        await this.resetSelected()
        commit('select', {
          xyz,
          type: 'Point'
        })
        this.selectXYZ(xyz, POINT_ID)
        await this.drawToImage(state.selected, state.ls.currentMark, imgRef.selectedLayer)
        updateImg(imgRef.selectedLayer)
      },

      async resetSelected() {
        /*
         * @summary - Reset Selected and Selected Layer
         */
        mapRef.selectedLayer.getSource().clear()
        resetPointLayer(cloudRef.selectedLayer)
        const depth = imgRef.depth
        if (depth)
          for (const data of Object.values(depth)) {
            data.layer.selected.image = new jimp(data.width, data.height)
            const uri = await data.layer.selected.image.getBase64Async('image/png')
            data.layer.selected.uri = uri
          }
        commit('resetSelected')
        if (process.env.dev) console.log(`Reset Selected`, state.selected)
      },

      async resetLayer(name) {
        /*
         * @summary - Reset Layer
         */
        mapRef[name].getSource().clear()
        resetPointLayer(cloudRef[name])
        const imgLayer = imgRef[name]
        if (imgLayer)
          for (const direction of ['front', 'back']) {
            imgLayer[direction].image = new jimp(imgRef.depth[direction].width, imgRef.depth[direction].height)
            const uri = await imgLayer[direction].image.getBase64Async('image/png')
            imgLayer[direction].uri = uri
          }
        if (process.env.dev) console.log(`Reset ${name}`)
      },

      async resetSnap() {
        /*
         * @summary - Reset Snap for New Snap
         */
        if (mapRef.markLayer) mapRef.markLayer.getSource().clear()
        if (mapRef.markLayer) mapRef.drawnLayer.getSource().clear()
        if (cloudRef.markLayer) resetPointLayer(cloudRef.markLayer)
        if (cloudRef.markLayer) resetPointLayer(cloudRef.drawnLayer)
        if (cloudRef.cloud.points) for (const pointLayer of cloudRef.cloud.points) cloudRef.cloud.scene.remove(pointLayer)
        cloudRef.cloud.points = []
      }
    }
  })
}
