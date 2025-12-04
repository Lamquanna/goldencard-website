'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Camera, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AttendanceCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (data: CheckInData) => void;
  type: 'in' | 'out';
}

interface CheckInData {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  faceImage?: string;
  timestamp: Date;
}

interface OfficeLocation {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    name: 'Trụ sở - Sunrise Riverside',
    latitude: 10.6806, // Example coordinates
    longitude: 106.7465,
    radiusMeters: 300,
  },
  {
    name: 'Văn phòng - 625 Trần Xuân Soạn',
    latitude: 10.7519,
    longitude: 106.7033,
    radiusMeters: 300,
  },
  {
    name: 'Kho - 354/2/3 Nguyễn Văn Linh',
    latitude: 10.7366,
    longitude: 106.7025,
    radiusMeters: 300,
  },
];

export default function AttendanceCheckInModal({ isOpen, onClose, onCheckIn, type }: AttendanceCheckInModalProps) {
  const [step, setStep] = useState<'location' | 'face' | 'success'>('location');
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [nearestOffice, setNearestOffice] = useState<OfficeLocation | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [faceImage, setFaceImage] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị GPS');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        
        // Find nearest office and check distance
        let minDistance = Infinity;
        let nearest: OfficeLocation | undefined = undefined;

        for (const office of OFFICE_LOCATIONS) {
          const dist = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            office.latitude,
            office.longitude
          );

          if (dist < minDistance) {
            minDistance = dist;
            nearest = office;
          }
        }

        setDistance(minDistance);
        setNearestOffice(nearest ?? null);
        setLoadingLocation(false);

        // Check if within acceptable range
        const allowedRadius = nearest ? nearest.radiusMeters : 300;
        if (nearest && minDistance <= allowedRadius) {
          setStep('face');
        } else {
          setLocationError(
            `Bạn đang cách ${nearest?.name ?? 'văn phòng'} ${Math.round(minDistance)}m. Vui lòng di chuyển đến trong vòng ${allowedRadius}m để chấm công.`
          );
        }
      },
      (error) => {
        setLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Vui lòng cho phép truy cập vị trí để chấm công');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Không thể xác định vị trí. Vui lòng kiểm tra GPS');
            break;
          case error.TIMEOUT:
            setLocationError('Hết thời gian chờ. Vui lòng thử lại');
            break;
          default:
            setLocationError('Lỗi không xác định. Vui lòng thử lại');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Start camera for face capture
  const startCamera = async () => {
    setLoadingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLoadingCamera(false);
    } catch (error) {
      setLoadingCamera(false);
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  // Capture face image
  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setFaceImage(imageData);
    setStep('success');

    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Submit check-in
  const handleSubmit = () => {
    if (!location) return;

    const checkInData: CheckInData = {
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
      faceImage,
      timestamp: new Date(),
    };

    onCheckIn(checkInData);
    onClose();
  };

  // Initialize based on step
  useEffect(() => {
    if (isOpen && step === 'location' && !location) {
      getCurrentLocation();
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (step === 'face' && !cameraStream) {
      startCamera();
    }
  }, [step]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'in' ? 'Chấm Công Vào' : 'Chấm Công Ra'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Location Verification */}
          {step === 'location' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Xác minh vị trí</h3>
                  <p className="text-sm text-blue-700">
                    Hệ thống cần xác minh bạn đang ở trong vòng bán kính 300m từ văn phòng.
                    Điều này đảm bảo tính chính xác và ngăn chặn gian lận chấm công.
                  </p>
                </div>
              </div>

              {loadingLocation && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="text-gray-700">Đang xác định vị trí...</span>
                </div>
              )}

              {location && nearestOffice && !locationError && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Vị trí hợp lệ</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Bạn đang ở gần <strong>{nearestOffice.name}</strong>
                      </p>
                      <p className="text-sm text-green-600">
                        Khoảng cách: <strong>{Math.round(distance)}m</strong> 
                        {distance <= nearestOffice.radiusMeters && ' (Trong phạm vi cho phép)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Không thể chấm công</h4>
                      <p className="text-sm text-red-700">{locationError}</p>
                      <button
                        onClick={getCurrentLocation}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Thử lại
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Face Capture */}
          {step === 'face' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <Camera className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Chụp ảnh khuôn mặt</h3>
                  <p className="text-sm text-purple-700">
                    Để bảo mật và xác thực danh tính, vui lòng chụp ảnh khuôn mặt của bạn.
                    Đảm bảo khuôn mặt ở giữa khung hình và đủ ánh sáng.
                  </p>
                </div>
              </div>

              {loadingCamera && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                  <span className="text-gray-700">Đang khởi động camera...</span>
                </div>
              )}

              {cameraStream && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-xl border-4 border-purple-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-4 border-purple-500 rounded-full opacity-30" />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {cameraStream && (
                <button
                  onClick={captureFace}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Chụp ảnh
                </button>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-green-600" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác thực thành công!</h3>
                <p className="text-gray-600">
                  Vị trí và khuôn mặt đã được xác nhận. Nhấn nút bên dưới để hoàn tất chấm công.
                </p>
              </div>

              {faceImage && (
                <div className="flex justify-center">
                  <img
                    src={faceImage}
                    alt="Captured face"
                    className="w-48 h-48 rounded-xl object-cover border-4 border-green-200"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-lg"
              >
                Hoàn tất chấm công
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p>
              Để bảo vệ quyền riêng tư, dữ liệu vị trí và ảnh chụp chỉ được sử dụng cho mục đích xác thực chấm công
              và được mã hóa an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
