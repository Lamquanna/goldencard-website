import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HRM - Quản lý nhân sự | HOME Platform',
  description: 'Hệ thống quản lý nhân sự, chấm công, nghỉ phép và bảng lương',
}

export default function HRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
