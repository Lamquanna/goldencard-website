'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, Navigation, Activity, TrendingUp, Clock,
  Zap, AlertTriangle, CheckCircle2
} from 'lucide-react'
import type { LocationCheckHistory, CheckInLocation } from '../index'

// =============================================================================
// TRAVEL MODE DETECTOR
// =============================================================================

const TRAVEL_SPEED_THRESHOLD = 5 // m/s (18 km/h) - if moving faster, likely traveling
const TRAVEL_DISTANCE_THRESHOLD = 500 // meters - significant movement
const CHECK_INTERVAL = 30000 // Check every 30 seconds when in travel mode

interface TravelModeDetectorProps {
  isActive: boolean
  onTravelDetected: (isTraveling: boolean, distance: number, speed: number) => void
  checkInLocation?: CheckInLocation
  currentLocationHistory: LocationCheckHistory[]
}

export function useTravelModeDetector({
  isActive,
  onTravelDetected,
  checkInLocation,
  currentLocationHistory
}: TravelModeDetectorProps) {
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null)
  const [isTraveling, setIsTraveling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    const checkLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (lastPosition) {
            const distance = calculateDistance(
              lastPosition.coords.latitude,
              lastPosition.coords.longitude,
              position.coords.latitude,
              position.coords.longitude
            )

            const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000 // seconds
            const speed = distance / timeDiff // m/s

            // Detect travel mode
            const travelingNow = speed > TRAVEL_SPEED_THRESHOLD && distance > TRAVEL_DISTANCE_THRESHOLD

            if (travelingNow !== isTraveling) {
              setIsTraveling(travelingNow)
              onTravelDetected(travelingNow, distance, speed)
            }
          }
          setLastPosition(position)
        },
        (error) => {
          console.error('Location error:', error)
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      )
    }

    // Initial check
    checkLocation()

    // Set up interval
    intervalRef.current = setInterval(checkLocation, CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, lastPosition, isTraveling])

  return { isTraveling, lastPosition }
}

// =============================================================================
// REAL-TIME LOCATION TRACKER
// =============================================================================

interface RealTimeLocationTrackerProps {
  isCheckedIn: boolean
  checkInLocation?: CheckInLocation
  onLocationUpdate: (history: LocationCheckHistory) => void
  onAutoComplete?: () => void
}

export function RealTimeLocationTracker({
  isCheckedIn,
  checkInLocation,
  onLocationUpdate,
  onAutoComplete
}: RealTimeLocationTrackerProps) {
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
  const [locationHistory, setLocationHistory] = useState<LocationCheckHistory[]>([])
  const [isTravelMode, setIsTravelMode] = useState(false)
  const [travelStats, setTravelStats] = useState({
    distance: 0,
    speed: 0,
    duration: 0
  })
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number>()

  // Auto-detect travel mode
  const { isTraveling } = useTravelModeDetector({
    isActive: isCheckedIn,
    onTravelDetected: (traveling, distance, speed) => {
      if (traveling && !isTravelMode) {
        setIsTravelMode(true)
        console.log('🚗 Travel mode detected:', { distance, speed })
      } else if (!traveling && isTravelMode) {
        setIsTravelMode(false)
        // Auto-complete work day if traveled and returned
        if (locationHistory.length > 5) {
          console.log('✅ Auto-completing work day after travel')
          onAutoComplete?.()
        }
      }
    },
    checkInLocation,
    currentLocationHistory: locationHistory
  })

  // Watch position continuously
  useEffect(() => {
    if (!isCheckedIn) {
      if (watchIdRef.current !== undefined) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      return
    }

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition(position)
          setError(null)

          // Calculate distance from previous position
          let distanceFromPrevious = 0
          let speed = 0
          if (locationHistory.length > 0) {
            const lastCheck = locationHistory[locationHistory.length - 1]
            distanceFromPrevious = calculateDistance(
              lastCheck.latitude,
              lastCheck.longitude,
              position.coords.latitude,
              position.coords.longitude
            )
            const timeDiff = (Date.now() - new Date(lastCheck.timestamp).getTime()) / 1000
            speed = distanceFromPrevious / timeDiff
          }

          // Add to history
          const historyEntry: LocationCheckHistory = {
            timestamp: new Date(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationId: checkInLocation?.id,
            distanceFromPrevious,
            speed
          }

          setLocationHistory(prev => [...prev, historyEntry])
          onLocationUpdate(historyEntry)

          // Update travel stats
          setTravelStats(prev => ({
            distance: prev.distance + distanceFromPrevious,
            speed,
            duration: prev.duration + 30 // 30 seconds per check
          }))
        },
        (err) => {
          setError(err.message)
          console.error('Geolocation error:', err)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }

    return () => {
      if (watchIdRef.current !== undefined) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isCheckedIn, checkInLocation])

  if (!isCheckedIn) {
    return null
  }

  return (
    <Card className={isTravelMode ? 'border-green-500 bg-green-50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">📍 Vị Trí Real-time</CardTitle>
            <CardDescription>Cập nhật liên tục như Google Maps</CardDescription>
          </div>
          {isTravelMode && (
            <Badge className="bg-green-500 text-white">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              Đang di chuyển
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Position */}
        {currentPosition && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Navigation className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">Your Location</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Độ chính xác: ±{Math.round(currentPosition.coords.accuracy)}m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Travel Stats */}
        {isTravelMode && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-green-50 rounded-lg text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-semibold">{Math.round(travelStats.distance)}m</div>
              <div className="text-xs text-muted-foreground">Quãng đường</div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-center">
              <Zap className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-semibold">{Math.round(travelStats.speed * 3.6)}km/h</div>
              <div className="text-xs text-muted-foreground">Tốc độ</div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-semibold">{Math.round(travelStats.duration / 60)}p</div>
              <div className="text-xs text-muted-foreground">Thời gian</div>
            </div>
          </div>
        )}

        {/* Auto-complete Notice */}
        {isTravelMode && locationHistory.length > 5 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-semibold mb-1">Tự động hoàn thành ngày làm việc</div>
                <div className="text-muted-foreground">
                  Hệ thống phát hiện bạn đang di chuyển công tác. 
                  Check-in/out sẽ tự động xử lý khi kết thúc chuyến đi.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1 text-xs text-red-900">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Location History Count */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Đã ghi nhận {locationHistory.length} điểm vị trí
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}
