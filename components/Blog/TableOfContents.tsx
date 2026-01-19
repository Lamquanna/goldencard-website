'use client'

import { useState, useEffect, useMemo } from 'react'

interface TableOfContentsProps {
  content: string
  locale: string
}

export function TableOfContents({ content, locale }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const matches = content.matchAll(/^##\s+(.+)$/gm)
    return Array.from(matches).map((match, index) => ({
      id: `heading-${index}`,
      text: match[1].replace(/\*/g, ''),
      level: 2
    }))
  }, [content])

  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {locale === 'vi' ? 'Mục lục' : locale === 'zh' ? '目录' : locale === 'id' ? 'Daftar Isi' : 'Table of Contents'}
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block text-sm py-1 border-l-2 pl-3 transition-colors ${
                activeId === heading.id
                  ? 'border-yellow-500 text-yellow-600 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
