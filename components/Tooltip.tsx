'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
  iconClassName?: string;
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'top',
  showIcon = true,
  iconClassName = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let style: React.CSSProperties = {
        position: 'absolute',
        zIndex: 9999,
      };

      switch (position) {
        case 'top':
          style.bottom = '100%';
          style.left = '50%';
          style.transform = 'translateX(-50%)';
          style.marginBottom = '8px';
          break;
        case 'bottom':
          style.top = '100%';
          style.left = '50%';
          style.transform = 'translateX(-50%)';
          style.marginTop = '8px';
          break;
        case 'left':
          style.right = '100%';
          style.top = '50%';
          style.transform = 'translateY(-50%)';
          style.marginRight = '8px';
          break;
        case 'right':
          style.left = '100%';
          style.top = '50%';
          style.transform = 'translateY(-50%)';
          style.marginLeft = '8px';
          break;
      }

      setTooltipStyle(style);
    }
  }, [isVisible, position]);

  return (
    <div 
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        showIcon && (
          <HelpCircle 
            className={`w-4 h-4 text-blue-400 hover:text-blue-300 cursor-help transition-colors ${iconClassName}`}
          />
        )
      )}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg 
                     max-w-xs whitespace-normal pointer-events-none border border-white/10"
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 border-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}
