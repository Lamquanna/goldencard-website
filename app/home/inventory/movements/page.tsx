'use client'

import { StockMovementList } from '../../modules/inventory/components/StockMovementList'

export default function StockMovementsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử xuất nhập kho</h1>
      <StockMovementList />
    </div>
  )
}
