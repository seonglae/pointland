import express from 'express'
import dotenv from 'dotenv'
import proj4 from 'proj4'
import { WGS84, EPSG32652 } from './node/const'
import {
  imagePath,
  depthmapPath,
  getNodeMeta,
  depthData,
  xyzAtDepthmap
} from './node/image'

dotenv.config()
const router = express.Router()

router.get('/:round/:snap/:seq/:direction', image)
router.get('/:round/:snap/:seq/:direction/depth', depthmap)
router.get('/:round/:snap/:seq/:direction/depth/:x/:y', imgtoxyz)

function image(req, res) {
  const path = imagePath(req)
  res.sendFile(path)
}

async function depthmap(req, res) {
  const path = depthmapPath(req)
  const meta = await getNodeMeta(req)
  const data = await depthData(path, meta)
  res.json(data)
}

async function imgtoxyz(req, res) {
  const [x, y] = [Number(req.params.x), Number(req.params.y)]
  const path = depthmapPath(req)
  const xyz = await xyzAtDepthmap(path, x, y)
  const lnglat = proj4(EPSG32652, WGS84, [xyz.x, xyz.y])
  res.json([lnglat[1], lnglat[0], xyz.z])
}

export default router
