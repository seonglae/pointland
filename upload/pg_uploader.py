'''
PostGres Uploader
'''

import sys, json
import logging
import logging.config
import pandas as pd
from sqlalchemy import String
from geoalchemy2 import Geometry, WKTElement
from geopandas import GeoDataFrame
from shapely.geometry import Point
from module.common import load_config, create_db_engine
from module.logger import file_log


RECORDED_LAYER = 'recorded'
DST_DB = 'db_info_stxpg1'
WGS84 = 4326


def xy_upload(xy_df, add, schema):
  '''
  PostGres PVR upload for geoserver
  '''

  # connect engine
  config_context = load_config()
  dst_engine = create_db_engine(config_context[DST_DB])

  # Ask Insert
  xy_gdf = GeoDataFrame(
      xy_df,
      crs={'init': 'epsg:4326'},
      geometry=xy_df.apply(
          lambda row: Point((row.lon, row.lat)),
          axis=1)
  )

  # geodata
  xy_gdf['geom'] = xy_gdf['geometry'].apply(
      lambda x: WKTElement(x.wkt, srid=WGS84))
  xy_gdf.drop('geometry', 1, inplace=True)

  # logging
  logging.info("head pvr_gdf")
  logging.info(xy_gdf.head())
  logging.info(xy_gdf.keys())
  logging.info(xy_gdf.dtypes)

  # set upload config
  if add: method = "append"
  else: method = "replace"
  dtype = {"geom": Geometry('POINT', WGS84)}
  dtype["date"] = String
  dtype["maker"] = String
  dtype["snap"] = String

  # upload
  xy_gdf.to_sql(name=RECORDED_LAYER,
                con=dst_engine,
                if_exists=method,
                index=True,
                schema=schema,
                dtype=dtype)


def pg_main(xy_df, add, schema):
  '''
  PostGres Uploader Main Function
  '''
  file_log()
  xy_upload(xy_df, add, schema)


if __name__ == "__main__":
  # make data
  data = json.loads(sys.argv[1])
  add = json.loads(sys.argv[2])
  date = json.loads(sys.argv[3])
  maker = json.loads(sys.argv[4])
  snap = json.loads(sys.argv[5])
  schema = json.loads(sys.argv[6])

  # return if no data
  if len(data) == 0:
    exit(0)

  # make dataframe
  xy_df = pd.DataFrame(data)
  xy_df["date"] = date
  xy_df["maker"] = maker
  xy_df["snap"] = snap

  pg_main(xy_df, True, schema)
