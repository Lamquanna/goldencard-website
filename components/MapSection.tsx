'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  BuildingOffice2Icon,
  GlobeAltIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { locations, Location, LOCATION_TYPE_CONFIG, GOLDENENERGY_INFO } from '@/lib/locations-data';

interface MapSectionProps {
  title?: string;
  subtitle?: string;
  showAllLocations?: boolean;
  className?: string;
}

export default function MapSection({ 
  title = "Trụ Sở Chính",
  subtitle = "Liên hệ với chúng tôi",
  showAllLocations = true,
  className = ""
}: MapSectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Lấy location chính hoặc tất cả
  const displayLocations = showAllLocations ? locations : locations.filter(l => l.type === 'headquarters');
  const mainLocation = displayLocations[0];

  // Tạo URL cho OpenStreetMap embed
  const getMapEmbedUrl = (lat: number, lng: number, zoom: number = 16) => {
    // Sử dụng OpenStreetMap iframe embed miễn phí
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.003},${lng + 0.005},${lat + 0.003}&layer=mapnik&marker=${lat},${lng}`;
  };

  // URL mở Google Maps để chỉ đường
  const getDirectionsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  // URL xem trên OpenStreetMap
  const getOSMViewUrl = (lat: number, lng: number) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <section className={`relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white ${className}`}>
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            {subtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600">
            Ghé thăm văn phòng của chúng tôi hoặc liên hệ để được tư vấn miễn phí về giải pháp năng lượng tái tạo
          </p>
        </motion.div>
      </div>

      {/* Map Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <motion.div 
            className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-xl bg-gray-100"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="aspect-[4/3] lg:aspect-[16/10] relative">
              {/* Loading State */}
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-gray-500">Đang tải bản đồ...</span>
                  </div>
                </div>
              )}
              
              {/* OpenStreetMap Embed */}
              <iframe
                src={getMapEmbedUrl(mainLocation.coordinates.lat, mainLocation.coordinates.lng)}
                className="w-full h-full border-0"
                onLoad={() => setMapLoaded(true)}
                title="Vị trí GoldenEnergy"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Map Actions Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <a
                  href={getOSMViewUrl(mainLocation.coordinates.lat, mainLocation.coordinates.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center gap-2"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  Xem bản đồ lớn
                </a>
                <a
                  href={getDirectionsUrl(mainLocation.coordinates.lat, mainLocation.coordinates.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  Chỉ đường
                </a>
              </div>
            </div>
          </motion.div>

          {/* Location Info Cards */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {displayLocations.map((location, index) => {
              const typeConfig = LOCATION_TYPE_CONFIG[location.type];
              
              return (
                <div
                  key={location.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    selectedLocation?.id === location.id 
                      ? 'border-green-500 bg-green-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                  onClick={() => handleLocationClick(location)}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                         style={{ backgroundColor: typeConfig.color }}>
                      <BuildingOffice2Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1"
                            style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}>
                        {typeConfig.label}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {location.name}
                      </h3>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{location.address}</span>
                    </div>
                    
                    {location.phone && (
                      <a 
                        href={`tel:${location.phone}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PhoneIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>{location.phone}</span>
                      </a>
                    )}
                    
                    {location.email && (
                      <a 
                        href={`mailto:${location.email}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>{location.email}</span>
                      </a>
                    )}

                    {location.operatingHours && (
                      <div className="flex items-start gap-3">
                        <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="text-gray-600">
                          <div>T2-T6: {location.operatingHours.weekday}</div>
                          <div>T7: {location.operatingHours.saturday}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                    <a
                      href={getDirectionsUrl(location.coordinates.lat, location.coordinates.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Chỉ đường
                    </a>
                    <a
                      href={`tel:${location.phone || GOLDENENERGY_INFO.phone}`}
                      className="flex-1 py-2 border border-green-600 text-green-600 hover:bg-green-50 text-sm font-medium rounded-lg text-center transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>
              );
            })}

            {/* Company Info Summary */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white">
              <h3 className="text-lg font-bold mb-4">{GOLDENENERGY_INFO.companyName}</h3>
              <p className="text-green-100 text-sm mb-4">{GOLDENENERGY_INFO.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4 text-green-300" />
                  <a 
                    href={`https://${GOLDENENERGY_INFO.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-100 hover:text-white transition-colors"
                  >
                    {GOLDENENERGY_INFO.website}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-green-300" />
                  <a 
                    href={`tel:${GOLDENENERGY_INFO.phone}`}
                    className="text-green-100 hover:text-white transition-colors"
                  >
                    {GOLDENENERGY_INFO.phone}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Location Detail Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLocation(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Map Preview */}
              <div className="relative h-48">
                <iframe
                  src={getMapEmbedUrl(selectedLocation.coordinates.lat, selectedLocation.coordinates.lng, 18)}
                  className="w-full h-full border-0"
                  title={`Vị trí ${selectedLocation.name}`}
                />
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: LOCATION_TYPE_CONFIG[selectedLocation.type].color }}
                  >
                    <BuildingOffice2Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1"
                      style={{ 
                        backgroundColor: `${LOCATION_TYPE_CONFIG[selectedLocation.type].color}20`, 
                        color: LOCATION_TYPE_CONFIG[selectedLocation.type].color 
                      }}
                    >
                      {LOCATION_TYPE_CONFIG[selectedLocation.type].label}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{selectedLocation.name}</h3>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{selectedLocation.address}</span>
                  </div>
                  
                  {selectedLocation.phone && (
                    <a 
                      href={`tel:${selectedLocation.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      <PhoneIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{selectedLocation.phone}</span>
                    </a>
                  )}
                  
                  {selectedLocation.email && (
                    <a 
                      href={`mailto:${selectedLocation.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      <EnvelopeIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{selectedLocation.email}</span>
                    </a>
                  )}

                  {selectedLocation.operatingHours && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-gray-700">
                        <div><strong>Thứ 2 - Thứ 6:</strong> {selectedLocation.operatingHours.weekday}</div>
                        <div><strong>Thứ 7:</strong> {selectedLocation.operatingHours.saturday}</div>
                        <div><strong>Chủ nhật:</strong> {selectedLocation.operatingHours.sunday}</div>
                      </div>
                    </div>
                  )}

                  {selectedLocation.services && selectedLocation.services.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dịch vụ:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.services.map((service) => (
                          <span 
                            key={service}
                            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <a
                    href={getDirectionsUrl(selectedLocation.coordinates.lat, selectedLocation.coordinates.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    Chỉ đường Google Maps
                  </a>
                  <a
                    href={`tel:${selectedLocation.phone || GOLDENENERGY_INFO.phone}`}
                    className="py-3 px-6 border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium rounded-xl text-center transition-colors"
                  >
                    Gọi ngay
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
