import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects - Quản lý dự án | HOME Platform',
  description: 'Hệ thống quản lý dự án, công việc và tiến độ',
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
