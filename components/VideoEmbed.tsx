"use client";
import { useState, useEffect, useRef } from "react";

interface VideoEmbedProps {
  youtubeId: string;
  startTime?: number;
  endTime?: number;
  className?: string;
  hideTitle?: boolean;
  cropTop?: boolean;
  lazyLoad?: boolean; // New: Option to lazy load
}

export default function VideoEmbed({
  youtubeId,
  startTime,
  endTime,
  className = "",
  hideTitle = true, // Default to hide title
  cropTop = true, // Default to crop to hide watermarks
  lazyLoad = true, // Default to lazy load for performance
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(!lazyLoad);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when video enters viewport
  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Load iframe when element is 200px from entering viewport
            if (entry.intersectionRatio > 0 || entry.isIntersecting) {
              setIsLoaded(true);
              observer.disconnect();
            }
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad]);

  // Build YouTube embed URL with parameters - autoplay, mute, loop, hide all UI
  const buildYouTubeUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${youtubeId}`;
    const params = new URLSearchParams({
      autoplay: '1', // Auto play
      mute: '1', // Muted
      loop: '1', // Loop video
      playlist: youtubeId, // Required for loop to work
      controls: '0', // Hide controls
      modestbranding: '1', // Minimal YouTube branding
      rel: '0', // Don't show related videos
      showinfo: '0', // Hide title and uploader
      iv_load_policy: '3', // Hide annotations
      disablekb: '1', // Disable keyboard controls
      fs: '0', // Disable fullscreen button
    });

    if (startTime !== undefined) {
      params.append('start', startTime.toString());
    }

    if (endTime !== undefined) {
      params.append('end', endTime.toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div 
        className="relative w-full overflow-hidden"
        style={{ 
          paddingBottom: cropTop ? '42%' : '56.25%', // Crop more to hide watermarks
        }}
      >
        {isLoaded ? (
          <iframe
            src={buildYouTubeUrl()}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              // Scale up and crop to hide title bar and watermarks - increased crop
              transform: cropTop ? 'scale(1.4) translateY(-8%)' : 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            loading="lazy"
            title="YouTube video player"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-white text-opacity-50">
              <svg className="animate-spin h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
