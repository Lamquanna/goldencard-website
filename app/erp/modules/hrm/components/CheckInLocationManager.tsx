'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Building2, HardHat, MapPin, Calendar, Plane, Users,
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, MapPinned,
  Navigation, CheckCircle2, XCircle, Archive, Clock, User
} from 'lucide-react'
import type { CheckInLocation, LocationType, LocationStatus } from '../index'
import { LOCATION_TYPE_CONFIG } from '../index'

// =============================================================================
// MOCK DATA - Replace with real API calls
// =============================================================================

const MOCK_LOCATIONS: CheckInLocation[] = [
  {
    id: 'loc-001',
    locationCode: 'GES-LOC-001',
    locationName: 'Văn phòng Golden Energy HCM',
    locationType: 'office',
    address: '123 Nguyễn Văn Linh, Q7, TP.HCM',
    latitude: 10.7412,
    longitude: 106.7197,
    radius: 200,
    status: 'active',
    usageCount: 1250,
    lastUsedDate: new Date('2026-01-09T08:30:00'),
    createdBy: 'emp-001',
    createdByName: 'Jimmy Ha',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2026-01-09'),
    allowCheckOut: true,
    requirePhoto: false,
    notes: 'Văn phòng chính'
  },
  {
    id: 'loc-002',
    locationCode: 'GES-LOC-002',
    locationName: 'Nhà máy điện mặt trời Bình Dương',
    locationType: 'project_site',
    address: 'KCN Việt Hương, Bình Dương',
    latitude: 10.9804,
    longitude: 106.6519,
    radius: 300,
    status: 'active',
    projectId: 'proj-001',
    usageCount: 340,
    lastUsedDate: new Date('2026-01-09T07:00:00'),
    createdBy: 'emp-002',
    createdByName: 'Rita Kim Anh',
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2026-01-09'),
    allowCheckOut: true,
    requirePhoto: true,
    notes: 'Công trường chính - yêu cầu chụp ảnh'
  },
  {
    id: 'loc-003',
    locationCode: 'GES-LOC-003',
    locationName: 'Team Building Vũng Tàu',
    locationType: 'teambuilding',
    address: 'Resort Sunrise, Vũng Tàu',
    latitude: 10.3460,
    longitude: 107.0843,
    radius: 500,
    status: 'disabled',
    eventId: 'event-001',
    usageCount: 45,
    lastUsedDate: new Date('2025-12-20'),
    createdBy: 'emp-001',
    createdByName: 'Jimmy Ha',
    createdAt: new Date('2025-12-15'),
    updatedAt: new Date('2025-12-21'),
    allowCheckOut: true,
    requirePhoto: false,
    notes: 'Đã kết thúc, có thể forget'
  }
]

// =============================================================================
// LOCATION CARD COMPONENT
// =============================================================================

interface LocationCardProps {
  location: CheckInLocation
  onEdit: (location: CheckInLocation) => void
  onToggle: (location: CheckInLocation) => void
  onArchive: (location: CheckInLocation) => void
}

