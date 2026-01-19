import { type SchemaTypeDefinition } from 'sanity'

const siteSettings = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'hotline',
      title: 'Hotline',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: any) => Rule.email(),
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        },
        {
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
        },
      ],
    },
    {
      name: 'banner',
      title: 'Hero Banner',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
        },
        {
          name: 'image',
          title: 'Background Image',
          type: 'image',
        },
      ],
    },
  ],
}

const product = {
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Solar Panels', value: 'panels' },
          { title: 'Inverters', value: 'inverters' },
          { title: 'Batteries', value: 'batteries' },
          { title: 'Monitoring', value: 'monitoring' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
    },
    {
      name: 'model',
      title: 'Model',
      type: 'string',
    },
    {
      name: 'price',
      title: 'Price (VND)',
      type: 'number',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    },
    {
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'features',
      title: 'Key Features',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'datasheet',
      title: 'Datasheet (PDF)',
      type: 'file',
      options: {
        accept: '.pdf',
      },
    },
    {
      name: 'warranty',
      title: 'Warranty (Years)',
      type: 'number',
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'locale',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'Vietnamese', value: 'vi' },
          { title: 'English', value: 'en' },
          { title: 'Chinese', value: 'zh' },
          { title: 'Indonesian', value: 'id' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand',
      media: 'mainImage',
    },
  },
}

const project = {
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'client',
      title: 'Client Name',
      type: 'string',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {
          name: 'address',
          title: 'Address',
          type: 'string',
        },
        {
          name: 'city',
          title: 'City',
          type: 'string',
        },
        {
          name: 'region',
          title: 'Region',
          type: 'string',
          options: {
            list: [
              { title: 'North', value: 'north' },
              { title: 'Central', value: 'central' },
              { title: 'South', value: 'south' },
            ],
          },
        },
      ],
    },
    {
      name: 'systemType',
      title: 'System Type',
      type: 'string',
      options: {
        list: [
          { title: 'Residential', value: 'residential' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Industrial', value: 'industrial' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'capacity',
      title: 'System Capacity (kW)',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'investment',
      title: 'Investment (VND)',
      type: 'number',
    },
    {
      name: 'savings',
      title: 'Savings Percentage',
      type: 'number',
    },
    {
      name: 'paybackPeriod',
      title: 'Payback Period (Years)',
      type: 'number',
    },
    {
      name: 'completionDate',
      title: 'Completion Date',
      type: 'date',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'gallery',
      title: 'Project Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'description',
      title: 'Project Description',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    },
    {
      name: 'challenges',
      title: 'Challenges',
      type: 'text',
      rows: 3,
    },
    {
      name: 'solutions',
      title: 'Solutions',
      type: 'text',
      rows: 3,
    },
    {
      name: 'results',
      title: 'Results',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'testimonial',
      title: 'Client Testimonial',
      type: 'object',
      fields: [
        {
          name: 'quote',
          title: 'Quote',
          type: 'text',
        },
        {
          name: 'author',
          title: 'Author',
          type: 'string',
        },
        {
          name: 'position',
          title: 'Position',
          type: 'string',
        },
        {
          name: 'rating',
          title: 'Rating (1-5)',
          type: 'number',
        },
      ],
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'locale',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'Vietnamese', value: 'vi' },
          { title: 'English', value: 'en' },
          { title: 'Chinese', value: 'zh' },
          { title: 'Indonesian', value: 'id' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'location.city',
      media: 'mainImage',
    },
  },
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [siteSettings, product, project],
}
