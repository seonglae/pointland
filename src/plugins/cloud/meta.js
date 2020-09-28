/**
 * @summary - Make Point Cloud
 */

import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { drawHover, drawClick } from './draw'

export const ref = { pointSize: 0.05 }
const CLOUD_ID = "las"


function initCloud() {
  /**
   * @summary - Make Point Cloud
   * @params {String} id - dom id for append
   * @params {Object} socket - socket io object to render real time
   */
  const cloud = {}
  cloud.el = document.getElementById(CLOUD_ID)
  if (cloud.el && window) {

    // Make Space
    cloud.camera = makeCamera(cloud.el)
    cloud.scene = makeScene(cloud.camera)
    cloud.renderer = makeRenderer(cloud.el)
    cloud.el.appendChild(cloud.renderer.domElement)
    cloud.el.cloud = cloud
    cloud.controls = makeControls(cloud.camera, cloud.renderer)
    cloud.axis = true
    cloud.mouse = new THREE.Vector2()
    cloud.raycaster = new THREE.Raycaster()
    cloud.raycaster.params.Points.threshold = 0.03
    cloud.selected = []
    ref.cloud = cloud
    window.addEventListener('resize', onWindowResize, false)
    cloud.el.addEventListener('mousemove', onDocumentMouseMove, false)
    cloud.el.addEventListener('click', onDocumentClick, false)

    // Add To Canvas
    cloud.id = animate()
    return cloud
  }
  else throw new Error('No Window or No #cloud')
}


function purgeCloud(cloud) {
  /**
   * @summary - Purge cloud event, loop
   */
  window.removeEventListener("resize", onWindowResize, false)
  cancelAnimationFrame(cloud.id)
  return null
}


function makeCamera(el) {
  /**
   * @summary - Make Camera
   */
  const w = el.offsetWidth
  const h = el.offsetHeight
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 10000)
  camera.position.z = 3
  return camera
}

function makeScene(cam) {
  /**
   * @summary - Make Scene
   */
  const scene = new THREE.Scene()
  scene.add(cam)
  return scene
}


function makeRenderer(el) {
  /**
   * @summary - Make Renderer - window used
   */
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(el.offsetWidth, el.offsetHeight)
  return renderer
}


function makeControls(camera, renderer) {
  /**
   * @summary - Make Controls
   */
  const controls = new TrackballControls(
    camera,
    renderer.domElement
  )
  controls.rotateSpeed = 2.0
  controls.zoomSpeed = 1
  controls.panSpeed = 1
  controls.staticMoving = true
  controls.minDistance = 0.3
  controls.maxDistance = 0.3 * 1000
  return controls
}


function animate() {
  /**
   * @summary - Animate function for Point Cloud
   */
  if (!ref.cloud?.el) return
  const cloud = ref.cloud
  const id = requestAnimationFrame(animate)

  cloud.raycaster.setFromCamera(cloud.mouse, cloud.camera)
  if (cloud.points) drawHover(cloud)

  cloud.controls.update()
  cloud.renderer.render(cloud.scene, cloud.camera)
  return id
}


function onWindowResize() {
  /**
   * @summary - Animate function for Point Cloud
   */
  const el = ref.cloud.el
  ref.cloud.camera.aspect = el.offsetWidth / el.offsetHeight
  ref.cloud.camera.updateProjectionMatrix()
  ref.cloud.renderer.setSize(el.offsetWidth, el.offsetHeight)
}


function onDocumentMouseMove(event) {
  event.preventDefault()
  ref.cloud.mouse.x = (event.offsetX / ref.cloud.el.offsetWidth) * 2 - 1
  ref.cloud.mouse.y = - (event.offsetY / ref.cloud.el.offsetHeight) * 2 + 1
}

function onDocumentClick() {
  const cloud = ref.cloud
  if (cloud.currentHover) drawClick(cloud)
}


export { initCloud, purgeCloud }