function LocationCard({ location, onEdit, onToggle, onArchive }: LocationCardProps) {
  const config = LOCATION_TYPE_CONFIG[location.locationType]
  const IconComponent = location.locationType === 'office' ? Building2 :
                       location.locationType === 'project_site' ? HardHat :
                       location.locationType === 'task_location' ? MapPin :
                       location.locationType === 'event' ? Calendar :
                       location.locationType === 'business_trip' ? Plane : Users

  const isActive = location.status === 'active'
  const isArchived = location.status === 'archived'

  return (
    <Card className={`relative ${isActive ? 'border-green-200 bg-green-50/30' : isArchived ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
              <IconComponent className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {location.locationCode}
                </Badge>
                {isActive ? (
                  <Badge className="bg-green-500 text-white text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : isArchived ? (
                  <Badge variant="secondary" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {config.labelVi}
                </Badge>
              </div>
              <CardTitle className="text-base mb-1">{location.locationName}</CardTitle>
              <CardDescription className="text-xs">
                <MapPin className="h-3 w-3 inline mr-1" />
                {location.address}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Đã dùng</div>
            <div className="font-semibold text-sm">{location.usageCount}</div>
          </div>
          <div className="text-center border-x">
            <div className="text-xs text-muted-foreground mb-1">Bán kính</div>
            <div className="font-semibold text-sm">{location.radius}m</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Dùng lần cuối</div>
            <div className="font-semibold text-sm">
              {location.lastUsedDate ? new Date(location.lastUsedDate).toLocaleDateString('vi-VN') : 'Chưa dùng'}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span>Tạo bởi: {location.createdByName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Tạo lúc: {new Date(location.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          {location.notes && (
            <div className="flex items-start gap-2">
              <MapPinned className="h-3 w-3 mt-0.5" />
              <span>{location.notes}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(location)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Sửa
          </Button>
          <Button
            variant={isActive ? 'outline' : 'default'}
            size="sm"
            className="flex-1"
            onClick={() => onToggle(location)}
            disabled={isArchived}
          >
            {isActive ? (
              <>
                <ToggleLeft className="h-3 w-3 mr-1" />
                Tắt
              </>
            ) : (
              <>
                <ToggleRight className="h-3 w-3 mr-1" />
                Bật
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onArchive(location)}
            disabled={isArchived}
          >
            {isArchived ? (
              <Archive className="h-3 w-3" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// LOCATION FORM DIALOG
// =============================================================================

interface LocationFormDialogProps {
  location?: CheckInLocation
  onSave: (location: Partial<CheckInLocation>) => void
  onCancel: () => void
}

function LocationFormDialog({ location, onSave, onCancel }: LocationFormDialogProps) {
  const [formData, setFormData] = useState<Partial<CheckInLocation>>(
    location || {
      locationName: '',
      locationType: 'office',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 200,
      status: 'active',
      allowCheckOut: true,
      requirePhoto: false,
      notes: ''
    }
  )

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Không thể lấy vị trí hiện tại. Vui lòng bật GPS.')
        }
      )
    } else {
      alert('Trình duyệt không hỗ trợ GPS')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="locationName">Tên địa điểm *</Label>
        <Input
          id="locationName"
          value={formData.locationName}
          onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
          placeholder="VD: Văn phòng HCM, Công trường Bình Dương..."
        />
      </div>

      <div>
        <Label htmlFor="locationType">Loại địa điểm *</Label>
        <Select
          value={formData.locationType}
          onValueChange={(value) => setFormData({ ...formData, locationType: value as LocationType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOCATION_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.labelVi} - {config.descriptionVi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Địa chỉ *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Nguyễn Văn Linh, Q7, TP.HCM"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Vĩ độ (Latitude) *</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Kinh độ (Longitude) *</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGetCurrentLocation}
      >
        <Navigation className="h-4 w-4 mr-2" />
        Lấy vị trí hiện tại
      </Button>

      <div>
        <Label htmlFor="radius">Bán kính check-in (mét) *</Label>
        <Input
          id="radius"
          type="number"
          value={formData.radius}
          onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Mặc định: 200m (khuyến nghị 100-500m)
        </p>
      </div>

      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowCheckOut" className="font-normal">Cho phép check-out</Label>
            <p className="text-xs text-muted-foreground">Nhân viên có thể check-out tại đây</p>
          </div>
          <Switch
            id="allowCheckOut"
            checked={formData.allowCheckOut}
            onCheckedChange={(checked) => setFormData({ ...formData, allowCheckOut: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="requirePhoto" className="font-normal">Yêu cầu chụp ảnh</Label>
            <p className="text-xs text-muted-foreground">Bắt buộc chụp ảnh khi check-in</p>
          </div>
          <Switch
            id="requirePhoto"
            checked={formData.requirePhoto}
            onCheckedChange={(checked) => setFormData({ ...formData, requirePhoto: checked })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Thông tin bổ sung về địa điểm..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Hủy
        </Button>
        <Button className="flex-1" onClick={() => onSave(formData)}>
          {location ? 'Cập nhật' : 'Tạo địa điểm'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CheckInLocationManager() {
  const [locations, setLocations] = useState<CheckInLocation[]>(MOCK_LOCATIONS)
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<CheckInLocation | undefined>()

  const filteredLocations = locations.filter(loc => {
    const matchesFilter = filter === 'all' || loc.status === filter
    const matchesSearch = loc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loc.address.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleToggle = (location: CheckInLocation) => {
    setLocations(locations.map(loc =>
      loc.id === location.id
        ? { ...loc, status: loc.status === 'active' ? 'disabled' : 'active', updatedAt: new Date() }
        : loc
    ))
  }

  const handleArchive = (location: CheckInLocation) => {
    if (confirm(`Bạn có chắc muốn forget địa điểm "${location.locationName}"?`)) {
      setLocations(locations.map(loc =>
        loc.id === location.id
          ? { ...loc, status: 'archived', updatedAt: new Date() }
          : loc
      ))
    }
  }

  const handleSave = (data: Partial<CheckInLocation>) => {
    if (editingLocation) {
      // Update
      setLocations(locations.map(loc =>
        loc.id === editingLocation.id
          ? { ...loc, ...data, updatedAt: new Date() }
          : loc
      ))
    } else {
      // Create
      const newLocation: CheckInLocation = {
        id: `loc-${Date.now()}`,
        locationCode: `GES-LOC-${String(locations.length + 1).padStart(3, '0')}`,
        usageCount: 0,
        createdBy: 'emp-001',
        createdByName: 'Current User',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      } as CheckInLocation
      setLocations([newLocation, ...locations])
    }
    setIsCreateDialogOpen(false)
    setEditingLocation(undefined)
  }

  const stats = {
    total: locations.length,
    active: locations.filter(l => l.status === 'active').length,
    disabled: locations.filter(l => l.status === 'disabled').length,
    archived: locations.filter(l => l.status === 'archived').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Quản Lý Địa Điểm Check-in</h2>
        <p className="text-muted-foreground">
          Giống như WiFi Manager trên iPhone - quản lý tất cả địa điểm check-in, bật/tắt, forget
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Tổng số</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-green-50" onClick={() => setFilter('active')}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Đang bật</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('disabled')}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.disabled}</div>
              <div className="text-xs text-muted-foreground">Đã tắt</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('archived')}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{stats.archived}</div>
              <div className="text-xs text-muted-foreground">Đã forget</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Input
          placeholder="Tìm kiếm địa điểm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo địa điểm mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo địa điểm check-in mới</DialogTitle>
              <DialogDescription>
                Lãnh đạo/Quản lý dự án có thể tạo địa điểm check-in cho team
              </DialogDescription>
            </DialogHeader>
            <LocationFormDialog
              onSave={handleSave}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Location List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map(location => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={(loc) => {
              setEditingLocation(loc)
              setIsCreateDialogOpen(true)
            }}
            onToggle={handleToggle}
            onArchive={handleArchive}
          />
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Không tìm thấy địa điểm nào</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLocation} onOpenChange={() => setEditingLocation(undefined)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa địa điểm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin địa điểm check-in
            </DialogDescription>
          </DialogHeader>
          {editingLocation && (
            <LocationFormDialog
              location={editingLocation}
              onSave={handleSave}
              onCancel={() => setEditingLocation(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
