import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory | HOME Platform',
  description: 'Quản lý kho hàng, sản phẩm và xuất nhập tồn',
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
