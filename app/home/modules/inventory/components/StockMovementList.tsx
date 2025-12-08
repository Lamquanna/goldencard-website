'use client'

import { useState } from 'react'
import { 
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, RefreshCw, RotateCcw,
  Search, Filter, Calendar, Download, Plus, Package, Warehouse as WarehouseIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  StockMovement, 
  MovementType, 
  MOVEMENT_TYPE_CONFIG,
  MOCK_MOVEMENTS,
  MOCK_PRODUCTS,
  MOCK_WAREHOUSES
} from '../index'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface StockMovementListProps {
  movements?: StockMovement[]
  type?: MovementType
  onCreateMovement?: () => void
}

export function StockMovementList({ 
  movements = MOCK_MOVEMENTS,
  type,
  onCreateMovement
}: StockMovementListProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(type || 'all')
  const [dateRange, setDateRange] = useState<string>('all')

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = search === '' || 
      movement.movementNumber.toLowerCase().includes(search.toLowerCase()) ||
      movement.referenceNumber?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || movement.type === typeFilter
    return matchesSearch && matchesType
  })

  // Stats by type
  const stats = {
    in: movements.filter(m => m.type === 'in').length,
    out: movements.filter(m => m.type === 'out').length,
    transfer: movements.filter(m => m.type === 'transfer').length,
    adjustment: movements.filter(m => m.type === 'adjustment').length,
  }

  const getIcon = (movementType: MovementType) => {
    switch (movementType) {
      case 'in': return <ArrowDownToLine className="h-4 w-4" />
      case 'out': return <ArrowUpFromLine className="h-4 w-4" />
      case 'transfer': return <ArrowLeftRight className="h-4 w-4" />
      case 'adjustment': return <RefreshCw className="h-4 w-4" />
      case 'return': return <RotateCcw className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(stats) as [MovementType, number][]).map(([key, count]) => {
          const config = MOVEMENT_TYPE_CONFIG[key]
          return (
            <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setTypeFilter(key)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.labelVi}</CardTitle>
                <span className={config.color}>{getIcon(key)}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">giao dịch</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã phiếu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(MOVEMENT_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.labelVi}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button size="sm" onClick={onCreateMovement}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiếu
          </Button>
        </div>
      </div>

      {/* Movements List */}
      <div className="space-y-3">
        {filteredMovements.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Không có giao dịch nào
          </Card>
        ) : (
          filteredMovements.map((movement) => {
            const product = MOCK_PRODUCTS.find(p => p.id === movement.productId)
            const sourceWh = MOCK_WAREHOUSES.find(w => w.id === movement.sourceWarehouseId)
            const destWh = MOCK_WAREHOUSES.find(w => w.id === movement.destinationWarehouseId)
            const config = MOVEMENT_TYPE_CONFIG[movement.type]

            return (
              <Card key={movement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                        {getIcon(movement.type)}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{movement.movementNumber}</span>
                          <Badge variant="outline" className={config.color}>
                            {config.labelVi}
                          </Badge>
                          <Badge variant="outline" className={
                            movement.status === 'completed' ? 'bg-green-100 text-green-800' :
                            movement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {movement.status === 'completed' ? 'Hoàn thành' :
                             movement.status === 'pending' ? 'Chờ duyệt' : 
                             movement.status === 'draft' ? 'Nháp' : 'Đã hủy'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {product?.name || 'Unknown Product'}
                          </div>
                          <span className="font-medium text-foreground">
                            {movement.type === 'out' ? '-' : '+'}{movement.quantity} {product?.unit || 'pcs'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {sourceWh && (
                            <div className="flex items-center gap-1">
                              <WarehouseIcon className="h-4 w-4" />
                              Từ: {sourceWh.nameVi || sourceWh.name}
                            </div>
                          )}
                          {destWh && (
                            <div className="flex items-center gap-1">
                              <WarehouseIcon className="h-4 w-4" />
                              Đến: {destWh.nameVi || destWh.name}
                            </div>
                          )}
                          {movement.referenceNumber && (
                            <span>Ref: {movement.referenceNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">
                        {format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Trước: {movement.previousQuantity} → Sau: {movement.newQuantity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
