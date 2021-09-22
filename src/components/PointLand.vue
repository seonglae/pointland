/* * @summary - point land component */

<template>
  <div>
    <div id="nipple" v-if="touchable" style="overflow: hidden" />
    <div id="pointland" />
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, onMounted } from '@vue/composition-api'
import { useStore } from '@nuxtjs/composition-api'
import usePointland from '@/composables/usePointland'
import useController from '@/composables/useController'

export default defineComponent({
  setup(_, context) {
    const store = useStore()
    const move = reactive({ move: { camera: false, vertical: false, target: false } })
    const { startLand } = usePointland(store, context.root)
    const { checkTouchable, touchable } = useController()

    onMounted(() => {
      const layerspace = startLand()
      checkTouchable(layerspace.space)
    })

    return { ...toRefs(move), touchable }
  },
})
</script>

<style>
#pointland,
#nipple {
  height: 100%;
  width: 100%;
  position: absolute;
}
#nipple {
  z-index: 1;
}
</style>
