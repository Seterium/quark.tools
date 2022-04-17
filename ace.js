#! /usr/bin/env node

import { Command } from 'commander'
import sharp from 'sharp'

import path from 'path'

const program = new Command()

const getOriginFSDetails = (filename) => {
  const abs = path.resolve(process.argv[1].replace(`\\ace`, ''), filename)
  const dir = path.dirname(abs)
  const ext = path.extname(abs).substring(1)
  const name = path.basename(abs, `.${ext}`)

  return {
    abs,
    dir,
    file: {
      name,
      ext
    }
  }
}

const validateImageFormats = (formats) => {
  const availableFormats = ['jpg', 'png', 'webp', 'avif']

  formats.every((format) => {
    const isInclude = availableFormats.includes(format)

    if (!isInclude) {
      console.log(`[ERROR] Unknown target image format '${format}'`)
      console.log(`AvailableFormats: ${availableFormats.join(', ')}`)

      process.exit(1)
    }

    return isInclude
  })
}

program
  .name('quark.tools')
  .version('0.1');

program.command('convert')
  .description('Resize and convert image')
  .argument('<origin>', 'origin image path')
  .option('-s, --sizes [sizes...]', 'specify output images widths', [])
  .option('-f, --formats [formats...]', 'specify output images formats', [])
  .action((origin, { sizes, formats }) => {
    validateImageFormats(formats)

    const { abs, dir, file } = getOriginFSDetails(origin)

    const converter = sharp(abs)

    formats.forEach((format) => {
      converter.toFile(`${dir}/${file.name}.${format}`)
    })

    sizes.forEach((size) => {
      const resized = converter.resize(+size)

      resized.toFile(`${dir}/${file.name}${size}.${file.ext}`)
      
      formats.forEach((format) => {
        resized.toFile(`${dir}/${file.name}${size}.${format}`)
      })
    })
  })

program.parse()