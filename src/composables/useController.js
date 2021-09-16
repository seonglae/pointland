import { reactive, toRefs, ref } from '@vue/composition-api'
import nipplejs from 'nipplejs'
import { ElementHold } from 'hold-event'

export default function useController() {
  const mouse = reactive({ x: 0, y: 0 })
  document.addEventListener(
    'mousemove',
    (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    },
    false
  )
  const dirControl = reactive({ force: 0, vector: { x: 0, y: 0 } })
  const xyControl = reactive({ force: 0, vector: { x: 0, y: 0 } })
  const zControl = reactive({ force: 0, vector: { x: 0, y: 0 } })
  const touchable = ref(true)

  function checkTouchable(space) {
    touchable.value = true
    const zone = document.getElementById('nipple')
    if (!zone) return
    const options = { zone, multitouch: true, maxNumberOfNipples: 2 }
    const manager = nipplejs.create(options)
    nippleEvent(manager, space)
  }

  function nippleEvent(manager, space) {
    manager.on('added', (_, nipple) => {
      if (nipple.position.y < window.innerHeight / 2) zNipple(nipple, space)
      else if (nipple.position.x < window.innerWidth / 2) xyNipple(nipple, space)
      else dirNipple(nipple, space)
    })
  }

  function dirNipple(nipple, space) {
    const holder = new ElementHold(nipple.el, 10)
    holder._holdStart()
    holder.addEventListener('holding', (event) => {
      space.controls.rotate(
        (-(dirControl.force * dirControl.vector.x) * event?.deltaTime) / 2000,
        (dirControl.force * dirControl.vector.y * event?.deltaTime) / 2000,
        true
      )
    })
    nipple.on('move', (_, data) => {
      dirControl.force = data.force
      dirControl.vector = data.vector
    })
    nipple.on('destroyed', () => {
      holder._holdEnd()
      dirControl.force = 0
      dirControl.vector = { x: 0, y: 0 }
    })
  }

  function zNipple(nipple, space) {
    const holder = new ElementHold(nipple.el, 10)
    holder._holdStart()
    holder.addEventListener('holding', (event) => {
      space.controls.truck(((zControl.force * zControl.vector.x) / 100) * event?.deltaTime, 0, true)
      space.controls.truck(0, -((zControl.force * zControl.vector.y) / 100) * event?.deltaTime, true)
    })
    nipple.on('move', (_, data) => {
      zControl.force = data.force
      zControl.vector = data.vector
    })
    nipple.on('destroyed', () => {
      holder._holdEnd()
      zControl.force = 0
      zControl.vector = { x: 0, y: 0 }
    })
  }
  function xyNipple(nipple, space) {
    const holder = new ElementHold(nipple.el, 10)
    holder._holdStart()
    holder.addEventListener('holding', (event) => {
      space.controls.truck(((xyControl.force * xyControl.vector.x) / 50) * event?.deltaTime, 0, true)
      space.controls.forward(((xyControl.force * xyControl.vector.y) / 50) * event?.deltaTime, true)
    })
    nipple.on('move', (_, data) => {
      xyControl.force = data.force
      xyControl.vector = data.vector
    })
    nipple.on('destroyed', () => {
      holder._holdEnd()
      xyControl.force = 0
      xyControl.vector = { x: 0, y: 0 }
    })
  }

  return {
    checkTouchable,
    direction: toRefs(dirControl),
    xy: toRefs(xyControl),
    z: toRefs(zControl),
    touchable,
  }
}
