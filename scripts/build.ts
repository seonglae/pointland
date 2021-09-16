import generateFavicons from './generate-favicons'

async function build() {
  const promises = []
  promises.push(await generateFavicons())
  await Promise.all(promises)
}

build()
