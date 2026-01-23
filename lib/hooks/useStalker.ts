'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface StalkerTrigger {
  shouldTrigger: boolean;
  contextMessage: string;
}

export function useStalker(): StalkerTrigger {
  const [dwellTime, setDwellTime] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setDwellTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const depth = Math.round((scrolled / total) * 100);
      setScrollDepth(depth);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Trigger logic
  const shouldTrigger =
    !hasTriggered &&
    pathname?.includes('/san-pham') &&
    dwellTime > 30 &&
    scrollDepth > 50;

  // Context-aware message
  let contextMessage = 'Chào anh/chị! Em là tư vấn viên của Golden Energy. Có thể giúp gì cho anh/chị ạ?';

  if (pathname?.includes('/san-pham')) {
    contextMessage =
      'Anh/chị đang xem sản phẩm điện mặt trời ạ? Em có thể tư vấn chi tiết và gửi báo giá qua Zalo không ạ?';
  } else if (pathname?.includes('/tinh-toan')) {
    contextMessage =
      'Anh/chị đang tính toán hệ thống ạ? Em có thể hỗ trợ thêm về giá và chính sách lắp đặt nếu anh/chị cần!';
  } else if (pathname?.includes('/giai-phap')) {
    contextMessage =
      'Anh/chị quan tâm giải pháp nào ạ? Em có thể tư vấn chi tiết và gửi case study tương tự qua Zalo!';
  }

  if (shouldTrigger) {
    setHasTriggered(true);
  }

  return {
    shouldTrigger,
    contextMessage,
  };
}
