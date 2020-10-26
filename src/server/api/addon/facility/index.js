/*
 * @summary - facility api addon end point module
 */

const GEO_JSON_TEMPLATE = {
  type: 'FeatureCollection'
}

export default app => {
  const near = async (req, res) => {
    const lng = req.params.lng
    const lat = req.params.lat
    const facilityService = app.service('facility')
    const facilities = await facilityService.Model.find({
      geometry: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 100
        }
      }
    })
    res.json(facilities)
  }

  const exporter = async (req, res) => {
    const layer = req.params.layer
    const facilityService = app.service('facility')
    const facilities = await facilityService.Model.find({ 'properties.layer': layer })
    const geoJson = { ...GEO_JSON_TEMPLATE, features: facilities }
    res.json(geoJson)
  }

  app.get('/facility/export/:layer', exporter)
  app.get('/facility/near/:lng/:lat', near)
}
