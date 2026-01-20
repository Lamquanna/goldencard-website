import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'

import { schema } from './sanity/schema'
import { apiVersion, dataset, projectId } from './sanity/env'

export default defineConfig({
  basePath: '/cms',
  projectId,
  dataset,
  schema,
  plugins: [
    deskTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  // Note: Studio uses cookie-based auth (login to sanity.io)
  // API token is only for server-side operations
  
  // Disable update notifications to avoid network errors
  __internal: {
    disableVersionCheck: true,
  },
})
