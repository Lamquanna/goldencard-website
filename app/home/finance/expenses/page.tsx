'use client'

import { ExpenseList } from '../../modules/finance/components/ExpenseList'

export default function ExpensesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý chi phí</h1>
      <ExpenseList />
    </div>
  )
}
