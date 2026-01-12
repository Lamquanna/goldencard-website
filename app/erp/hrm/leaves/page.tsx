'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LeaveManagement } from '@/app/erp/modules/hrm/components/LeaveManagement'

export default function LeavesPage() {
  return (
    <div className="p-6 space-y-4">
      {/* Back Button */}
      <div>
        <Link href="/erp/hrm">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Nhân sự
          </Button>
        </Link>
      </div>
      
      <LeaveManagement />
    </div>
  )
}
