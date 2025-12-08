import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CRM - GoldenHome',
  description: 'Quản lý quan hệ khách hàng - Sales Pipeline, Leads, Deals',
};

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
