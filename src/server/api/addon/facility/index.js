/*
 * @summary - facility api addon end point module
 */

import { xyto84 } from '../tool/coor'
import { v4 as uuid } from 'uuid'

const GEO_JSON_TEMPLATE_4326 = {
  type: 'FeatureCollection',
  crs: { type: 'name', properties: { name: 'epsg:4326' } }
}

const GEO_JSON_TEMPLATE_32652 = {
  type: 'FeatureCollection',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32652' } }
}

export default app => {
  const near = async (req, res) => {
    const lng = req.params.lng
    const lat = req.params.lat
    const distance = Number(req.params.distance)
    const facilityService = app.service('facility')

    let query = {}
    if (distance > 0)
      query.$and = [
        {
          geometry: {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: distance
            }
          }
        }
      ]
    const facilities = await facilityService.Model.find(query)
    res.json(facilities)
  }

  const nearLayer = async (req, res) => {
    const lng = req.params.lng
    const lat = req.params.lat
    const layer = req.params.layer
    const distance = Number(req.params.distance)
    const facilityService = app.service('facility')

    let query = {}
    if (distance > 0)
      query.$and = [
        {
          geometry: {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: distance
            }
          }
        },
        { 'properties.layer': { $eq: layer } }
      ]
    const facilities = await facilityService.Model.find(query)
    res.json(facilities)
  }

  const exporter = async (req, res) => {
    const layer = req.params.layer
    const crs = req.params.crs
    const facilityService = app.service('facility')
    const facilities = await facilityService.Model.find({ 'properties.layer': layer })
    let geoJson
    if (crs === '4326') geoJson = { ...GEO_JSON_TEMPLATE_4326, features: facilities }
    else if (crs === '32652') {
      const facilities32652 = facilities.map(f => {
        f.geometry.coordinates[0] = f.properties.x
        f.geometry.coordinates[1] = f.properties.y
        f.geometry.coordinates[2] = f.properties.z
        f.properties.x = undefined
        f.properties.y = undefined
        f.properties.z = undefined
        return f
      })
      geoJson = { ...GEO_JSON_TEMPLATE_32652, features: facilities32652 }
    } else geoJson = { ...GEO_JSON_TEMPLATE_4326, features: facilities }
    res.json(geoJson)
  }

  const importer = async (req, res) => {
    const layer = req.params.layer
    const facilities = req.body.features
    const crs = req.params.crs
    const facilityService = app.service('facility')
    const promises = []

    for (const facility of facilities) {
      const props = facility.properties
      const geom = facility.geometry
      props.layer = layer
      facility.id = uuid()
      facility.relations = {}
      if (crs === '32652') {
        props.x = geom.coordinates[0]
        props.y = geom.coordinates[1]
        props.z = geom.coordinates[2]
      }
      geom.coordinates = xyto84(props.x, props.y)
      props.layer = layer
      promises.push(facilityService.Model.create(facility))
    }
    res.json(await Promise.all(promises))
  }

  app.get('/facility/export/:layer', exporter)
  app.get('/facility/export/:layer/:crs', exporter)
  app.get('/facility/near/:lng/:lat/:distance', near)
  app.get('/facility/near/:lng/:lat/:distance/:layer', nearLayer)

  app.post('/facility/import/:layer/:crs', importer)
}
