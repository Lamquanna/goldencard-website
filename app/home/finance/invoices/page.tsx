'use client'

import { InvoiceList } from '../../modules/finance/components/InvoiceList'

export default function InvoicesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý hóa đơn</h1>
      <InvoiceList />
    </div>
  )
}
