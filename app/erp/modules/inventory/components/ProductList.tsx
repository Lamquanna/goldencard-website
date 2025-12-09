'use client'

import { useState } from 'react'
import { 
  Package, Search, Plus, Filter, Download, Upload, BarChart3,
  ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye, QrCode, AlertTriangle, Box
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Product, 
  ProductCategory, 
  MOCK_PRODUCTS, 
  MOCK_CATEGORIES, 
  PRODUCT_STATUS_CONFIG,
  getStockStatus,
  formatQuantity
} from '../index'

interface ProductListProps {
  products?: Product[]
  categories?: ProductCategory[]
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
}

export function ProductList({ 
  products = MOCK_PRODUCTS, 
  categories = MOCK_CATEGORIES,
  onEdit,
  onDelete,
  onView
}: ProductListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'sku' | 'stock'>('name')

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = search === '' || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sku': return a.sku.localeCompare(b.sku)
        case 'stock': return b.totalStock - a.totalStock
        default: return a.name.localeCompare(b.name)
      }
    })

  // Stats
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.totalStock < p.minStock).length
  const outOfStockProducts = products.filter(p => p.totalStock === 0).length
  const totalValue = products.reduce((sum, p) => sum + (p.costPrice * p.totalStock), 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{categories.length} danh mục</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tồn kho thấp</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Cần nhập thêm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <Box className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">Cần bổ sung ngay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trị tồn kho</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Theo giá vốn</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nameVi || cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang bán</SelectItem>
              <SelectItem value="inactive">Ngừng bán</SelectItem>
              <SelectItem value="discontinued">Ngừng SX</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[150px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Tên A-Z</SelectItem>
              <SelectItem value="sku">SKU</SelectItem>
              <SelectItem value="stock">Tồn kho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Nhập
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá vốn</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const category = categories.find(c => c.id === product.categoryId)
                const stockStatus = getStockStatus(product.totalStock, product.minStock, product.maxStock)
                const statusConfig = PRODUCT_STATUS_CONFIG[product.status]

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover rounded" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.barcode && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <QrCode className="h-3 w-3" />
                              {product.barcode}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category?.nameVi || category?.name || '-'}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('vi-VN').format(product.costPrice)} đ
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('vi-VN').format(product.sellingPrice)} đ
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{formatQuantity(product.totalStock, product.unit)}</span>
                        <Badge variant="outline" className={stockStatus.color}>
                          {stockStatus.labelVi}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={statusConfig.color}>
                        {statusConfig.labelVi}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView?.(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {filteredProducts.length} / {products.length} sản phẩm
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Trước
          </Button>
          <Button variant="outline" size="sm" disabled>
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}
