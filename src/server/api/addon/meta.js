import express from 'express'
import dotenv from 'dotenv'
import { getTable } from './tool/table'

dotenv.config()
const router = express.Router()

router.get('/:round', round)

async function round(req, res) {
  const roundObj = {
    name: 'imms_20200909_231253',
    root: '\\\\10.1.0.112\\mms_test2\\2020_imms\\00_proj_hdmap\\01_cto_output\\Daejeon_KAIST\\imms_20200909_231253',
    snaps: [
      {
        name: 'snap1',
        folder: 'snap1',
        image: {
          formats: [
            { type: 'img', folder: 'images', ext: 'jpg' },
            { type: 'depthmap', folder: 'images_depthmap', ext: 'bin' }
          ],
          metas: [
            {
              folder: 'images_shp',
              ext: 'dbf',
              key: 'id_point',
              column: {
                name: 'id_point',
                seq: 'sequence',
                lat: 'Latitude',
                lon: 'Longitude',
                alt: 'altitude',
                heading: 'heading',
                x: 'x_utm',
                y: 'y_utm',
                roll: 'roll',
                pitch: 'pitch'
              },
              prefix: {
                front: '00',
                back: '01'
              },
              sep: '_'
            }
          ]
        },
        pointcloud: {
          formats: [
            { type: 'pcd', folder: 'pointcloud', ext: 'las' },
            { type: 'depthmap', folder: 'images_depthmap_point', ext: 'bin' }
          ],
          metas: [
            {
              folder: 'pointcloud_shp',
              ext: 'dbf',
              column: {
                name: 'file_las'
              }
            }
          ]
        }
      }
    ]
  }
  for (const snapObj of roundObj.snaps) snapObj.marks = await getTable(roundObj.name, snapObj.name, snapObj.image.metas)
  for (const snapObj of roundObj.snaps) snapObj.areas = await getTable(roundObj.name, snapObj.name, snapObj.pointcloud.metas)
  res.json(roundObj)
}

export default router