'use client'

import { 
  Package, Warehouse, TrendingUp, TrendingDown, AlertTriangle, 
  ArrowDownToLine, ArrowUpFromLine, ArrowRight, Box
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  MOCK_PRODUCTS, 
  MOCK_WAREHOUSES, 
  MOCK_MOVEMENTS,
  getStockStatus 
} from '../modules/inventory'

export default function InventoryDashboard() {
  // Calculate stats
  const totalProducts = MOCK_PRODUCTS.length
  const totalWarehouses = MOCK_WAREHOUSES.length
  const lowStockItems = MOCK_PRODUCTS.filter(p => p.totalStock < p.minStock).length
  const totalValue = MOCK_PRODUCTS.reduce((sum, p) => sum + (p.costPrice * p.totalStock), 0)

  // Recent movements
  const recentMovements = MOCK_MOVEMENTS.slice(0, 5)

  // Low stock alerts
  const lowStockProducts = MOCK_PRODUCTS.filter(p => p.totalStock < p.minStock)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-amber-500" />
            Quản lý Kho
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi sản phẩm, tồn kho và xuất nhập hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/erp/inventory/stock-in">
            <Button variant="outline">
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Nhập kho
            </Button>
          </Link>
          <Link href="/erp/inventory/stock-out">
            <Button variant="outline">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Xuất kho
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> sản phẩm mới tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kho hàng</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWarehouses}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tồn kho thấp</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Cần bổ sung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trị tồn kho</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND', 
                notation: 'compact' 
              }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Theo giá vốn</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>Nhập xuất kho trong 7 ngày qua</CardDescription>
            </div>
            <Link href="/erp/inventory/movements">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMovements.map((movement) => {
                const product = MOCK_PRODUCTS.find(p => p.id === movement.productId)
                return (
                  <div key={movement.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        movement.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {movement.type === 'in' ? (
                          <ArrowDownToLine className="h-4 w-4" />
                        ) : (
                          <ArrowUpFromLine className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{movement.movementNumber}</p>
                        <p className="text-sm text-muted-foreground">{product?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Cảnh báo tồn kho
            </CardTitle>
            <CardDescription>Sản phẩm cần bổ sung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tất cả sản phẩm đều đủ tồn kho
                </p>
              ) : (
                lowStockProducts.map((product) => {
                  const status = getStockStatus(product.totalStock, product.minStock)
                  return (
                    <div key={product.id} className="flex items-center justify-between p-2 rounded bg-yellow-50 border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="font-medium text-sm">{product.sku}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        {product.totalStock}/{product.minStock}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/erp/inventory/products">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Package className="h-8 w-8 text-amber-500 mb-2" />
              <span className="font-medium">Sản phẩm</span>
              <span className="text-sm text-muted-foreground">{totalProducts} items</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/erp/inventory/warehouses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Warehouse className="h-8 w-8 text-blue-500 mb-2" />
              <span className="font-medium">Kho hàng</span>
              <span className="text-sm text-muted-foreground">{totalWarehouses} kho</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/erp/inventory/stock-in">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <ArrowDownToLine className="h-8 w-8 text-green-500 mb-2" />
              <span className="font-medium">Nhập kho</span>
              <span className="text-sm text-muted-foreground">Tạo phiếu nhập</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/erp/inventory/stock-out">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <ArrowUpFromLine className="h-8 w-8 text-red-500 mb-2" />
              <span className="font-medium">Xuất kho</span>
              <span className="text-sm text-muted-foreground">Tạo phiếu xuất</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
