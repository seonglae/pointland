# Pointland

- https://point.seongland.com

![pointland](https://user-images.githubusercontent.com/27716524/115001273-794dc400-9ede-11eb-8309-964e22813215.png)

## Made by

- [Layerspace](https://github.com/seonglae/layerspace)
- [nuxt-ts-template](https://github.com/seonglae/nuxt-ts-template)

# Deployment

## Get data

```bash
mkdir src/static/potree
gsutil -m cp -r -n gs://potree-architecture src/static/potree
mv src/static/potree/potree-architecture src/static/potre
rm -r src/static/potree
mv src/static/potre src/static/potree
```

## Build

```bash
VERSION=1.3.2
set -a; source .env; set +a
docker build  -t ghcr.io/seongland/pointland:$VERSION .
docker push  ghcr.io/seongland/pointland:$VERSION
docker tag ghcr.io/seongland/pointland:$VERSION ghcr.io/seongland/pointland:latest
docker push  ghcr.io/seongland/pointland:latest

# deploy
okteto namespace
# deploy to current cluster
okteto stack deploy --wait
# if windows, change to default
kubectl config use-context docker-desktop
```

## Tech Stacks

- cloudflare dns
- gcp cloud run
- docker, nuxt
- feathers
- express
- mongodb

# Build Setup

```
yarn
yarn dev
```

## Convert

```
 ./PotreeConverter.exe ./resources/*.las -o ./potree
```
