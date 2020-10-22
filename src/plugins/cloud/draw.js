/*
 * <summary>index file from js</summary>
 */
import { ref } from './init'
import { firstLas, addLas, addPoints } from './event'

const HOVER_COLOR = [0.8, 1, 1]

function drawLas(lasJson) {
  /*
   * <summary>index file from js</summary>
   */
  const cloud = ref.cloud
  const [vertices, colors] = [[], []]
  ref.loading = true

  if (!cloud.offset) firstLas(cloud, lasJson, vertices)
  else addLas(lasJson, cloud, vertices)
  addPoints(lasJson, colors, vertices, cloud)
  ref.loading = false
}

export function drawXYZ(layer, xyz, focus, id) {
  /*
   * <summary>index file from js</summary>
   */
  const cloud = ref.cloud
  const geometry = layer.geometry
  const positions = geometry.attributes.position.array
  const ids = geometry.ids
  const indexs = geometry.indexs
  const count = geometry.drawRange.count
  const xyzInCloud = [xyz[0] - cloud.offset[0], xyz[1] - cloud.offset[1], xyz[2] - cloud.offset[2]]

  // remove
  if (ids[id]) removePoint(layer, id)

  // add
  if (ids[id] === undefined) {
    positions[3 * count] = xyzInCloud[0]
    positions[3 * count + 1] = xyzInCloud[1]
    positions[3 * count + 2] = xyzInCloud[2]
    geometry.setDrawRange(geometry.drawRange.start, ++geometry.drawRange.count)
  }
  // Chnage Last
  else {
    positions[3 * count - 3] = xyzInCloud[0]
    positions[3 * count - 2] = xyzInCloud[1]
    positions[3 * count - 1] = xyzInCloud[2]
  }
  geometry.attributes.position.needsUpdate = true
  geometry.computeBoundingSphere()

  if (focus) cloud.controls.target.set(...xyzInCloud)
  if (!cloud.focused) {
    cloud.camera.position.set(xyzInCloud[0], xyzInCloud[1], xyzInCloud[2] + 20)
    cloud.focused = true
  }

  // update
  const index = geometry.drawRange.count - 1
  indexs[index] = { id }
  ids[id] = { index }
}

export function removePoint(layer, id) {
  const geometry = layer.geometry
  const ids = geometry.ids
  const indexs = geometry.indexs
  const positions = geometry.attributes.position.array
  const start = geometry.drawRange.start

  const index = ids[id].index
  const substitute = indexs[start].id

  // update geometry
  positions[3 * index] = positions[3 * start]
  positions[3 * index + 1] = positions[3 * start + 1]
  positions[3 * index + 2] = positions[3 * start + 2]
  geometry.attributes.position.needsUpdate = true
  geometry.computeBoundingSphere()

  // update info
  ids[id] = undefined
  ids[substitute] = {}
  indexs[start] = undefined
  indexs[index] = { id: substitute }
  geometry.drawRange.start = start + 1
}

function drawHover(cloud) {
  /*
   * <summary>index file from js</summary>
   */
  const intersects = cloud.raycaster.intersectObjects(cloud.points)
  const hovered = intersects[0]
  const previous = cloud.currentHover

  // If null
  if (!hovered && previous) {
    changeColor(previous.colors, previous.index, previous.intensity, previous.attributes)
    cloud.currentHover = undefined
  }
  if (!hovered) return

  // restore previous
  const attributes = hovered.object.geometry.attributes
  const colors = attributes.color.array
  const index = hovered.index
  hovered.attributes = attributes
  hovered.colors = colors
  if (previous)
    if (previous.index === index) return
    else changeColor(previous.colors, previous.index, previous.intensity, previous.attributes)

  // save current
  const intensity = colors[3 * index]
  hovered.intensity = intensity
  cloud.currentHover = hovered

  // change color
  changeColor(colors, index, HOVER_COLOR, attributes)
}

function changeColor(colors, index, color, attributes) {
  /*
   * <summary>index file from js</summary>
   */
  if (color instanceof Array) {
    colors[3 * index] = color[0]
    colors[3 * index + 1] = color[1]
    colors[3 * index + 2] = color[2]
  } else {
    colors[3 * index] = color
    colors[3 * index + 1] = color
    colors[3 * index + 2] = color
  }
  attributes.color.needsUpdate = true
}

function drawClick() {
  /*
   * <summary>index file from js</summary>
   */
  const cloud = ref.cloud
  if (!cloud.currentHover) return
  cloud.currentSelected = cloud.currentHover
  const center = cloud.currentSelected.point
  // ref.cloud.selectCallback([center.x + cloud.offset[0], center.y + cloud.offset[1], center.z + cloud.offset[2]])
}

export { drawLas, drawHover, drawClick }
