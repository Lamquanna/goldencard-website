'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoBannerProps {
  src: string;
  poster?: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedVideoBanner({ 
  src, 
  poster,
  className = '',
  priority = false
}: VideoBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Nếu là priority (hero video), load ngay lập tức
    if (priority) {
      setIsInView(true);
      return;
    }

    // Sử dụng Intersection Observer cho lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Ignore autoplay errors
            });
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { 
        threshold: 0.25,
        rootMargin: '50px'
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Preload video nếu là priority
  useEffect(() => {
    if (priority && videoRef.current) {
      videoRef.current.load();
    }
  }, [priority]);

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder khi video chưa load */}
      {!isLoaded && poster && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${poster})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {isInView && (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          poster={poster}
          onLoadedData={() => setIsLoaded(true)}
        >
          <source src={src} type="video/mp4" />
          {poster && (
            <img src={poster} alt="Video fallback" className="w-full h-full object-cover" />
          )}
        </video>
      )}
      
      {/* Overlay để tối ưu contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
    </div>
  );
}
