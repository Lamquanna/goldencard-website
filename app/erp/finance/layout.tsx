import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finance | HOME Platform',
  description: 'Quản lý hóa đơn, thanh toán và chi phí',
}

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
