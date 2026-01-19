import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from '../env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image) => {
  return imageBuilder?.image(source).auto('format').fit('max')
}

export function getImageDimensions(image: Image) {
  const dimensions = image.asset?._ref.split('-')[2]
  const [width, height] = dimensions?.split('x') || []
  
  return {
    width: parseInt(width, 10),
    height: parseInt(height, 10),
    aspectRatio: parseInt(width, 10) / parseInt(height, 10),
  }
}

export function getImageSrcSet(image: Image, sizes: number[] = [640, 750, 828, 1080, 1200]) {
  return sizes
    .map(size => {
      const url = urlForImage(image).width(size).url()
      return `${url} ${size}w`
    })
    .join(', ')
}
