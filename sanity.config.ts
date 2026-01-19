import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'

import { schema } from './sanity/schema'
import { apiVersion, dataset, projectId, studioUrl } from './sanity/env'

export default defineConfig({
  basePath: studioUrl,
  projectId,
  dataset,
  schema,
  plugins: [
    deskTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
