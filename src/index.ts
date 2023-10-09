import fs from 'fs'
import path from 'path'
import { rimraf } from 'rimraf'
import convert from 'heic-convert'
import argv from './command'

interface GooglePhotoMeta {
  title: string
  photoTakenTime: {
    timestamp: string
  }
}

const isGooglePhotoMeta = (obj: any): obj is GooglePhotoMeta =>
  typeof obj.photoTakenTime !== 'undefined'

const main = async (): Promise<void> => {
  const srcDirPath = argv.srcDir as string
  if (!fs.existsSync(srcDirPath)) {
    throw new Error(`source directory doesn't exist (path = "${srcDirPath}").`)
  }
  const outDirPath = srcDirPath + '.sorted'
  if (fs.existsSync(outDirPath)) {
    throw new Error(`output directory already exists (path = "${outDirPath}").`)
  }

  try {
    fs.mkdirSync(outDirPath)

    const metas = fs.readdirSync(srcDirPath)
      .filter(fileName => path.extname(fileName) === '.json')
      .map(fileName => fs.readFileSync(path.resolve(srcDirPath, fileName),
        { encoding: 'utf8' }).toString())
      .map(contents => JSON.parse(contents) as GooglePhotoMeta)
      .filter(isGooglePhotoMeta)
      .sort((a, b) => parseInt(a.photoTakenTime.timestamp) - parseInt(b.photoTakenTime.timestamp))

    const numDigits = (metas.length + 1).toString().length

    for await (const [idx, meta] of Object.entries(metas)) {
      const baseName = (parseInt(idx) + 1).toString().padStart(numDigits, '0')
      let extname = path.extname(meta.title)

      if (extname.toLowerCase() === '.heic') {
        extname = '.jpg'
        const outputBuffer = await convert({
          buffer: await fs.promises.readFile(path.resolve(srcDirPath, meta.title)),
          format: 'JPEG'
        }) as Buffer
        await fs.promises.writeFile(path.resolve(outDirPath, baseName + extname), outputBuffer)
      } else {
        await fs.promises.copyFile(path.resolve(srcDirPath, meta.title), path.resolve(outDirPath, baseName + extname))
      }
      console.log(`(${(parseInt(idx) + 1).toString().padStart(numDigits, ' ')}/${metas.length}) ${baseName}${extname} <- ${meta.title}`)
    }
  } catch (err) {
    await rimraf(outDirPath)
    throw err
  }
}

export = main
