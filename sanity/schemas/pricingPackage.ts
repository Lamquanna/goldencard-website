import { defineType, defineField } from 'sanity';

export const pricingPackage = defineType({
  name: 'pricingPackage',
  title: 'Pricing Packages',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Package Name',
      type: 'object',
      fields: [
        { name: 'vi', title: 'Vietnamese', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
        { name: 'zh', title: 'Chinese', type: 'string' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name.vi',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: '1 Phase (Hộ Gia Đình)', value: '1phase' },
          { title: '3 Phase (Có Lưu Trữ)', value: '3phase-storage' },
          { title: 'C&I (Không Lưu Trữ)', value: 'ci-ongrid' },
          { title: 'BESS (Battery Storage)', value: 'bess' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity (kW)',
      type: 'number',
      description: 'System capacity in kilowatts',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'priceBeforeVAT',
      title: 'Price Before VAT (million VND)',
      type: 'number',
      description: 'Price in million VND, before 8% VAT',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'priceAfterVAT',
      title: 'Price After VAT (million VND)',
      type: 'number',
      description: 'Price with 8% VAT included (auto-calculated)',
    }),
    defineField({
      name: 'components',
      title: 'System Components',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Component Name',
              type: 'object',
              fields: [
                { name: 'vi', title: 'Vietnamese', type: 'string' },
                { name: 'en', title: 'English', type: 'string' },
                { name: 'zh', title: 'Chinese', type: 'string' },
              ],
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'string',
              description: 'e.g., "9 tấm", "1 bộ", "Gói trọn"',
            },
            {
              name: 'icon',
              title: 'Icon Emoji',
              type: 'string',
              description: 'Emoji icon (e.g., 🔆, ⚡, 🔋)',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'suitableFor',
      title: 'Suitable For',
      type: 'object',
      fields: [
        { name: 'vi', title: 'Vietnamese', type: 'text', rows: 2 },
        { name: 'en', title: 'English', type: 'text', rows: 2 },
        { name: 'zh', title: 'Chinese', type: 'text', rows: 2 },
      ],
      description: 'Target customer profile',
    }),
    defineField({
      name: 'monthlyConsumption',
      title: 'Monthly Consumption (kWh)',
      type: 'object',
      fields: [
        { name: 'min', title: 'Minimum', type: 'number' },
        { name: 'max', title: 'Maximum', type: 'number' },
      ],
      description: 'Typical monthly electricity consumption range',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Package',
      type: 'boolean',
      description: 'Show as recommended/popular choice',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Sort order (lower number = higher priority)',
      validation: (Rule) => Rule.integer(),
    }),
    defineField({
      name: 'warranty',
      title: 'Warranty Information',
      type: 'object',
      fields: [
        {
          name: 'panels',
          title: 'Solar Panels (years)',
          type: 'number',
          initialValue: 25,
        },
        {
          name: 'inverter',
          title: 'Inverter (years)',
          type: 'number',
          initialValue: 10,
        },
        {
          name: 'battery',
          title: 'Battery (years)',
          type: 'number',
          initialValue: 10,
        },
      ],
    }),
    defineField({
      name: 'installationTime',
      title: 'Installation Time',
      type: 'object',
      fields: [
        { name: 'vi', title: 'Vietnamese', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
        { name: 'zh', title: 'Chinese', type: 'string' },
      ],
      description: 'e.g., "3-5 ngày", "1-2 tuần"',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Display this package on website',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name.vi',
      capacity: 'capacity',
      price: 'priceBeforeVAT',
      category: 'category',
    },
    prepare({ title, capacity, price, category }) {
      return {
        title: `${title} (${capacity}kW)`,
        subtitle: `${price} triệu VNĐ - ${category}`,
      };
    },
  },
  orderings: [
    {
      title: 'Capacity',
      name: 'capacityAsc',
      by: [{ field: 'capacity', direction: 'asc' }],
    },
    {
      title: 'Price',
      name: 'priceAsc',
      by: [{ field: 'priceBeforeVAT', direction: 'asc' }],
    },
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
});
