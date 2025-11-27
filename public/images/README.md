# GoldenEnergy Images

## Directory Structure

- **panels/** - Solar panel product images
  - mono-perc-450w.jpg (Monocrystalline PERC 450W)
  - poly-330w.jpg (Polycrystalline 330W)
  - bifacial-500w.jpg (Bifacial 500W)
  - high-eff-550w.jpg (High-efficiency 550W)

- **inverters/** - Inverter product images
  - huawei-hybrid.jpg (Huawei Hybrid Inverter)
  - sma-sunny.jpg (SMA Sunny Boy)
  - growatt-grid.jpg (Growatt Grid-tie)
  - fronius-primo.jpg (Fronius Primo)

- **wind/** - Wind turbine images
  - horizontal-axis-100kw.jpg
  - vertical-axis-50kw.jpg
  - wind-farm-500kw.jpg

- **projects/** - Completed project photos
  - binh-duong-factory.jpg (Bình Dương Factory 1MW Solar)
  - phu-quoc-resort.jpg (Phú Quốc Resort Hybrid)
  - hcmc-office.jpg (HCMC Office Building Solar)
  - ninh-thuan-wind.jpg (Ninh Thuận Wind Farm)
  - danang-microgrid.jpg (Đà Nẵng Microgrid)

- **iot/** - IoT platform screenshots
  - dashboard-realtime.jpg (Dashboard interface)
  - mobile-app.jpg (Mobile app screenshot)
  - analytics.jpg (AI analytics screen)

- **team/** - Team member photos
  - ceo-placeholder.jpg
  - cto-placeholder.jpg
  - lead-engineer.jpg

## Image Requirements

- Format: JPG or PNG
- Size: 1200x800px (landscape) or 800x1200px (portrait)
- Quality: High resolution, optimized for web
- File size: < 500KB per image

## Usage

Images are referenced in components using Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/images/projects/phu-quoc-resort.jpg"
  alt="Phu Quoc Resort Hybrid System"
  width={1200}
  height={800}
  className="object-cover"
/>
```

## Placeholder Images

For development, you can use placeholder services:
- https://placehold.co/1200x800/0A0A0A/FFFFFF?text=Project+Name
- https://via.placeholder.com/1200x800/0A0A0A/FFFFFF?text=Solar+Panel
