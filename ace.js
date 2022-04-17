#! /usr/bin/env node

import path from 'path'

import { Command } from 'commander'
import sharp from 'sharp'

const commander = new Command()

const getOriginFSDetails = (filename) => {
  const abs = path.resolve(process.cwd(), filename)
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

const validateFormats = (formats) => {
  const availableFormats = ['jpg', 'png', 'webp', 'avif']

  formats.every((format) => {
    const isInclude = availableFormats.includes(format)

    if (!isInclude) {
      console.log(`[ERROR] Неизвестный формат изображения: '${format}'`)
      console.log(`Доступные форматы: ${availableFormats.join(', ')}`)

      process.exit()
    }

    return isInclude
  })
}

const validateSizes = (sizes) => {
  sizes.every((size) => {
    if (+size === NaN || !Number.isInteger(+size)) {
      console.log(`[ERROR] Некорректно указано значение ширины: '${size}'`)
      console.log('Разрешены только натуральные целочисленные значения\r\n')

      process.exit(0)
    }

    return true
  })
}

commander
  .name('quark.tools')
  .version('0.1');

commander.command('imgp')
  .description('Генерация миниатюр и конвертации изображения')
  .argument('<origin>', 'Путь к оригинальному файлу')
  .option('-s, --sizes [sizes...]', 'Список значений ширины миниатюр', [])
  .option('-f, --formats [formats...]', 'Список форматов для конвертации', [])
  .action((origin, { sizes, formats }) => {
    validateFormats(formats)
    validateSizes(sizes)

    const { abs, dir, file } = getOriginFSDetails(origin)

    const converter = sharp(abs)

    formats.forEach((format) => {
      if (format !== file.ext) {
        converter.toFile(`${dir}/${file.name}.${format}`)
      }
    })

    sizes.forEach((size) => {
      const resized = converter.resize(+size)

      resized.toFile(`${dir}/${file.name}${size}.${file.ext}`)
      
      formats.forEach((format) => {
        resized.toFile(`${dir}/${file.name}${size}.${format}`)
      })
    })
  })

commander.exitOverride()

try {
  commander.parse(process.argv);
} catch (err) {
  

  process.exit(0)
}