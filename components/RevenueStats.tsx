'use client'

import { useEffect, useRef, useState } from 'react'

interface StatItem {
  value: string
  unit: string
  label: string
  color: string
}

const stats: StatItem[] = [
  {
    value: '110',
    unit: 'Tỷ+',
    label: 'Doanh thu 3 năm liên tiếp',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    value: '90',
    unit: '%',
    label: 'Thị phần thẻ ETC B2B',
    color: 'from-green-400 to-emerald-500'
  },
  {
    value: '13',
    unit: '+',
    label: 'Dự án điển hình',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    value: '1',
    unit: 'MW+',
    label: 'Tổng công suất lắp đặt',
    color: 'from-purple-400 to-pink-500'
  }
]

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      if (progress < duration) {
        setCount(Math.floor((progress / duration) * end))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <>{count}</>
}

export function RevenueStats() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Thành Tích Đáng Tự Hào
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Từ năm 2009, Golden Energy (Golden Card Solution) đã khẳng định vị thế tiên phong trong ngành năng lượng sạch tại Việt Nam
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Card */}
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Value */}
                  <div className="flex items-baseline justify-center mb-2">
                    <span className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                      {isVisible ? <CountUp end={parseInt(stat.value)} /> : '0'}
                    </span>
                    <span className={`text-3xl md:text-4xl font-semibold ml-1 bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                      {stat.unit}
                    </span>
                  </div>

                  {/* Label */}
                  <p className="text-center text-gray-300 text-sm md:text-base font-medium leading-tight">
                    {stat.label}
                  </p>
                </div>

                {/* Decorative Circle */}
                <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-2xl`} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            Dữ liệu cập nhật: <span className="text-white font-semibold">2022-2024</span>
            {' '} | Nguồn:{' '}
            <span className="text-white font-semibold">Golden Card Solution Co., Ltd</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}
